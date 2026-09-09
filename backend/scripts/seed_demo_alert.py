"""
=============================================================================
TRACEFORGE DEMO SEED SCRIPT: Guaranteed AML Fan-Out Alert
=============================================================================
FOR PRESENTATION / HACKATHON DEMO PURPOSES ONLY.
NOT FOR AUTOMATED PRODUCTION USE.

This script seeds a synthetic Ethereum wallet with 12 outgoing transactions
to distinct destination addresses within the last few hours, satisfying the
AML heuristic 'fan_out_flag' rule (10+ distinct destinations within 24 hours).

It then executes TraceForge's REAL flagging logic (FlaggingService.evaluate_wallet)
to evaluate the transactions and persist a verified Alert row into the database.
Both the live transaction listener (processor.py) and this demo seed script route
through the exact same alert-creation code path, ensuring accurate reason,
severity, and ML risk scoring.

Idempotency:
  Checks if the synthetic wallet already exists before inserting.
  If present, skips duplicate seeding and displays the existing alert details.

Usage:
  From backend directory:
    python scripts/seed_demo_alert.py
  From project root:
    python backend/scripts/seed_demo_alert.py
=============================================================================
"""

import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

# Support Windows console encoding for characters and emojis
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

# Add backend directory to sys.path so 'app' and 'ingestion' imports resolve
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, init_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.services.flagging import FlaggingService
from app.services.etherscan import normalize_address

# Deterministic synthetic wallet addresses (clearly marked demo addresses, valid 42-char hex)
DEMO_SENDER_WALLET = "0xde30a1e470000000000000000000000000000001"
DEMO_DESTINATIONS = [
    f"0xde30d0000000000000000000000000000000{i:04d}"
    for i in range(1, 13)
]

# Realistic, non-round ETH transaction values (isolates fan-out without triggering round_amount)
AMOUNTS = [
    0.842, 1.315, 0.492, 2.147, 0.628, 1.774,
    0.953, 1.205, 0.418, 2.063, 1.485, 0.739
]


def print_alert_card(alert: Alert, wallet: Wallet = None, title: str = "REAL AML ALERT TRIGGERED END-TO-END"):
    """Format and display alert details clearly in the console."""
    print("\n" + "=" * 68)
    print(f"  [ALERT] [DEMO VERIFICATION] {title}")
    print("=" * 68)
    print(f"  Alert ID:       {alert.id}")
    print(f"  Wallet Address: {alert.wallet_address}")
    print(f"  Reason:         {alert.reason}")
    print(f"  Severity:       {alert.severity.upper()}")
    print(f"  Risk Score:     {alert.risk_score}")
    print(f"  Trigger Tx:     {alert.tx_hash}")
    print(f"  Created At:     {alert.created_at}")
    if wallet:
        print(f"  Wallet Flagged: {wallet.flagged}")
    print("=" * 68 + "\n")


def seed_demo_fanout_alert():
    """Seed synthetic wallet & transactions and trigger real FlaggingService evaluation."""
    print("[TraceForge Demo Seed] Initializing database schema...")
    init_db()
    db = SessionLocal()

    try:
        norm_sender = normalize_address(DEMO_SENDER_WALLET)

        # -------------------------------------------------------------
        # Step 6: Idempotency check - skip if synthetic wallet already exists
        # -------------------------------------------------------------
        existing_wallet = db.query(Wallet).filter(Wallet.address == norm_sender).first()
        if existing_wallet:
            print(f"\n[TraceForge Demo Seed] Synthetic wallet '{norm_sender}' already exists in database.")
            existing_alert = (
                db.query(Alert)
                .filter(Alert.wallet_address == norm_sender)
                .order_by(Alert.id.desc())
                .first()
            )
            if existing_alert:
                print("[TraceForge Demo Seed] Verified demo alert already present. Skipping duplicate seeding.")
                print_alert_card(existing_alert, existing_wallet, title="EXISTING DEMO ALERT FOUND")
                return existing_alert
            else:
                print("[TraceForge Demo Seed] Wallet found without Alert row. Evaluating to generate alert...")
                eval_res = FlaggingService.evaluate_wallet(db, norm_sender, create_alert=True)
                new_alert = eval_res.get("alert") or db.query(Alert).filter(Alert.wallet_address == norm_sender).first()
                if new_alert:
                    print_alert_card(new_alert, existing_wallet, title="DEMO ALERT GENERATED FROM EXISTING DATA")
                return new_alert

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        base_time = now - timedelta(hours=2)

        print(f"[TraceForge Demo Seed] Generating synthetic demo wallet: {norm_sender}")

        # -------------------------------------------------------------
        # Step 3: Ensure Wallet rows exist for sender and all destinations
        # -------------------------------------------------------------
        sender_wallet = Wallet(address=norm_sender, first_seen=base_time, flagged=False)
        db.add(sender_wallet)
        db.flush()

        for i, dest_addr in enumerate(DEMO_DESTINATIONS):
            norm_dest = normalize_address(dest_addr)
            if not db.query(Wallet).filter(Wallet.address == norm_dest).first():
                dest_wallet = Wallet(
                    address=norm_dest,
                    first_seen=base_time + timedelta(minutes=8 * i),
                    flagged=False
                )
                db.add(dest_wallet)
        db.flush()

        # -------------------------------------------------------------
        # Step 2: Insert 12 synthetic Transaction rows directly into DB
        #         (satisfies fan_out_flag: 10+ distinct destinations in 24h)
        # -------------------------------------------------------------
        latest_tx_hash = None
        for i in range(12):
            tx_hash = f"0xde30_fanout_demo_tx_{i + 1:04d}"
            norm_dest = normalize_address(DEMO_DESTINATIONS[i])
            tx_time = base_time + timedelta(minutes=8 * i)
            amt = AMOUNTS[i]

            db.add(Transaction(
                tx_hash=tx_hash,
                from_address=norm_sender,
                to_address=norm_dest,
                amount=amt,
                timestamp=tx_time
            ))
            latest_tx_hash = tx_hash

        db.commit()
        print(f"[TraceForge Demo Seed] Inserted 12 synthetic fan-out transactions directly into DB.")

        # -------------------------------------------------------------
        # Step 4: Call FlaggingService.evaluate_wallet(db, address)
        #         Uses real flagging heuristics & ML scoring to create real Alert
        # -------------------------------------------------------------
        print(f"[TraceForge Demo Seed] Executing real FlaggingService.evaluate_wallet() on {norm_sender}...")
        eval_res = FlaggingService.evaluate_wallet(
            db=db,
            address=norm_sender,
            create_alert=True,
            tx_hash=latest_tx_hash
        )

        alert = eval_res.get("alert")
        if not alert:
            alert = FlaggingService.create_alert_from_eval(db, eval_res, tx_hash=latest_tx_hash)

        # Refresh wallet flagged status
        updated_wallet = db.query(Wallet).filter(Wallet.address == norm_sender).first()

        # -------------------------------------------------------------
        # Step 5: Print out the resulting alert (reason, severity, risk score)
        # -------------------------------------------------------------
        if alert:
            print_alert_card(alert, updated_wallet, title="REAL AML FAN-OUT ALERT CREATED")
            return alert
        else:
            print("[TraceForge Demo Seed] ERROR: Evaluation completed but alert was not created.")
            return None

    except Exception as exc:
        db.rollback()
        print(f"[TraceForge Demo Seed] ERROR: Failed to seed demo alert: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_fanout_alert()
