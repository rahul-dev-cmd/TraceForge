import time
import logging
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from app.database import SessionLocal
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.services.etherscan import normalize_address
from app.services.flagging import FlaggingService

logger = logging.getLogger("ingestion.processor")

# Minimum transaction value in ETH to process
MIN_VALUE_ETH = 0.1

# In-memory cooldown cache: wallet_address -> timestamp of last evaluation
COOLDOWN_SECONDS = 30
_wallet_last_evaluated: Dict[str, float] = {}


async def process_transaction(tx: Dict[str, Any]) -> None:
    """
    Process an incoming parsed Ethereum transaction from the live listener:
      1. Open a DB session.
      2. Ensure Wallet rows exist for sender and receiver (if present).
      3. Insert a Transaction row (skip duplicate tx_hash).
      4. Evaluate AML heuristics and ML risk score via FlaggingService
         (subject to a 30s in-memory cooldown per wallet address).
      5. Create an Alert row if any rule is triggered or ML risk score >= 0.7.
      6. Commit and close the session.
    """
    tx_hash = tx.get("hash") or tx.get("tx_hash")
    from_raw = tx.get("sender") or tx.get("from_address") or tx.get("from")
    to_raw = tx.get("receiver") or tx.get("to_address") or tx.get("to")

    from_addr = normalize_address(from_raw)
    to_addr = normalize_address(to_raw)

    raw_val = tx.get("value") if tx.get("value") is not None else tx.get("amount", 0.0)
    try:
        amount = float(raw_val or 0.0)
    except (ValueError, TypeError):
        amount = 0.0

    # Log incoming transaction
    logger.info(
        f"[Live Tx] Hash: {tx_hash} | "
        f"From: {from_addr} -> To: {to_addr} | "
        f"Value: {amount:.6f} ETH | "
        f"Gas Price: {tx.get('gas_price')} wei"
    )

    if amount < MIN_VALUE_ETH:
        logger.debug(f"Skipping low-value transaction {tx_hash} ({amount:.6f} ETH < {MIN_VALUE_ETH} ETH threshold)")
        return

    if not tx_hash or not from_addr:
        logger.debug(f"Skipping incomplete transaction (hash={tx_hash}, from={from_addr})")
        return

    # a. Open a DB session
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc).replace(tzinfo=None)

        # b. Ensure Wallet rows exist for both from_address and to_address
        sender_wallet = db.query(Wallet).filter(Wallet.address == from_addr).first()
        if not sender_wallet:
            sender_wallet = Wallet(address=from_addr, first_seen=now, flagged=False)
            db.add(sender_wallet)
            db.flush()

        if to_addr:
            receiver_wallet = db.query(Wallet).filter(Wallet.address == to_addr).first()
            if not receiver_wallet:
                receiver_wallet = Wallet(address=to_addr, first_seen=now, flagged=False)
                db.add(receiver_wallet)
                db.flush()

        # c. Insert a Transaction row for this tx (skip if tx_hash already exists)
        existing_tx = db.query(Transaction.tx_hash).filter(Transaction.tx_hash == tx_hash).first()
        if not existing_tx:
            new_tx = Transaction(
                tx_hash=tx_hash,
                from_address=from_addr,
                to_address=to_addr,
                amount=amount,
                timestamp=now,
            )
            db.add(new_tx)
            db.flush()

        # Commit wallet and transaction records
        db.commit()

        # Check in-memory cooldown before running ML and rule evaluation
        current_time = time.time()
        last_eval = _wallet_last_evaluated.get(from_addr, 0.0)

        if current_time - last_eval >= COOLDOWN_SECONDS:
            # Update cooldown timestamp
            _wallet_last_evaluated[from_addr] = current_time

            # Housekeeping: prune old entries if cache exceeds 10,000 wallets
            if len(_wallet_last_evaluated) > 10000:
                cutoff = current_time - COOLDOWN_SECONDS
                for k in list(_wallet_last_evaluated.keys()):
                    if _wallet_last_evaluated[k] < cutoff:
                        del _wallet_last_evaluated[k]

            # d. Call FlaggingService.evaluate_wallet(db, from_address)
            try:
                eval_res = FlaggingService.evaluate_wallet(db, from_addr)
            except ValueError as val_err:
                logger.debug(f"Wallet evaluation skipped for {from_addr}: {val_err}")
                eval_res = None

            # e. If any rule is flagged or ML score >= 0.7, create an Alert row
            if eval_res:
                triggered_rules = [
                    f.get("type", "unknown")
                    for f in eval_res.get("flags", [])
                    if f.get("triggered")
                ]
                ml_score = eval_res.get("risk_score")
                has_high_ml = ml_score is not None and ml_score >= 0.7

                if triggered_rules or has_high_ml:
                    reasons = list(triggered_rules)
                    if has_high_ml and "high_ml_risk" not in reasons:
                        reasons.append("high_ml_risk")
                    reason_str = ", ".join(reasons)

                    # Derive severity from ML score and rule trigger count
                    if (ml_score is not None and ml_score >= 0.85) or len(triggered_rules) >= 2:
                        severity = "critical"
                    elif (ml_score is not None and ml_score >= 0.7) or len(triggered_rules) == 1:
                        severity = "high"
                    elif ml_score is not None and ml_score >= 0.5:
                        severity = "medium"
                    else:
                        severity = "low"

                    alert = Alert(
                        wallet_address=from_addr,
                        tx_hash=tx_hash,
                        reason=reason_str,
                        severity=severity,
                        risk_score=ml_score,
                        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                    )
                    db.add(alert)
                    db.commit()

                    # g. Log clearly when an alert is created
                    logger.warning(
                        f"🚨 [AML ALERT CREATED] Address: {from_addr} | "
                        f"Severity: {severity.upper()} | Reason: {reason_str} | "
                        f"Risk Score: {ml_score} | Tx: {tx_hash}"
                    )

    # h. Wrap all of this in try/except so one bad transaction doesn't crash the listener
    except Exception as exc:
        db.rollback()
        logger.error(f"Error processing transaction {tx_hash}: {exc}", exc_info=True)
    finally:
        # f. Close the session
        db.close()
