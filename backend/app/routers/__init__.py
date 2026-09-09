from app.routers.health import router as health_router
from app.routers.ingestion import router as ingestion_router
from app.routers.trace import router as trace_router
from app.routers.flags import router as flags_router
from app.routers.report import router as report_router

__all__ = ["health_router", "ingestion_router", "trace_router", "flags_router", "report_router"]
