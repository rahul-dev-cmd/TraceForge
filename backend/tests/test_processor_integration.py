import sys
import logging
from datetime import datetime, timezone, timedelta
import pytest

from app.database import SessionLocal, init_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert
from ingestion.processor import process_transaction, _wallet_last_evaluated

# Support Windows console encoding for Unicode/emojis
if sys.stdout and hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass
if sys.stderr and hasattr(sys.stderr, "reconfigure"):
    try:
        sys.stderr.reconfigure(encoding="utf-8", errors="backslashreplace")
    except Exception:
        pass

# Ensure logging to stdout is configured so logger.warning messages appear with pytest -s
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    stream=sys.stdout,
    force=True
)


def ensure_wallet(db, address: str, first_seen: datetime = None) -> Wallet:
    """Helper to get or create wallet without violating UNIQUE constraint."""
    wallet = db.query(Wallet).filter(Wallet.address == address).first()
    if not wallet:
        wallet = Wallet(
            address=address,
            first_seen=first_seen or datetime.now(timezone.utc).replace(tzinfo=None),
            flagged=False
        )
        db.add(wallet)
        db.flush()
    return wallet


@pytest.fixture(autouse=True)
def setup_db():
    """Ensure database schema is ready and clear cooldown cache and test records."""
    init_db()
    _wallet_last_evaluated.clear()

    # Clean up test alerts and transactions for isolated testing
    db = SessionLocal()
    try:
        for prefix in ["0x9999%", "0x8888%", "0x7777%", "0x6666%"]:
            db.query(Alert).filter(Alert.wallet_address.like(prefix)).delete(synchronize_session=False)
            db.query(Transaction).filter(Transaction.from_address.like(prefix)).delete(synchronize_session=False)
            db.query(Transaction).filter(Transaction.to_address.like(prefix)).delete(synchronize_session=False)
            db.query(Wallet).filter(Wallet.address.like(prefix)).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

    yield

    _wallet_last_evaluated.clear()


@pytest.mark.asyncio
async def test_real_fan_out_aml_alert_end_to_end():
    """
    Integration test: Real FlaggingService evaluation without mocks.
    
    Fan-out heuristic condition:
      - 10+ distinct outgoing destination addresses within any rolling 24-hour window.
    
    Setup:
      - Seed 9 distinct outgoing transactions directly into the database.
      - Send the 10th transaction through process_transaction().
      - Real FlaggingService evaluates wallet history, triggers fan_out_flag, and creates an Alert row.
    """
    sender = "0x9999999999999999999999999999999999999999"
    base_time = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=45)

    # 1. Seed 9 distinct outgoing transactions directly in DB
    db = SessionLocal()
    try:
        ensure_wallet(db, sender, base_time)

        for i in range(1, 10):
            recipient = f"0x888888888888888888888888888888888888{i:04d}"
            tx_time = base_time + timedelta(minutes=i * 3)

            ensure_wallet(db, recipient, tx_time)
            db.add(Transaction(
                tx_hash=f"0xseeded_fan_out_tx_{i:04d}",
                from_address=sender,
                to_address=recipient,
                amount=0.55,  # >= 0.1 ETH threshold, non-round to specifically isolate fan-out
                timestamp=tx_time
            ))
        db.commit()
    finally:
        db.close()

    # 2. Trigger transaction: 10th distinct destination sent via real process_transaction()
    trigger_recipient = "0x8888888888888888888888888888888888880010"
    trigger_tx = {
        "hash": "0xreal_trigger_tx_10_fanout",
        "sender": sender,
        "receiver": trigger_recipient,
        "value": 0.55,
        "gas_price": 25000000000,
    }

    await process_transaction(trigger_tx)

    # 3. Query DB to verify real Alert creation
    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.wallet_address == sender).first()
        updated_wallet = db.query(Wallet).filter(Wallet.address == sender).first()

        assert alert is not None, "Real AML Alert was not created in the database!"
        assert "fan_out" in alert.reason, f"Expected 'fan_out' in reason, got: {alert.reason}"
        assert alert.severity in ["high", "critical"], f"Unexpected severity: {alert.severity}"
        assert updated_wallet.flagged is True, "Wallet.flagged was not set to True in DB!"

        # Print alert details clearly
        print("\n" + "=" * 64)
        print("  [DEMO VERIFICATION] REAL AML ALERT TRIGGERED END-TO-END")
        print("=" * 64)
        print(f"  Alert ID:     {alert.id}")
        print(f"  Wallet:       {alert.wallet_address}")
        print(f"  Severity:     {alert.severity.upper()}")
        print(f"  Reason:       {alert.reason}")
        print(f"  Risk Score:   {alert.risk_score}")
        print(f"  Trigger Tx:   {alert.tx_hash}")
        print(f"  Timestamp:    {alert.created_at}")
        print(f"  DB Flagged:   {updated_wallet.flagged}")
        print("=" * 64 + "\n")
    finally:
        db.close()


@pytest.mark.asyncio
async def test_real_round_amount_aml_alert_end_to_end():
    """
    Integration test: Real FlaggingService evaluation for round-amount structuring.
    
    Round amount heuristic condition:
      - 3+ transactions with exact round amounts (>= 1.0 ETH).
    
    Setup:
      - Seed 2 round-amount transactions (5.0 ETH, 10.0 ETH).
      - Send 3rd round-amount transaction (20.0 ETH) via process_transaction().
      - Assert Alert created with reason containing 'round_amount'.
    """
    sender = "0x7777777777777777777777777777777777777777"
    other_party = "0x6666666666666666666666666666666666666666"
    now = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(minutes=20)

    # 1. Seed 2 round transactions
    db = SessionLocal()
    try:
        ensure_wallet(db, sender, now)
        ensure_wallet(db, other_party, now)

        db.add(Transaction(
            tx_hash="0xseeded_round_tx_1",
            from_address=sender,
            to_address=other_party,
            amount=5.0,
            timestamp=now
        ))
        db.add(Transaction(
            tx_hash="0xseeded_round_tx_2",
            from_address=other_party,
            to_address=sender,
            amount=10.0,
            timestamp=now + timedelta(minutes=5)
        ))
        db.commit()
    finally:
        db.close()

    # 2. Trigger 3rd round transaction via real process_transaction()
    trigger_tx = {
        "hash": "0xreal_trigger_tx_3_round",
        "sender": sender,
        "receiver": other_party,
        "value": 20.0,
        "gas_price": 20000000000,
    }

    await process_transaction(trigger_tx)

    # 3. Verify real Alert creation
    db = SessionLocal()
    try:
        alert = db.query(Alert).filter(Alert.wallet_address == sender).first()
        assert alert is not None, "Real round-amount Alert was not created in the database!"
        assert "round_amount" in alert.reason, f"Expected 'round_amount' in reason, got: {alert.reason}"

        print("\n" + "=" * 64)
        print("  [DEMO VERIFICATION] REAL ROUND-AMOUNT ALERT TRIGGERED")
        print("=" * 64)
        print(f"  Alert ID:     {alert.id}")
        print(f"  Wallet:       {alert.wallet_address}")
        print(f"  Severity:     {alert.severity.upper()}")
        print(f"  Reason:       {alert.reason}")
        print(f"  Risk Score:   {alert.risk_score}")
        print(f"  Trigger Tx:   {alert.tx_hash}")
        print("=" * 64 + "\n")
    finally:
        db.close()
