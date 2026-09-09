import asyncio
import sys
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.config import settings
from app.database import init_db
from app.routers.health import router as health_router
from app.routers.ingestion import router as ingestion_router
from app.routers.trace import router as trace_router
from app.routers.flags import router as flags_router
from app.routers.report import router as report_router
from app.routers.attribution import router as attribution_router
from app.routers.copilot import router as copilot_router
from app.routers.alerts import router as alerts_router
from app.routers.wallets import router as wallets_router
from ingestion.eth_listener import start_eth_listener


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables on startup
    init_db()

    # Launch live Ethereum transaction listener in the background (non-blocking)
    listener_task = asyncio.create_task(start_eth_listener())

    yield

    # Clean up listener task on shutdown
    listener_task.cancel()
    try:
        await listener_task
    except asyncio.CancelledError:
        pass


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for Blockchain Transaction Forensics, AML Tracing, Rule Heuristics, and Forensic Reports.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# CORS middleware enabled (allowing all origins for hackathon development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router)
app.include_router(ingestion_router)
app.include_router(trace_router)
app.include_router(flags_router)
app.include_router(report_router)
app.include_router(attribution_router)
app.include_router(copilot_router)
app.include_router(alerts_router)
app.include_router(wallets_router)


@app.get("/", include_in_schema=False)
def root():
    return {
        "message": "TraceForge AML API is running. Access Swagger docs at /docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
