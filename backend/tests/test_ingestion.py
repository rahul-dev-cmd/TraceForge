from unittest.mock import patch, AsyncMock
from datetime import datetime

from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.services.etherscan import (
    normalize_address,
    wei_to_eth,
    unix_to_datetime,
    EtherscanService
)


def test_helper_functions():
    # Normalization
    assert normalize_address(" 0xDe0B295669A9FD93d5F28d9Ec85E40f4cb697BAe ") == "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae"
    assert normalize_address(None) is None
    assert normalize_address("") is None

    # Wei to ETH conversion
    # 1 ETH = 10^18 Wei
    assert wei_to_eth("1000000000000000000") == 1.0
    # 0.5 ETH
    assert wei_to_eth("500000000000000000") == 0.5
    # 0 ETH / None
    assert wei_to_eth("0") == 0.0
    assert wei_to_eth(None) == 0.0

    # Timestamp conversion
    dt = unix_to_datetime("1700000000")
    assert isinstance(dt, datetime)
    assert dt.year == 2023


def test_ingest_invalid_address(test_client):
    response = test_client.get("/ingest/invalid_address")
    assert response.status_code == 400
    assert "Invalid Ethereum address format" in response.json()["detail"]


@patch.object(EtherscanService, "fetch_transactions", new_callable=AsyncMock)
def test_ingest_success_and_idempotency(mock_fetch, test_client, db_session):
    target_addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"
    sender_addr = "0x28c6c06298d514db089934071355e5743bf21d60"
    recipient_addr = "0x1111111111111111111111111111111111111111"

    mock_raw_transactions = [
        {
            "hash": "0xaaa111",
            "from": sender_addr,
            "to": target_addr,
            "value": "2000000000000000000",  # 2 ETH
            "timeStamp": "1710000000"
        },
        {
            "hash": "0xbbb222",
            "from": target_addr,
            "to": recipient_addr,
            "value": "500000000000000000",   # 0.5 ETH
            "timeStamp": "1710000500"
        },
        {
            "hash": "0xccc333",
            "from": target_addr,
            "to": "",                         # Contract deployment (empty 'to')
            "value": "0",
            "timeStamp": "1710001000"
        }
    ]
    mock_fetch.return_value = mock_raw_transactions

    # First ingestion call (all new)
    res = test_client.get(f"/ingest/{target_addr}")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert data["address"] == target_addr
    assert data["fetched_count"] == 3
    assert data["new_inserted_count"] == 3
    assert data["already_existing_count"] == 0

    # Verify DB content
    wallets = db_session.query(Wallet).all()
    wallet_addresses = {w.address for w in wallets}
    assert target_addr in wallet_addresses
    assert sender_addr in wallet_addresses
    assert recipient_addr in wallet_addresses

    txs = db_session.query(Transaction).all()
    assert len(txs) == 3
    tx1 = db_session.query(Transaction).filter(Transaction.tx_hash == "0xaaa111").first()
    assert tx1.amount == 2.0
    assert tx1.from_address == sender_addr
    assert tx1.to_address == target_addr

    tx3 = db_session.query(Transaction).filter(Transaction.tx_hash == "0xccc333").first()
    assert tx3.to_address is None
    assert tx3.amount == 0.0

    # Second ingestion call (idempotent / duplicate check)
    res2 = test_client.get(f"/ingest/{target_addr}")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["fetched_count"] == 3
    assert data2["new_inserted_count"] == 0
    assert data2["already_existing_count"] == 3


@patch.object(EtherscanService, "fetch_transactions", new_callable=AsyncMock)
def test_ingest_empty_wallet(mock_fetch, test_client):
    mock_fetch.return_value = []
    target_addr = "0x0000000000000000000000000000000000000001"

    res = test_client.get(f"/ingest/{target_addr}")
    assert res.status_code == 200
    data = res.json()
    assert data["fetched_count"] == 0
    assert data["new_inserted_count"] == 0
    assert data["already_existing_count"] == 0
    assert "No transactions found" in data["message"]


@patch.object(EtherscanService, "fetch_transactions", new_callable=AsyncMock)
def test_ingest_etherscan_error_handling(mock_fetch, test_client):
    mock_fetch.side_effect = ValueError("Etherscan API error: NOTOK: Max rate limit reached")
    target_addr = "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"

    res = test_client.get(f"/ingest/{target_addr}")
    assert res.status_code == 502
    assert "Max rate limit reached" in res.json()["detail"]
