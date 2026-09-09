import json
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
import pytest
from ingestion.eth_listener import parse_transaction, start_eth_listener
from ingestion.processor import process_transaction


def test_parse_transaction_standard():
    """Verify parsing standard transaction with hex value and gas price."""
    raw_tx = {
        "hash": "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
        "from": "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640",
        "to": "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97",
        "value": "0xde0b6b3a7640000",  # 1.0 ETH in hex wei
        "gasPrice": "0x4a817c800",      # 20 Gwei (20,000,000,000 wei)
    }

    parsed = parse_transaction(raw_tx)

    assert parsed["hash"] == "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b"
    assert parsed["sender"] == "0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640"
    assert parsed["receiver"] == "0x4838b106fce9647bdf1e7877bf73ce8b0bad5f97"
    assert pytest.approx(parsed["value"], 0.0001) == 1.0
    assert parsed["gas_price"] == 20000000000


def test_parse_transaction_contract_creation_and_zero_value():
    """Verify parsing contract creation (to is None) and zero value transfer."""
    raw_tx = {
        "hash": "0xabcdef1234567890",
        "from": "0x1111111111111111111111111111111111111111",
        "to": None,
        "value": "0x0",
        "maxFeePerGas": "0x3b9aca00",  # 1 Gwei
    }

    parsed = parse_transaction(raw_tx)

    assert parsed["hash"] == "0xabcdef1234567890"
    assert parsed["sender"] == "0x1111111111111111111111111111111111111111"
    assert parsed["receiver"] is None
    assert parsed["value"] == 0.0
    assert parsed["gas_price"] == 1000000000


@pytest.mark.asyncio
async def test_process_transaction_execution():
    """Ensure process_transaction runs without errors."""
    sample_tx = {
        "hash": "0x123",
        "sender": "0xaaa",
        "receiver": "0xbbb",
        "value": 5.5,
        "gas_price": 25000000000,
    }
    # Should not throw any exception
    await process_transaction(sample_tx)


@pytest.mark.asyncio
async def test_start_eth_listener_no_api_key(monkeypatch):
    """Ensure listener gracefully logs and returns when ALCHEMY_API_KEY is missing."""
    monkeypatch.delenv("ALCHEMY_API_KEY", raising=False)
    # When no key is provided, function should return without error or hanging
    await start_eth_listener(api_key=None)


@pytest.mark.asyncio
async def test_start_eth_listener_stream_and_process():
    """Simulate WebSocket connection, subscription, and receiving an incoming transaction."""
    fake_tx = {
        "hash": "0xdeadbeef1234",
        "from": "0xsender123",
        "to": "0xreceiver456",
        "value": "0x1bc16d674ec80000",  # 2.0 ETH
        "gasPrice": "0x77359400",       # 2 Gwei
    }

    sub_confirm = json.dumps({"jsonrpc": "2.0", "id": 1, "result": "0xsub123"})
    tx_message = json.dumps({
        "jsonrpc": "2.0",
        "method": "eth_subscription",
        "params": {
            "subscription": "0xsub123",
            "result": fake_tx
        }
    })

    # Mock WebSocket async iterator
    class MockWS:
        def __init__(self):
            self.sent_messages = []

        async def __aenter__(self):
            return self

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            return None

        async def send(self, data):
            self.sent_messages.append(data)

        def __aiter__(self):
            return self._generator()

        async def _generator(self):
            yield sub_confirm
            yield tx_message
            # Terminate loop
            raise asyncio.CancelledError()

    mock_ws = MockWS()

    with patch("websockets.connect", return_value=mock_ws):
        with patch("ingestion.eth_listener.process_transaction", new_callable=AsyncMock) as mock_proc:
            try:
                await start_eth_listener(api_key="mock_alchemy_key")
            except asyncio.CancelledError:
                pass

            # Verify subscription was sent
            assert len(mock_ws.sent_messages) == 1
            sent_payload = json.loads(mock_ws.sent_messages[0])
            assert sent_payload["method"] == "eth_subscribe"
            assert sent_payload["params"] == ["alchemy_pendingTransactions"]

            # Verify process_transaction was called with parsed transaction
            assert mock_proc.called
            called_tx = mock_proc.call_args[0][0]
            assert called_tx["hash"] == "0xdeadbeef1234"
            assert called_tx["sender"] == "0xsender123"
            assert called_tx["receiver"] == "0xreceiver456"
            assert pytest.approx(called_tx["value"], 0.0001) == 2.0
            assert called_tx["gas_price"] == 2000000000


@pytest.mark.asyncio
async def test_reconnect_logic():
    """Verify listener retries connection on failure."""
    connection_attempts = 0

    class FailingThenCancelledWS:
        async def __aenter__(self):
            nonlocal connection_attempts
            connection_attempts += 1
            if connection_attempts == 1:
                raise ConnectionResetError("Connection reset by peer")
            # On second attempt, cancel to end test cleanly
            raise asyncio.CancelledError()

        async def __aexit__(self, exc_type, exc_val, exc_tb):
            return None

    with patch("websockets.connect", return_value=FailingThenCancelledWS()):
        with patch("ingestion.eth_listener.RECONNECT_DELAY_SECONDS", 0):
            try:
                await start_eth_listener(api_key="mock_key")
            except asyncio.CancelledError:
                pass

    # Should have attempted at least twice (initial + reconnect)
    assert connection_attempts >= 2
