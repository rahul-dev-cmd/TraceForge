from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Service health check")
def health_check(db: Session = Depends(get_db)):
    """
    Returns the health status of the API service and its database connection.
    """
    db_status = "healthy"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "online",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "database": db_status,
        "service": "TraceForge AML Backend"
    }
