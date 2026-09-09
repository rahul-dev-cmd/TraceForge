import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_

from app.database import get_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert
from app.schemas.wallet import (
    WalletListResponse,
    WalletSummaryItem,
    WalletDetailResponse,
    WalletTxItem,
    WalletAlertItem
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/wallets", tags=["Wallets"])


@router.get(
    "",
    response_model=WalletListResponse,
    summary="List tracked on-chain wallets with AML risk status",
    description="Returns paginated real wallets ingested from live mempool and transaction traces with volume and heuristic flags."
)
def list_wallets(
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(50, ge=1, le=200, description="Items per page"),
    search: Optional[str] = Query(None, description="Search address substring"),
    flagged_only: bool = Query(False, description="Filter only flagged wallets"),
    db: Session = Depends(get_db)
):
    query = db.query(Wallet)

    if search:
        clean_search = search.strip().lower()
        query = query.filter(Wallet.address.ilike(f"%{clean_search}%"))

    if flagged_only:
        query = query.filter(Wallet.flagged == True)

    total = query.count()
    flagged_count = db.query(Wallet).filter(Wallet.flagged == True).count()

    # Sort flagged first, then newest first
    wallets = (
        query.order_by(desc(Wallet.flagged), desc(Wallet.first_seen))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )

    if not wallets:
        return WalletListResponse(
            total=total,
            flagged_count=flagged_count,
            page=page,
            limit=limit,
            wallets=[]
        )

    addresses = [w.address for w in wallets]

    # Aggregate outgoing txs
    out_aggs = {
        row[0]: (row[1], float(row[2] or 0.0))
        for row in db.query(
            Transaction.from_address,
            func.count(Transaction.tx_hash),
            func.sum(Transaction.amount)
        ).filter(Transaction.from_address.in_(addresses)).group_by(Transaction.from_address).all()
    }

    # Aggregate incoming txs
    in_aggs = {
        row[0]: (row[1], float(row[2] or 0.0))
        for row in db.query(
            Transaction.to_address,
            func.count(Transaction.tx_hash),
            func.sum(Transaction.amount)
        ).filter(Transaction.to_address.in_(addresses)).group_by(Transaction.to_address).all()
    }

    # Gather latest alert for each address
    latest_alerts = {}
    for alert in db.query(Alert).filter(Alert.wallet_address.in_(addresses)).order_by(desc(Alert.id)).all():
        if alert.wallet_address not in latest_alerts:
            latest_alerts[alert.wallet_address] = alert

    wallet_items: List[WalletSummaryItem] = []
    for w in wallets:
        out_cnt, out_vol = out_aggs.get(w.address, (0, 0.0))
        in_cnt, in_vol = in_aggs.get(w.address, (0, 0.0))
        total_tx = out_cnt + in_cnt
        total_vol = round(out_vol + in_vol, 4)

        alt = latest_alerts.get(w.address)
        wallet_items.append(
            WalletSummaryItem(
                address=w.address,
                first_seen=w.first_seen,
                flagged=w.flagged,
                tx_count=total_tx,
                total_volume_eth=total_vol,
                latest_alert_reason=alt.reason if alt else None,
                latest_alert_severity=alt.severity if alt else None
            )
        )

    return WalletListResponse(
        total=total,
        flagged_count=flagged_count,
        page=page,
        limit=limit,
        wallets=wallet_items
    )


@router.get(
    "/{address}",
    response_model=WalletDetailResponse,
    summary="Get detailed forensics and transaction history for a specific wallet",
    description="Returns transaction history and alert records directly from the SQLite database."
)
def get_wallet_detail(
    address: str,
    db: Session = Depends(get_db)
):
    norm_address = address.strip().lower()
    wallet = db.query(Wallet).filter(Wallet.address == norm_address).first()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Wallet '{address}' not found in local database."
        )

    # Fetch recent transactions
    out_txs = (
        db.query(Transaction)
        .filter(Transaction.from_address == norm_address)
        .order_by(desc(Transaction.timestamp))
        .limit(25)
        .all()
    )
    in_txs = (
        db.query(Transaction)
        .filter(Transaction.to_address == norm_address)
        .order_by(desc(Transaction.timestamp))
        .limit(25)
        .all()
    )

    # Calculate aggregate volumes
    total_out_vol = db.query(func.sum(Transaction.amount)).filter(Transaction.from_address == norm_address).scalar() or 0.0
    total_in_vol = db.query(func.sum(Transaction.amount)).filter(Transaction.to_address == norm_address).scalar() or 0.0
    total_out_cnt = db.query(func.count(Transaction.tx_hash)).filter(Transaction.from_address == norm_address).scalar() or 0
    total_in_cnt = db.query(func.count(Transaction.tx_hash)).filter(Transaction.to_address == norm_address).scalar() or 0

    all_txs: List[WalletTxItem] = []
    for tx in out_txs:
        all_txs.append(
            WalletTxItem(
                tx_hash=tx.tx_hash,
                from_address=tx.from_address,
                to_address=tx.to_address,
                amount=tx.amount,
                timestamp=tx.timestamp,
                direction="out"
            )
        )
    for tx in in_txs:
        all_txs.append(
            WalletTxItem(
                tx_hash=tx.tx_hash,
                from_address=tx.from_address,
                to_address=tx.to_address,
                amount=tx.amount,
                timestamp=tx.timestamp,
                direction="in"
            )
        )

    # Sort combined recent transactions descending
    all_txs.sort(key=lambda t: t.timestamp, reverse=True)
    recent_txs = all_txs[:30]

    # Fetch alerts
    alerts_raw = (
        db.query(Alert)
        .filter(Alert.wallet_address == norm_address)
        .order_by(desc(Alert.id))
        .limit(20)
        .all()
    )
    recent_alerts = [
        WalletAlertItem(
            id=a.id,
            reason=a.reason,
            severity=a.severity,
            risk_score=a.risk_score,
            created_at=a.created_at,
            tx_hash=a.tx_hash
        )
        for a in alerts_raw
    ]

    return WalletDetailResponse(
        address=wallet.address,
        first_seen=wallet.first_seen,
        flagged=wallet.flagged,
        tx_count=total_out_cnt + total_in_cnt,
        total_received_eth=round(float(total_in_vol), 4),
        total_sent_eth=round(float(total_out_vol), 4),
        recent_transactions=recent_txs,
        recent_alerts=recent_alerts
    )
