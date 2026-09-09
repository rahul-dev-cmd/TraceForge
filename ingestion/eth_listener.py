import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from backend.ingestion.eth_listener import parse_transaction, start_eth_listener

__all__ = ["parse_transaction", "start_eth_listener"]
