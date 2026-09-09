import os
import json
import asyncio
import inspect
import logging
from typing import Dict, Any, Optional
import websockets
from ingestion.processor import process_transaction

from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)

# Configure logger for this module
logger = logging.getLogger("ingestion.eth_listener")

# Reconnect delay in seconds when the connection is lost
RECONNECT_DELAY_SECONDS = 5


def parse_transaction(raw_tx: Dict[str, Any]) -> Dict[str, Any]:
    """
    Parse an incoming raw Ethereum transaction object from Alchemy.

    Extracts:
        - sender: Sender address ('from')
        - receiver: Receiver address ('to', None for contract creation)
        - value: Transfer value converted from Wei to ETH (float)
        - gas_price: Gas price in Wei (int, or None)
        - hash: Transaction hash ('hash')
    """
    # 1. Parse transfer value: convert from hex Wei string to float ETH
    raw_val = raw_tx.get("value")
    if isinstance(raw_val, str) and raw_val.startswith("0x"):
        wei = int(raw_val, 16)
    elif isinstance(raw_val, (int, float)):
        wei = int(raw_val)
    elif raw_val is not None and str(raw_val).isdigit():
        wei = int(raw_val)
    else:
        wei = 0

    value_eth = wei / 10**18

    # 2. Parse gas price: hex Wei string to integer Wei
    raw_gas = raw_tx.get("gasPrice") or raw_tx.get("maxFeePerGas")
    if isinstance(raw_gas, str) and raw_gas.startswith("0x"):
        gas_price = int(raw_gas, 16)
    elif isinstance(raw_gas, (int, float)):
        gas_price = int(raw_gas)
    elif raw_gas is not None and str(raw_gas).isdigit():
        gas_price = int(raw_gas)
    else:
        gas_price = None

    return {
        "hash": raw_tx.get("hash"),
        "sender": raw_tx.get("from"),
        "receiver": raw_tx.get("to"),
        "value": value_eth,
        "gas_price": gas_price,
    }


async def start_eth_listener(api_key: Optional[str] = None) -> None:
    """
    Asynchronous background worker that connects to Alchemy WebSocket API,
    subscribes to `alchemy_pendingTransactions`, and feeds parsed transactions
    to `process_transaction()`.

    Automatically reconnects with a delay if the connection drops.
    """
    # Retrieve Alchemy API key from argument or environment variable
    alchemy_key = api_key or os.getenv("ALCHEMY_API_KEY")

    if not alchemy_key:
        logger.warning(
            "⚠️ ALCHEMY_API_KEY is not set in environment variables. "
            "Live Ethereum transaction listener is idle. "
            "Set ALCHEMY_API_KEY to start real-time ingestion."
        )
        return

    wss_url = f"wss://eth-mainnet.g.alchemy.com/v2/{alchemy_key}"

    # Subscription payload requesting full pending transaction objects
    subscribe_request = json.dumps({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_subscribe",
        "params": ["alchemy_pendingTransactions"]
    })

    logger.info("Starting live Ethereum transaction listener...")

    while True:
        try:
            logger.info(f"Connecting to Alchemy WebSocket endpoint ({wss_url.split('/v2/')[0]}/v2/***)...")
            async with websockets.connect(wss_url, ping_interval=20, ping_timeout=20) as ws:
                logger.info("Connected to Alchemy WebSocket successfully.")
                
                # Send subscription request
                await ws.send(subscribe_request)
                logger.info("Sent subscription request for 'alchemy_pendingTransactions'.")

                # Listen for incoming messages
                async for message in ws:
                    try:
                        data = json.loads(message)

                        # Handle subscription confirmation message
                        if "result" in data and "id" in data:
                            logger.info(f"Subscription confirmed. Subscription ID: {data.get('result')}")
                            continue

                        # Handle incoming transaction event
                        if data.get("method") == "eth_subscription":
                            raw_tx = data.get("params", {}).get("result")
                            if isinstance(raw_tx, dict):
                                parsed_tx = parse_transaction(raw_tx)
                                
                                # Decoupled call to processor (supports both async and sync)
                                if inspect.iscoroutinefunction(process_transaction):
                                    await process_transaction(parsed_tx)
                                else:
                                    process_transaction(parsed_tx)

                    except json.JSONDecodeError:
                        logger.error("Failed to parse incoming WebSocket message as JSON.")
                    except Exception as msg_err:
                        logger.error(f"Error processing transaction: {msg_err}")

        except asyncio.CancelledError:
            logger.info("Ethereum listener background task cancelled. Exiting cleanly.")
            break
        except Exception as conn_err:
            logger.error(
                f"WebSocket connection lost or failed ({conn_err}). "
                f"Reconnecting in {RECONNECT_DELAY_SECONDS} seconds..."
            )
            try:
                await asyncio.sleep(RECONNECT_DELAY_SECONDS)
            except asyncio.CancelledError:
                logger.info("Ethereum listener cancelled during reconnection delay.")
                break


if __name__ == "__main__":
    asyncio.run(start_eth_listener())

