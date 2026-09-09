import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import httpx
from app.config import settings

logger = logging.getLogger(__name__)

ETHERSCAN_V2_BASE_URL = "https://api.etherscan.io/v2/api"
ETHERSCAN_V1_BASE_URL = "https://api.etherscan.io/api"


def normalize_address(address: Optional[str]) -> Optional[str]:
    """Normalize Ethereum address to lowercase and stripped string."""
    if not address or not isinstance(address, str):
        return None
    cleaned = address.strip().lower()
    return cleaned if cleaned else None


def wei_to_eth(wei_str: Any) -> float:
    """Convert Wei (string or int) to ETH float."""
    try:
        if wei_str is None or str(wei_str).strip() == "":
            return 0.0
        wei_val = int(str(wei_str).strip())
        return float(wei_val / 1e18)
    except (ValueError, TypeError) as e:
        logger.warning(f"Error converting wei to eth: {wei_str} - {e}")
        return 0.0


def unix_to_datetime(timestamp: Any) -> datetime:
    """Convert Unix timestamp (seconds) to UTC datetime."""
    try:
        ts_int = int(str(timestamp).strip())
        # Return naive UTC datetime for seamless SQLite/Postgres compatibility
        return datetime.fromtimestamp(ts_int, tz=timezone.utc).replace(tzinfo=None)
    except (ValueError, TypeError, OSError) as e:
        logger.warning(f"Error parsing timestamp {timestamp}: {e}")
        return datetime.now(timezone.utc).replace(tzinfo=None)


class EtherscanService:
    @staticmethod
    async def fetch_transactions(
        address: str,
        api_key: Optional[str] = None,
        offset: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Fetch transaction history for an Ethereum address from Etherscan API (V2 with V1 fallback).
        
        Returns:
            List of raw transaction dictionaries from Etherscan.
        Raises:
            ValueError on API error or invalid response.
        """
        key = api_key or settings.ETHERSCAN_API_KEY or ""
        normalized_addr = normalize_address(address)
        
        if not normalized_addr:
            raise ValueError("Invalid Ethereum address provided.")

        params = {
            "chainid": "1",
            "module": "account",
            "action": "txlist",
            "address": normalized_addr,
            "sort": "desc",
            "page": "1",
            "offset": str(offset),
            "apikey": key
        }

        async with httpx.AsyncClient(timeout=20.0) as client:
            try:
                # Try V2 endpoint first (current Etherscan standard)
                response = await client.get(ETHERSCAN_V2_BASE_URL, params=params)
                response.raise_for_status()
                data = response.json()
            except Exception as exc:
                # Fallback to V1 endpoint
                logger.info(f"V2 call failed, falling back to V1: {exc}")
                params_v1 = {k: v for k, v in params.items() if k != "chainid"}
                try:
                    response = await client.get(ETHERSCAN_V1_BASE_URL, params=params_v1)
                    response.raise_for_status()
                    data = response.json()
                except Exception as v1_exc:
                    logger.error(f"HTTP error communicating with Etherscan: {v1_exc}")
                    raise ValueError(f"Failed to connect to Etherscan: {str(v1_exc)}")

        status = data.get("status")
        message = data.get("message", "")
        result = data.get("result")

        # Status "1" indicates success with results
        if status == "1" and isinstance(result, list):
            return result

        # Status "0" can mean "No transactions found" (normal empty state) or an error
        if status == "0":
            if message == "No transactions found" or (isinstance(result, list) and len(result) == 0):
                return []
            
            # If result contains a descriptive error message string
            if isinstance(result, str):
                error_msg = f"{message}: {result}" if message else result
                logger.warning(f"Etherscan returned status 0 for address {normalized_addr}: {error_msg}")
                raise ValueError(f"Etherscan API error: {error_msg}")
            
            return []

        # Fallback for unexpected formats
        if isinstance(result, list):
            return result

        return []
