import io
import os
import logging
from datetime import datetime, timezone
from typing import Dict, Any
from jinja2 import Environment, FileSystemLoader
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.services.etherscan import normalize_address
from app.services.tracer import TraceService
from app.services.flagging import FlaggingService

logger = logging.getLogger(__name__)

# Setup Jinja2 Template Environment
TEMPLATE_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "templates")
jinja_env = Environment(
    loader=FileSystemLoader(TEMPLATE_DIR),
    autoescape=True
)


def html_to_pdf(html_content: str) -> bytes:
    """
    Converts HTML string to PDF bytes.
    Tries WeasyPrint first (Linux/Render production standard);
    falls back to xhtml2pdf if WeasyPrint OS native libraries are unavailable.
    """
    # 1. Try WeasyPrint
    try:
        import weasyprint
        pdf_bytes = weasyprint.HTML(string=html_content).write_pdf()
        return pdf_bytes
    except (ImportError, OSError) as exc:
        logger.info(f"WeasyPrint unavailable ({exc}), using xhtml2pdf fallback.")

    # 2. Fallback to xhtml2pdf
    try:
        from xhtml2pdf import pisa
        pdf_buffer = io.BytesIO()
        pisa_status = pisa.CreatePDF(html_content, dest=pdf_buffer)
        if pisa_status.err:
            raise RuntimeError(f"xhtml2pdf encountered errors: {pisa_status.err}")
        return pdf_buffer.getvalue()
    except Exception as exc:
        logger.error(f"Failed to generate PDF: {exc}")
        raise RuntimeError(f"PDF generation failed: {str(exc)}")


class PDFReportService:
    @staticmethod
    def generate_report(db: Session, address: str) -> bytes:
        """
        Generate a forensic audit PDF report for an Ethereum address.
        
        Args:
            db: SQLAlchemy session
            address: Target Ethereum address
            
        Returns:
            bytes of the compiled PDF document
            
        Raises:
            ValueError: If address is not ingested yet or invalid.
        """
        norm_addr = normalize_address(address)
        if not norm_addr:
            raise ValueError("Invalid Ethereum address provided.")

        # 1. Fetch wallet metadata
        wallet = db.query(Wallet).filter(Wallet.address == norm_addr).first()

        # 2. Run graph trace (depth=2) via function call
        trace_data = TraceService.trace_wallet(db=db, root_address=norm_addr, depth=2)

        # 3. Evaluate heuristic flags via function call
        flags_data = FlaggingService.evaluate_wallet(db=db, address=norm_addr)

        # 4. Fetch direct transactions for volume & sample table
        direct_txs = db.query(Transaction).filter(
            or_(
                Transaction.from_address == norm_addr,
                Transaction.to_address == norm_addr
            )
        ).order_by(Transaction.timestamp.desc()).all()

        total_direct_txs = len(direct_txs)
        total_volume_eth = sum(tx.amount for tx in direct_txs)
        sample_txs = direct_txs[:15]

        # 5. Render Jinja2 template
        template = jinja_env.get_template("report.html")
        now_utc = datetime.now(timezone.utc)
        
        context: Dict[str, Any] = {
            "wallet": wallet,
            "overall_flagged": flags_data["overall_flagged"],
            "flags": flags_data["flags"],
            "risk_score": flags_data.get("risk_score"),
            "trace": trace_data,
            "total_direct_txs": total_direct_txs,
            "total_volume_eth": total_volume_eth,
            "sample_txs": sample_txs,
            "generated_at": now_utc.strftime("%Y-%m-%d %H:%M:%S"),
            "report_date_slug": now_utc.strftime("%Y%m%d%H%M")
        }

        rendered_html = template.render(**context)

        # 6. Convert rendered HTML to PDF bytes
        pdf_bytes = html_to_pdf(rendered_html)
        return pdf_bytes
