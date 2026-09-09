"""
TraceForge - Seed Demo Suspicious AML Wallets for Hackathon Testing
Run: .venv\\Scripts\\python.exe seed_demo_flags.py
"""

from datetime import datetime, timezone, timedelta
from app.database import SessionLocal, init_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction


def seed_demo_wallets():
    init_db()
    db = SessionLocal()
    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # -------------------------------------------------------------
    # 1. FAN-OUT DEMO WALLET (0x7777777777777777777777777777777777777777)
    # Sends transactions to 12 distinct destination addresses in 2 hours
    # -------------------------------------------------------------
    fan_out_wallet = "0x7777777777777777777777777777777777777777"
    if not db.query(Wallet).filter(Wallet.address == fan_out_wallet).first():
        db.add(Wallet(address=fan_out_wallet, first_seen=now, flagged=False))

    for i in range(1, 13):
        dest_addr = f"0x{i:040x}"
        if not db.query(Wallet).filter(Wallet.address == dest_addr).first():
            db.add(Wallet(address=dest_addr, first_seen=now, flagged=False))

        tx_hash = f"0xfanout_demo_tx_{i:04d}"
        if not db.query(Transaction).filter(Transaction.tx_hash == tx_hash).first():
            db.add(Transaction(
                tx_hash=tx_hash,
                from_address=fan_out_wallet,
                to_address=dest_addr,
                amount=1.25,
                timestamp=now - timedelta(hours=2) + timedelta(minutes=5 * i)
            ))

    # -------------------------------------------------------------
    # 2. RAPID PASS-THROUGH DEMO WALLET (0x8888888888888888888888888888888888888888)
    # Receives 50.0 ETH and forwards 48.5 ETH (97%) 3 minutes later
    # -------------------------------------------------------------
    passthrough_wallet = "0x8888888888888888888888888888888888888888"
    source_wallet = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    dest_wallet = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"

    for addr in [passthrough_wallet, source_wallet, dest_wallet]:
        if not db.query(Wallet).filter(Wallet.address == addr).first():
            db.add(Wallet(address=addr, first_seen=now, flagged=False))

    in_tx_hash = "0xpassthrough_demo_in_01"
    if not db.query(Transaction).filter(Transaction.tx_hash == in_tx_hash).first():
        db.add(Transaction(
            tx_hash=in_tx_hash,
            from_address=source_wallet,
            to_address=passthrough_wallet,
            amount=50.0,
            timestamp=now - timedelta(minutes=15)
        ))

    out_tx_hash = "0xpassthrough_demo_out_01"
    if not db.query(Transaction).filter(Transaction.tx_hash == out_tx_hash).first():
        db.add(Transaction(
            tx_hash=out_tx_hash,
            from_address=passthrough_wallet,
            to_address=dest_wallet,
            amount=48.5,
            timestamp=now - timedelta(minutes=12)  # 3 minutes after receipt
        ))

    db.commit()
    db.close()
    print("Demo suspicious wallets seeded successfully!")
    print("1. Fan-out Demo Wallet:            0x7777777777777777777777777777777777777777")
    print("2. Rapid Pass-through Demo Wallet: 0x8888888888888888888888888888888888888888")


if __name__ == "__main__":
    seed_demo_wallets()
