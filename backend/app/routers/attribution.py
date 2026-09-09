import re
import logging
from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attribution import WalletAttribution
from app.schemas.attribution import (
    WalletAttributionResponse,
    AttributionClassification,
    AttributionSource,
    OwnerInfo
)
from app.services.attribution import (
    google_search_wallet,
    classify_results,
    get_owner_and_criminal_intel,
    AttributionAPIError
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/attribute", tags=["Attribution"])

ETH_ADDRESS_PATTERN = re.compile(r"^0x[0-9a-fA-F]{40}$")
CACHE_TTL_DAYS = 7


@router.get(
    "/{address}",
    response_model=WalletAttributionResponse,
    summary="Query OSINT & public attribution data for an Ethereum wallet",
    description="Queries OSINT search API and threat intelligence registries to discover owner identity, criminal record history, OFAC/SDN labels, and web mentions."
)
def get_wallet_attribution(
    address: str,
    db: Session = Depends(get_db)
):
    trimmed_addr = address.strip()
    if not ETH_ADDRESS_PATTERN.match(trimmed_addr):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Ethereum address format: '{address}'. Must be a 42-character hex address starting with 0x."
        )

    normalized_addr = trimmed_addr.lower()

    # 1. Check cache first
    cached = db.query(WalletAttribution).filter(WalletAttribution.address == normalized_addr).first()
    if cached:
        now = datetime.now(timezone.utc)
        fetched_at = cached.fetched_at
        if fetched_at.tzinfo is None:
            fetched_at = fetched_at.replace(tzinfo=timezone.utc)

        if (now - fetched_at) < timedelta(days=CACHE_TTL_DAYS):
            raw_res = cached.raw_results or []
            owner_intel = get_owner_and_criminal_intel(normalized_addr, raw_res)
            return WalletAttributionResponse(
                address=cached.address,
                owner_info=OwnerInfo(**owner_intel),
                classification=AttributionClassification(
                    tags=cached.tags or [],
                    result_count=len(raw_res)
                ),
                sources=[AttributionSource(**item) for item in raw_res]
            )

    # 2. Query Search API and classify results
    try:
        raw_results = google_search_wallet(normalized_addr)
        classification = classify_results(raw_results)
        owner_intel = get_owner_and_criminal_intel(normalized_addr, raw_results)
    except AttributionAPIError as exc:
        logger.warning(f"Attribution API error for {normalized_addr}: {exc.message}")
        raise HTTPException(
            status_code=exc.status_code if exc.status_code in (403, 429, 503) else status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Attribution lookup unavailable: {exc.message}"
        )
    except Exception as exc:
        logger.error(f"Unexpected error querying attribution for {normalized_addr}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing wallet attribution: {str(exc)}"
        )

    # 3. Save or update cache
    try:
        if cached:
            cached.tags = classification["tags"]
            cached.raw_results = raw_results
            cached.fetched_at = datetime.now(timezone.utc)
        else:
            cached = WalletAttribution(
                address=normalized_addr,
                tags=classification["tags"],
                raw_results=raw_results,
                fetched_at=datetime.now(timezone.utc)
            )
            db.add(cached)
        db.commit()
        db.refresh(cached)
    except Exception as exc:
        logger.error(f"Failed to cache attribution results for {normalized_addr}: {exc}")
        db.rollback()

    return WalletAttributionResponse(
        address=normalized_addr,
        owner_info=OwnerInfo(**owner_intel),
        classification=AttributionClassification(
            tags=classification["tags"],
            result_count=classification["result_count"]
        ),
        sources=[AttributionSource(**item) for item in raw_results]
    )
