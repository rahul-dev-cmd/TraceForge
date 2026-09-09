import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.schemas.ingestion import IngestionResponse
from app.services.etherscan import (
    EtherscanService,
    normalize_address,
    wei_to_eth,
    unix_to_datetime
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ingest", tags=["Ingestion"])


@router.get(
    "/{address}",
    response_model=IngestionResponse,
    summary="Ingest Ethereum wallet transaction history",
    description="Fetches transaction history for a given Ethereum address from Etherscan API, normalizes all fields (wei to ETH, timestamps, addresses), and upserts wallets and transactions into PostgreSQL."
)
async def ingest_wallet_transactions(
    address: str,
    db: Session = Depends(get_db)
):
    normalized_target = normalize_address(address)
    if not normalized_target or not (normalized_target.startswith("0x") and len(normalized_target) == 42):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Ethereum address format: '{address}'. Must be a 42-character hex address starting with 0x."
        )

    # 1. Ensure target wallet row exists in the database
    target_wallet = db.query(Wallet).filter(Wallet.address == normalized_target).first()
    if not target_wallet:
        target_wallet = Wallet(
            address=normalized_target,
            first_seen=datetime.now(timezone.utc).replace(tzinfo=None),
            flagged=False
        )
        db.add(target_wallet)
        db.flush()

    # 2. Fetch raw transactions from Etherscan API
    try:
        raw_txs = await EtherscanService.fetch_transactions(normalized_target)
    except ValueError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc)
        )
    except Exception as exc:
        db.rollback()
        logger.error(f"Unexpected error fetching from Etherscan for {normalized_target}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing Etherscan ingestion: {str(exc)}"
        )

    fetched_count = len(raw_txs)
    new_inserted_count = 0
    already_existing_count = 0

    if fetched_count == 0:
        db.commit()
        return IngestionResponse(
            address=normalized_target,
            status="success",
            fetched_count=0,
            new_inserted_count=0,
            already_existing_count=0,
            message="No transactions found on Etherscan for this address."
        )

    try:
        # 3. Process and upsert transactions
        for tx in raw_txs:
            tx_hash = tx.get("hash")
            if not tx_hash:
                continue

            # Check if transaction already exists in database
            existing_tx = db.query(Transaction.tx_hash).filter(Transaction.tx_hash == tx_hash).first()
            if existing_tx:
                already_existing_count += 1
                continue

            from_addr = normalize_address(tx.get("from"))
            to_addr = normalize_address(tx.get("to"))
            amount = wei_to_eth(tx.get("value"))
            tx_time = unix_to_datetime(tx.get("timeStamp"))

            # Ensure sender wallet exists
            if from_addr:
                sender_wallet = db.query(Wallet.address).filter(Wallet.address == from_addr).first()
                if not sender_wallet:
                    db.add(Wallet(address=from_addr, first_seen=tx_time, flagged=False))
                    db.flush()

            # Ensure recipient wallet exists (if not contract deployment where to is null)
            if to_addr:
                recipient_wallet = db.query(Wallet.address).filter(Wallet.address == to_addr).first()
                if not recipient_wallet:
                    db.add(Wallet(address=to_addr, first_seen=tx_time, flagged=False))
                    db.flush()

            # Add transaction record
            new_tx = Transaction(
                tx_hash=tx_hash,
                from_address=from_addr or normalized_target,
                to_address=to_addr,
                amount=amount,
                timestamp=tx_time
            )
            db.add(new_tx)
            new_inserted_count += 1

        db.commit()
    except Exception as exc:
        db.rollback()
        logger.error(f"Database error during ingestion for {normalized_target}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database transaction failed during ingestion: {str(exc)}"
        )

    return IngestionResponse(
        address=normalized_target,
        status="success",
        fetched_count=fetched_count,
        new_inserted_count=new_inserted_count,
        already_existing_count=already_existing_count,
        message=f"Successfully ingested {fetched_count} transactions ({new_inserted_count} new, {already_existing_count} already existed)."
    )
