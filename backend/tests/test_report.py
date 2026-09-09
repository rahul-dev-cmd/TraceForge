from datetime import datetime, timezone
import pytest
from app.models.wallet import Wallet
from app.models.transaction import Transaction


def test_report_success(test_client, db_session):
    target_addr = "0x6666666666666666666666666666666666666666"
    counterparty = "0x7777777777777777777777777777777777777777"
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    db_session.add(Wallet(address=target_addr, first_seen=now, flagged=True))
    db_session.add(Wallet(address=counterparty, first_seen=now, flagged=False))

    db_session.add(Transaction(
        tx_hash="0xreptx1",
        from_address=target_addr,
        to_address=counterparty,
        amount=10.0,
        timestamp=now
    ))
    db_session.add(Transaction(
        tx_hash="0xreptx2",
        from_address=counterparty,
        to_address=target_addr,
        amount=5.5,
        timestamp=now
    ))
    db_session.commit()

    res = test_client.get(f"/report/{target_addr}")
    assert res.status_code == 200
    assert res.headers["content-type"] == "application/pdf"
    assert f'attachment; filename="report_{target_addr}.pdf"' in res.headers["content-disposition"]
    
    # Verify PDF content (starts with PDF magic bytes %PDF)
    pdf_bytes = res.content
    assert len(pdf_bytes) > 500
    assert pdf_bytes.startswith(b"%PDF")


def test_report_not_ingested(test_client):
    unseen_addr = "0x9999999999999999999999999999999999999999"
    res = test_client.get(f"/report/{unseen_addr}")
    assert res.status_code == 404
    assert "has not been ingested yet" in res.json()["detail"]


def test_report_invalid_address(test_client):
    res = test_client.get("/report/not_an_eth_address")
    assert res.status_code == 400
    assert "Invalid Ethereum address format" in res.json()["detail"]
