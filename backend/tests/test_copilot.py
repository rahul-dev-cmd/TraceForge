from datetime import datetime, timezone
from unittest.mock import patch, MagicMock
import pytest
import httpx

from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.attribution import WalletAttribution


def test_copilot_invalid_address(test_client):
    res = test_client.post(
        "/copilot/query",
        json={"address": "0xinvalid", "question": "Why is this flagged?"}
    )
    assert res.status_code == 400
    assert "Invalid Ethereum address format" in res.json()["detail"]


def test_copilot_empty_question(test_client):
    res = test_client.post(
        "/copilot/query",
        json={"address": "0x0000000000000000000000000000000000000001", "question": "   "}
    )
    assert res.status_code == 400
    assert "Question query text cannot be empty" in res.json()["detail"]


def test_copilot_not_ingested_wallet(test_client):
    target = "0x0000000000000000000000000000000000000099"
    res = test_client.post(
        "/copilot/query",
        json={"address": target, "question": "Summarize this wallet"}
    )
    assert res.status_code == 200
    data = res.json()
    assert "has not been ingested or traced yet" in data["text"]
    assert data["grounded_on"]["status"] == "not_ingested"


def test_copilot_success_mocked_llm(test_client, db_session):
    target = "0x00000000000000000000000000000000000000aa"
    now = datetime.now(timezone.utc)

    # 1. Populate wallet & transactions
    db_session.add(Wallet(address=target, first_seen=now, flagged=True))
    db_session.add(Transaction(
        tx_hash="0xtx1",
        from_address=target,
        to_address="0x00000000000000000000000000000000000000bb",
        amount=10.0,
        timestamp=now
    ))
    db_session.add(Transaction(
        tx_hash="0xtx2",
        from_address=target,
        to_address="0x00000000000000000000000000000000000000cc",
        amount=5.0,
        timestamp=now
    ))
    db_session.add(Transaction(
        tx_hash="0xtx3",
        from_address=target,
        to_address="0x00000000000000000000000000000000000000dd",
        amount=2.0,
        timestamp=now
    ))
    # Attribution
    db_session.add(WalletAttribution(
        address=target,
        tags=["sanctioned", "ofac"],
        raw_results=[{"title": "OFAC Sanctions", "snippet": "Lazarus tie", "link": "https://ofac.gov", "domain": "ofac.gov"}],
        fetched_at=now
    ))
    db_session.commit()

    mock_resp = MagicMock()
    mock_resp.status_code = 200
    mock_resp.json.return_value = {
        "choices": [
            {
                "message": {
                    "content": "Target wallet is flagged due to round-amount structuring (10.0, 5.0, 2.0 ETH) and OFAC sanctions."
                }
            }
        ]
    }

    with patch("app.services.copilot.httpx.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_resp

        res = test_client.post(
            "/copilot/query",
            json={
                "address": target,
                "question": "Why is this wallet flagged?",
                "conversation_history": [{"role": "user", "content": "Hello"}]
            }
        )

        assert res.status_code == 200
        data = res.json()
        assert "round-amount structuring" in data["text"]
        assert data["grounded_on"]["address"] == target
        assert data["grounded_on"]["transaction_count"] == 3
        assert "round_amount" in data["grounded_on"]["triggered_flags"]
        assert "sanctioned" in data["grounded_on"]["attribution_tags"]


def test_copilot_llm_timeout_handled(test_client, db_session):
    target = "0x00000000000000000000000000000000000000bb"
    now = datetime.now(timezone.utc)
    db_session.add(Wallet(address=target, first_seen=now, flagged=False))
    db_session.add(Transaction(
        tx_hash="0xtx_timeout",
        from_address=target,
        to_address="0x00000000000000000000000000000000000000cc",
        amount=1.5,
        timestamp=now
    ))
    db_session.commit()

    with patch("app.services.copilot.httpx.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_instance
        mock_instance.post.side_effect = httpx.TimeoutException("Timeout")

        res = test_client.post(
            "/copilot/query",
            json={"address": target, "question": "Analyze this wallet"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "timed out" in data["text"]
        assert data["grounded_on"]["error"] == "timeout"


def test_copilot_llm_rate_limit_handled(test_client, db_session):
    target = "0x00000000000000000000000000000000000000cc"
    now = datetime.now(timezone.utc)
    db_session.add(Wallet(address=target, first_seen=now, flagged=False))
    db_session.add(Transaction(
        tx_hash="0xtx_ratelimit",
        from_address=target,
        to_address="0x00000000000000000000000000000000000000dd",
        amount=1.5,
        timestamp=now
    ))
    db_session.commit()

    mock_resp = MagicMock()
    mock_resp.status_code = 429
    mock_resp.text = "Rate limit reached"

    with patch("app.services.copilot.httpx.Client") as mock_client_cls:
        mock_instance = MagicMock()
        mock_client_cls.return_value.__enter__.return_value = mock_instance
        mock_instance.post.return_value = mock_resp

        res = test_client.post(
            "/copilot/query",
            json={"address": target, "question": "Analyze this wallet"}
        )
        assert res.status_code == 200
        data = res.json()
        assert "rate limit exceeded" in data["text"]
        assert data["grounded_on"]["error"] == "rate_limited"
