import logging
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.etherscan import normalize_address
from app.services.pdf_report import PDFReportService

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/report", tags=["Report"])


@router.get(
    "/{address}",
    summary="Generate and download PDF forensic audit report",
    description="Compiles an AML forensic report including wallet history, 2-hop transaction graph metrics, heuristic risk flags, and recent transactions, rendering an HTML template converted to a downloadable PDF document.",
    responses={
        200: {
            "content": {"application/pdf": {}},
            "description": "Forensic audit report as a downloadable PDF document."
        },
        404: {
            "description": "Wallet address not ingested yet."
        }
    }
)
def get_wallet_pdf_report(
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
        pdf_bytes = PDFReportService.generate_report(db=db, address=normalized_addr)
        
        filename = f"report_{normalized_addr}.pdf"
        headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Access-Control-Expose-Headers": "Content-Disposition"
        }
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers=headers
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc)
        )
    except Exception as exc:
        logger.error(f"Error generating PDF report for {normalized_addr}: {exc}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal error generating PDF report: {str(exc)}"
        )
