import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.copilot import CopilotQueryRequest, CopilotQueryResponse
from app.services.copilot import ask_copilot
from app.services.etherscan import normalize_address

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/copilot", tags=["Copilot"])


@router.post(
    "/query",
    response_model=CopilotQueryResponse,
    summary="Query AI Forensic Copilot grounded in wallet telemetry",
    description="Analyzes the target Ethereum wallet using its verified on-chain transactions, heuristic AML flags, and OSINT attribution. Returns an evidence-grounded AI forensic response."
)
def query_copilot(
    payload: CopilotQueryRequest,
    db: Session = Depends(get_db)
):
    norm_addr = normalize_address(payload.address)
    if not norm_addr or not (norm_addr.startswith("0x") and len(norm_addr) == 42):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Ethereum address format: '{payload.address}'. Must be a 42-character hex address starting with 0x."
        )

    if not payload.question or not payload.question.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Question query text cannot be empty."
        )

    try:
        result = ask_copilot(
            address=norm_addr,
            question=payload.question.strip(),
            conversation_history=payload.conversation_history,
            db=db
        )
        return CopilotQueryResponse(**result)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Unexpected error executing copilot query for {norm_addr}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error processing Copilot query: {str(exc)}"
        )
