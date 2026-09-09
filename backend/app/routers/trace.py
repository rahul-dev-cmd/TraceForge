import logging
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.graph import TraceGraphResponse
from app.services.etherscan import normalize_address
from app.services.tracer import TraceService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/trace", tags=["Trace"])


@router.get(
    "/{address}",
    response_model=TraceGraphResponse,
    summary="Recursively trace wallet transactions N hops outward",
    description="Traverses connected wallets N hops from the given address using the stored transaction graph in the database. Returns a nodes/edges graph representation suitable for graph visualizers (Cytoscape, D3, React Flow)."
)
def trace_wallet_graph(
    address: str,
    depth: int = Query(
        default=2,
        ge=1,
        le=4,
        description="Search depth in hops (1 = direct transactions, 2 = 2 hops outward, max 4)"
    ),
    db: Session = Depends(get_db)
):
    normalized_addr = normalize_address(address)
    if not normalized_addr or not (normalized_addr.startswith("0x") and len(normalized_addr) == 42):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid Ethereum address format: '{address}'. Must be a 42-character hex address starting with 0x."
        )

    try:
        graph_data = TraceService.trace_wallet(db=db, root_address=normalized_addr, depth=depth)
        return graph_data
    except ValueError as exc:
        # Not ingested yet or invalid address
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Error during graph trace for {normalized_addr}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error executing transaction graph trace: {str(exc)}"
        )
