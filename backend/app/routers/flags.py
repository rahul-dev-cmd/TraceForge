import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.flags import WalletFlagsResponse
from app.services.etherscan import normalize_address
from app.services.flagging import FlaggingService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/flags", tags=["Flags"])


@router.get(
    "/{address}",
    response_model=WalletFlagsResponse,
    summary="Evaluate AML heuristic flags and risk score for a wallet",
    description="Runs rule-based AML heuristics over the wallet's stored transaction history: fan-out (10+ destinations in 24h), round-number amounts (3+ integer/round amounts), and rapid pass-through (90%+ funds forwarded in <10 mins). Includes a designated hook for the ML risk-scoring model."
)
def evaluate_wallet_flags(
    address: str,
    db: Session = Depends(get_db)
):
    normalized_addr = normalize_address(address)
    if not normalized_addr or not (normalized_addr.startswith("0x") and len(normalized_addr) == 42):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Ethereum address format: '{address}'. Must be a 42-character hex address starting with 0x."
        )

    try:
        results = FlaggingService.evaluate_wallet(db=db, address=normalized_addr)
        return results
    except ValueError as exc:
        # Not ingested yet
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Error evaluating flags for {normalized_addr}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error evaluating AML flags: {str(exc)}"
        )
