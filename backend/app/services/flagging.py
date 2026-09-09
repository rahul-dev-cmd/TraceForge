import logging
from datetime import datetime, timezone, timedelta
from typing import List, Tuple, Optional, Dict, Any, Set
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.services.etherscan import normalize_address
from app.ml.model_loader import predict_structuring_risk

logger = logging.getLogger(__name__)


def fan_out_flag(transactions: List[Transaction], address: str) -> Tuple[bool, Optional[str]]:
    """
    Check if the address sent funds to 10+ distinct addresses within any rolling 24-hour window.
    """
    norm_addr = normalize_address(address)
    # Filter only outgoing transactions
    outgoing = [
        tx for tx in transactions
        if normalize_address(tx.from_address) == norm_addr and tx.to_address and normalize_address(tx.to_address) != norm_addr
    ]

    if len(outgoing) < 10:
        return False, None

    # Sort outgoing transactions by timestamp ascending
    sorted_out = sorted(outgoing, key=lambda x: x.timestamp)

    # Rolling 24-hour window
    window_duration = timedelta(hours=24)
    for i, tx_start in enumerate(sorted_out):
        window_end_time = tx_start.timestamp + window_duration
        distinct_recipients: Set[str] = set()

        for j in range(i, len(sorted_out)):
            tx_curr = sorted_out[j]
            if tx_curr.timestamp <= window_end_time:
                if tx_curr.to_address:
                    distinct_recipients.add(normalize_address(tx_curr.to_address))
            else:
                break

        if len(distinct_recipients) >= 10:
            return (
                True,
                f"Fan-out activity detected: Sent transactions to {len(distinct_recipients)} distinct destination wallets within a 24-hour window."
            )

    return False, None


def round_amount_flag(transactions: List[Transaction], address: str, tolerance: float = 0.0001) -> Tuple[bool, Optional[str]]:
    """
    Check if the address has 3+ transactions with suspiciously round amounts (e.g. 1.0, 5.0, 10.0 ETH).
    """
    round_txs: List[float] = []

    for tx in transactions:
        amt = float(tx.amount)
        if amt >= 1.0:
            nearest_int = round(amt)
            if abs(amt - nearest_int) <= tolerance:
                round_txs.append(amt)

    if len(round_txs) >= 3:
        sample_str = ", ".join([f"{amt:.1f} ETH" for amt in round_txs[:3]])
        return (
            True,
            f"Round-number structuring detected: Found {len(round_txs)} transactions with exact round amounts (e.g., {sample_str})."
        )

    return False, None


def rapid_passthrough_flag(transactions: List[Transaction], address: str) -> Tuple[bool, Optional[str]]:
    """
    Check if the address received a transaction and forwarded 90%+ of that amount within 10 minutes.
    """
    norm_addr = normalize_address(address)
    incoming = [
        tx for tx in transactions
        if normalize_address(tx.to_address) == norm_addr and tx.amount > 0
    ]
    outgoing = [
        tx for tx in transactions
        if normalize_address(tx.from_address) == norm_addr and tx.amount > 0
    ]

    if not incoming or not outgoing:
        return False, None

    sorted_out = sorted(outgoing, key=lambda x: x.timestamp)
    window_duration = timedelta(minutes=10)

    for in_tx in incoming:
        in_amount = in_tx.amount
        in_time = in_tx.timestamp
        window_end = in_time + window_duration

        # Sum all outgoing transactions in the 10-minute window starting from receipt
        out_in_window = [
            tx for tx in sorted_out
            if in_time <= tx.timestamp <= window_end
        ]

        total_forwarded = sum(tx.amount for tx in out_in_window)

        if in_amount > 0 and total_forwarded >= (0.90 * in_amount):
            pct = (total_forwarded / in_amount) * 100
            return (
                True,
                f"Rapid pass-through detected: Received {in_amount:.4f} ETH and forwarded {total_forwarded:.4f} ETH ({pct:.1f}%) within 10 minutes."
            )

    return False, None


def compute_ml_features(address: str, transactions: Optional[List[Transaction]] = None, db: Optional[Session] = None) -> List[float]:
    """
    Computes 9 ML features from the address's stored transactions in exact order:
    1. tx_frequency: Total count of transactions
    2. amount_mean: Mean of transaction amounts
    3. amount_var: Variance of transaction amounts
    4. round_number_ratio: Fraction of amounts near whole numbers (>= 1.0)
    5. timing_gap_mean: Mean of seconds between consecutive transactions
    6. timing_gap_var: Variance of seconds between consecutive transactions
    7. fan_out_ratio: Distinct recipients / total sent transactions
    8. fan_in_ratio: Distinct senders / total received transactions
    9. threshold_proximity: How close amounts cluster just under common reporting thresholds
    """
    norm_addr = normalize_address(address) or ""
    
    if transactions is None:
        if db is None:
            from app.database import SessionLocal
            session = SessionLocal()
            close_session = True
        else:
            session = db
            close_session = False
        try:
            transactions = session.query(Transaction).filter(
                or_(
                    Transaction.from_address == norm_addr,
                    Transaction.to_address == norm_addr
                )
            ).order_by(Transaction.timestamp.asc()).all()
        finally:
            if close_session:
                session.close()

    if not transactions:
        return [0.0] * 9

    # Sort transactions by timestamp ascending
    sorted_txs = sorted(transactions, key=lambda x: x.timestamp)
    
    # 1. tx_frequency
    tx_frequency = float(len(sorted_txs))

    # 2 & 3. amount_mean and amount_var
    amounts = [float(tx.amount) for tx in sorted_txs]
    amount_mean = float(np.mean(amounts)) if amounts else 0.0
    amount_var = float(np.var(amounts)) if len(amounts) > 1 else 0.0

    # 4. round_number_ratio
    round_count = sum(1 for a in amounts if a >= 1.0 and abs(a - round(a)) <= 0.0001)
    round_number_ratio = float(round_count / len(amounts)) if amounts else 0.0

    # 5 & 6. timing_gap_mean and timing_gap_var
    if len(sorted_txs) > 1:
        gaps = [
            (sorted_txs[i].timestamp - sorted_txs[i - 1].timestamp).total_seconds()
            for i in range(1, len(sorted_txs))
        ]
        timing_gap_mean = float(np.mean(gaps))
        timing_gap_var = float(np.var(gaps)) if len(gaps) > 1 else 0.0
    else:
        timing_gap_mean = 0.0
        timing_gap_var = 0.0

    # 7. fan_out_ratio: distinct recipients / total sent txs
    sent_txs = [tx for tx in sorted_txs if normalize_address(tx.from_address) == norm_addr]
    distinct_recipients = {normalize_address(tx.to_address) for tx in sent_txs if tx.to_address}
    fan_out_ratio = float(len(distinct_recipients) / len(sent_txs)) if sent_txs else 0.0

    # 8. fan_in_ratio: distinct senders / total received txs
    received_txs = [tx for tx in sorted_txs if normalize_address(tx.to_address) == norm_addr]
    distinct_senders = {normalize_address(tx.from_address) for tx in received_txs if tx.from_address}
    fan_in_ratio = float(len(distinct_senders) / len(received_txs)) if received_txs else 0.0

    # 9. threshold_proximity: clustering just below common thresholds
    thresholds = [1.0, 2.0, 3.0, 5.0, 10.0, 20.0, 50.0, 100.0, 1000.0, 10000.0]
    proximities = []
    for a in amounts:
        if a <= 0.0:
            proximities.append(0.0)
            continue
        best_prox = 0.0
        for t in thresholds:
            if 0.80 * t <= a < t:
                prox = a / t
                if prox > best_prox:
                    best_prox = prox
        proximities.append(best_prox)
    threshold_proximity = float(np.mean(proximities)) if proximities else 0.0

    return [
        tx_frequency,
        amount_mean,
        amount_var,
        round_number_ratio,
        timing_gap_mean,
        timing_gap_var,
        fan_out_ratio,
        fan_in_ratio,
        threshold_proximity
    ]


def get_ml_risk_score(address: str, transactions: List[Transaction]) -> Optional[float]:
    """
    Evaluate ML risk score using the XGBoost structuring classifier model.
    Returns None if fewer than 3 transactions are present (insufficient data).
    """
    if not transactions or len(transactions) < 3:
        # Insufficient data for feature calculation
        return None

    features = compute_ml_features(address, transactions=transactions)
    score = predict_structuring_risk(features)
    if score is not None:
        return round(float(score), 4)
    return None


class FlaggingService:
    @staticmethod
    def create_alert_from_eval(
        db: Session,
        eval_res: Dict[str, Any],
        tx_hash: Optional[str] = None
    ) -> Optional[Alert]:
        """
        Create and persist a real Alert row in the database based on evaluation results.
        Derives severity, reason string, and risk score using standard TraceForge AML rules.
        """
        if not eval_res:
            return None

        norm_addr = eval_res.get("address")
        if not norm_addr:
            return None

        triggered_rules = [
            f.get("type", "unknown")
            for f in eval_res.get("flags", [])
            if f.get("triggered")
        ]
        ml_score = eval_res.get("risk_score")
        has_high_ml = ml_score is not None and ml_score >= 0.7

        if not triggered_rules and not has_high_ml:
            return None

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

        # Check if an alert already exists for this tx_hash (or address + reason if no tx_hash)
        if tx_hash:
            existing_alert = db.query(Alert).filter(Alert.tx_hash == tx_hash).first()
            if existing_alert:
                return existing_alert
        else:
            existing_alert = db.query(Alert).filter(
                Alert.wallet_address == norm_addr,
                Alert.reason == reason_str
            ).first()
            if existing_alert:
                return existing_alert

        now = datetime.now(timezone.utc).replace(tzinfo=None)
        alert = Alert(
            wallet_address=norm_addr,
            tx_hash=tx_hash,
            reason=reason_str,
            severity=severity,
            risk_score=ml_score,
            created_at=now,
        )
        db.add(alert)
        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def evaluate_wallet(
        db: Session,
        address: str,
        create_alert: bool = False,
        tx_hash: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate all AML heuristic rules and ML risk scoring for a given wallet address.
        
        Args:
            db: Active SQLAlchemy database session.
            address: Ethereum wallet address.
            create_alert: If True and wallet is flagged, creates and persists an Alert row.
            tx_hash: Optional trigger transaction hash to associate with the created Alert.
            
        Raises:
            ValueError: If address has no ingested transactions in DB.
        """
        norm_addr = normalize_address(address)
        if not norm_addr:
            raise ValueError("Invalid Ethereum address provided.")

        # Fetch all transactions associated with this address
        transactions = db.query(Transaction).filter(
            or_(
                Transaction.from_address == norm_addr,
                Transaction.to_address == norm_addr
            )
        ).order_by(Transaction.timestamp.asc()).all()

        if not transactions:
            raise ValueError(
                f"Wallet address '{norm_addr}' has not been ingested yet (no transaction history found in database). "
                f"Please call GET /ingest/{norm_addr} first."
            )

        # 1. Evaluate Rule 1: Fan-out
        fan_out_trig, fan_out_reason = fan_out_flag(transactions, norm_addr)

        # 2. Evaluate Rule 2: Round amount
        round_trig, round_reason = round_amount_flag(transactions, norm_addr)

        # 3. Evaluate Rule 3: Rapid pass-through
        rapid_trig, rapid_reason = rapid_passthrough_flag(transactions, norm_addr)

        # 4. Evaluate ML Model Risk Score (XGBoost Structuring Classifier)
        ml_score = get_ml_risk_score(norm_addr, transactions)

        # Build flags list
        flags = [
            {"type": "fan_out", "triggered": fan_out_trig, "reason": fan_out_reason},
            {"type": "round_amount", "triggered": round_trig, "reason": round_reason},
            {"type": "rapid_passthrough", "triggered": rapid_trig, "reason": rapid_reason},
        ]

        overall_flagged = fan_out_trig or round_trig or rapid_trig or (ml_score is not None and ml_score >= 0.5)

        # Update flagged status in database
        wallet = db.query(Wallet).filter(Wallet.address == norm_addr).first()
        if wallet and wallet.flagged != overall_flagged:
            wallet.flagged = overall_flagged
            db.commit()

        res: Dict[str, Any] = {
            "address": norm_addr,
            "flags": flags,
            "risk_score": ml_score,
            "overall_flagged": overall_flagged
        }

        if create_alert and overall_flagged:
            alert = FlaggingService.create_alert_from_eval(db, res, tx_hash=tx_hash)
            if alert:
                res["alert"] = alert

        return res
