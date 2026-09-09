from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

# Adjust connection arguments if SQLite is used
connect_args = {}
database_url = settings.DATABASE_URL or "sqlite:///./traceforge.db"

# Render provides postgres:// which SQLAlchemy 1.4+ / 2.0 requires as postgresql://
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

if database_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(
    database_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency to yield a database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all database tables."""
    import app.models  # Ensure all models are registered before creating tables
    Base.metadata.create_all(bind=engine)


# Initialize tables on import for development zero-config
try:
    init_db()
except Exception:
    pass
