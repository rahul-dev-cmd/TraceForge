from datetime import datetime, timezone, timedelta
from unittest.mock import patch
import pytest

from app.models.attribution import WalletAttribution
from app.services.attribution import classify_results, AttributionAPIError


def test_classify_results_keywords_and_exchanges():
    sample_results = [
        {
            "title": "Phishing Alert: Malicious Contract",
            "snippet": "This address was involved in a major hack and scam report.",
            "link": "https://scamsniffer.io/alert/123",
            "domain": "scamsniffer.io"
        },
        {
            "title": "OFAC Sanctioned Lazarus Group Wallet",
            "snippet": "Added to SDN list for stolen crypto laundering via ponzi and rug pull scheme.",
            "link": "https://elliptic.co/blog/ofac",
            "domain": "elliptic.co"
        },
        {
            "title": "Binance Deposit Address",
            "snippet": "Transfer confirmed to exchange wallet.",
            "link": "https://binance.com/tx/abc",
            "domain": "binance.com"
        }
    ]

    classification = classify_results(sample_results)
    tags = classification["tags"]

    assert classification["result_count"] == 3
    assert "phishing" in tags
    assert "hack" in tags
    assert "scam" in tags
    assert "sanctioned" in tags
    assert "ofac" in tags
    assert "sdn_list" in tags
    assert "lazarus" in tags
    assert "stolen" in tags
    assert "ponzi" in tags
    assert "rug_pull" in tags
    assert "exchange_related" in tags


def test_classify_results_clean():
    clean_results = [
        {
            "title": "Personal Project Contract",
            "snippet": "Open source developer deployment notes.",
            "link": "https://github.com/developer/project",
            "domain": "github.com"
        }
    ]
    classification = classify_results(clean_results)
    assert classification["result_count"] == 1
    assert classification["tags"] == []


def test_attribute_invalid_address(test_client):
    res = test_client.get("/attribute/not-an-eth-address")
    assert res.status_code == 400
    assert "Invalid Ethereum address format" in res.json()["detail"]


def test_attribute_cache_hit(test_client, db_session):
    test_addr = "0x0000000000000000000000000000000000000001"
    now = datetime.now(timezone.utc)

    # Pre-populate database with cached attribution from 2 days ago
    cached_entry = WalletAttribution(
        address=test_addr,
        tags=["scam", "exchange_related"],
        raw_results=[
            {
                "title": "Cached Title",
                "snippet": "Cached Snippet",
                "link": "https://etherscan.io/address/0x001",
                "domain": "etherscan.io"
            }
        ],
        fetched_at=now - timedelta(days=2)
    )
    db_session.add(cached_entry)
    db_session.commit()

    with patch("app.routers.attribution.google_search_wallet") as mock_search:
        res = test_client.get(f"/attribute/{test_addr}")
        assert res.status_code == 200
        data = res.json()
        assert data["address"] == test_addr
        assert data["classification"]["tags"] == ["scam", "exchange_related"]
        assert len(data["sources"]) == 1
        assert data["sources"][0]["title"] == "Cached Title"
        mock_search.assert_not_called()


def test_attribute_cache_expired(test_client, db_session):
    test_addr = "0x0000000000000000000000000000000000000002"
    now = datetime.now(timezone.utc)

    # Pre-populate database with cached attribution from 8 days ago (expired)
    stale_entry = WalletAttribution(
        address=test_addr,
        tags=["old_tag"],
        raw_results=[],
        fetched_at=now - timedelta(days=8)
    )
    db_session.add(stale_entry)
    db_session.commit()

    mocked_results = [
        {
            "title": "Fresh Google Result",
            "snippet": "Phishing detection",
            "link": "https://scamsniffer.io/fresh",
            "domain": "scamsniffer.io"
        }
    ]

    with patch("app.routers.attribution.google_search_wallet", return_value=mocked_results) as mock_search:
        res = test_client.get(f"/attribute/{test_addr}")
        assert res.status_code == 200
        data = res.json()
        assert data["classification"]["tags"] == ["phishing"]
        assert len(data["sources"]) == 1
        assert data["sources"][0]["title"] == "Fresh Google Result"
        mock_search.assert_called_once()

    # Verify updated in database
    refreshed = db_session.query(WalletAttribution).filter_by(address=test_addr).first()
    assert "phishing" in refreshed.tags


def test_attribute_google_error_graceful(test_client):
    test_addr = "0x0000000000000000000000000000000000000003"
    with patch(
        "app.routers.attribution.google_search_wallet",
        side_effect=AttributionAPIError("Quota exceeded for project", status_code=429)
    ):
        res = test_client.get(f"/attribute/{test_addr}")
        assert res.status_code == 429
        assert "Attribution lookup unavailable" in res.json()["detail"]
