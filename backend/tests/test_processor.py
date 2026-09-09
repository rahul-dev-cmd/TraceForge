import asyncio
import pytest
from unittest.mock import patch
from app.database import SessionLocal, init_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert
from ingestion.processor import process_transaction, _wallet_last_evaluated


@pytest.fixture(autouse=True)
def setup_db():
    init_db()
    _wallet_last_evaluated.clear()
    yield
    _wallet_last_evaluated.clear()


@pytest.mark.asyncio
async def test_process_transaction_persists_wallets_and_tx():
    sender = "0x1111111111111111111111111111111111111111"
    receiver = "0x2222222222222222222222222222222222222222"
    tx_hash = "0xtesthash0001"

    tx = {
        "hash": tx_hash,
        "sender": sender,
        "receiver": receiver,
        "value": 1.5,
        "gas_price": 20000000000,
    }

    await process_transaction(tx)

    db = SessionLocal()
    try:
        w_sender = db.query(Wallet).filter(Wallet.address == sender).first()
        w_recv = db.query(Wallet).filter(Wallet.address == receiver).first()
        saved_tx = db.query(Transaction).filter(Transaction.tx_hash == tx_hash).first()

        assert w_sender is not None
        assert w_recv is not None
        assert saved_tx is not None
        assert saved_tx.amount == 1.5
    finally:
        db.close()


@pytest.mark.asyncio
async def test_process_transaction_avoids_duplicate_tx():
    sender = "0x1111111111111111111111111111111111111111"
    receiver = "0x2222222222222222222222222222222222222222"
    tx_hash = "0xduplicatehash0002"

    tx = {
        "hash": tx_hash,
        "sender": sender,
        "receiver": receiver,
        "value": 0.5,
    }

    # Call twice
    await process_transaction(tx)
    await process_transaction(tx)

    db = SessionLocal()
    try:
        count = db.query(Transaction).filter(Transaction.tx_hash == tx_hash).count()
        assert count == 1
    finally:
        db.close()


@pytest.mark.asyncio
async def test_process_transaction_creates_alert_on_flag():
    sender = "0x3333333333333333333333333333333333333333"
    receiver = "0x4444444444444444444444444444444444444444"
    tx_hash = "0xalerttest0003"

    tx = {
        "hash": tx_hash,
        "sender": sender,
        "receiver": receiver,
        "value": 2.0,
    }

    mock_eval = {
        "address": sender,
        "flags": [
            {"type": "fan_out", "triggered": True, "reason": "Fan-out detected"},
            {"type": "round_amount", "triggered": True, "reason": "Round amount detected"},
        ],
        "risk_score": 0.92,
        "overall_flagged": True,
    }

    with patch("ingestion.processor.FlaggingService.evaluate_wallet", return_value=mock_eval) as mock_flag:
        await process_transaction(tx)
        assert mock_flag.called

    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.tx_hash == tx_hash).first()
        assert alert is not None
        assert alert.wallet_address == sender
        assert "fan_out" in alert.reason
        assert "round_amount" in alert.reason
        assert "high_ml_risk" in alert.reason
        assert alert.severity == "critical"
        assert alert.risk_score == 0.92
    finally:
        db.close()


@pytest.mark.asyncio
async def test_process_transaction_cooldown():
    sender = "0x5555555555555555555555555555555555555555"
    receiver = "0x6666666666666666666666666666666666666666"

    mock_eval = {
        "address": sender,
        "flags": [],
        "risk_score": 0.1,
        "overall_flagged": False,
    }

    with patch("ingestion.processor.FlaggingService.evaluate_wallet", return_value=mock_eval) as mock_flag:
        # First call evaluates
        await process_transaction({"hash": "0xtx1", "sender": sender, "receiver": receiver, "value": 1.0})
        assert mock_flag.call_count == 1

        # Second call within 30s skips evaluate_wallet
        await process_transaction({"hash": "0xtx2", "sender": sender, "receiver": receiver, "value": 1.0})
        assert mock_flag.call_count == 1


@pytest.mark.asyncio
async def test_process_transaction_handles_bad_data_gracefully():
    # Incomplete or invalid data should not raise exception
    await process_transaction({})
    await process_transaction({"hash": None, "sender": None})
    await process_transaction({"hash": "0xbadtx", "sender": "invalid", "value": "not-a-number"})


@pytest.mark.asyncio
async def test_process_transaction_skips_low_value():
    sender = "0x7777777777777777777777777777777777777777"
    receiver = "0x8888888888888888888888888888888888888888"
    tx_hash = "0xlowvaluetx0001"

    # Transaction with 0.05 ETH (< 0.1 ETH threshold)
    await process_transaction({
        "hash": tx_hash,
        "sender": sender,
        "receiver": receiver,
        "value": 0.05,
    })

    db = SessionLocal()
    try:
        saved_tx = db.query(Transaction).filter(Transaction.tx_hash == tx_hash).first()
        assert saved_tx is None
    finally:
        db.close()

