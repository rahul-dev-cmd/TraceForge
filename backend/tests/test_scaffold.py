from datetime import datetime, timezone
from app.models.wallet import Wallet
from app.models.transaction import Transaction


def test_health_endpoint(test_client):
    response = test_client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["database"] == "healthy"
    assert data["service"] == "TraceForge AML Backend"


def test_wallet_and_transaction_models(db_session):
    wallet_a = Wallet(address="0x1111111111111111111111111111111111111111", flagged=False)
    wallet_b = Wallet(address="0x2222222222222222222222222222222222222222", flagged=True)
    db_session.add_all([wallet_a, wallet_b])
    db_session.commit()

    tx = Transaction(
        tx_hash="0xabcdef1234567890",
        from_address=wallet_a.address,
        to_address=wallet_b.address,
        amount=15.5,
        timestamp=datetime.now(timezone.utc).replace(tzinfo=None)
    )
    db_session.add(tx)
    db_session.commit()

    fetched_wallet = db_session.query(Wallet).filter(Wallet.address == wallet_a.address).first()
    assert fetched_wallet is not None
    assert len(fetched_wallet.outgoing_transactions) == 1
    assert fetched_wallet.outgoing_transactions[0].tx_hash == "0xabcdef1234567890"
    assert fetched_wallet.outgoing_transactions[0].amount == 15.5

    fetched_recipient = db_session.query(Wallet).filter(Wallet.address == wallet_b.address).first()
    assert fetched_recipient.flagged is True
    assert len(fetched_recipient.incoming_transactions) == 1


def test_openapi_schema(test_client):
    response = test_client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "TraceForge AML Forensics API"
    assert "/health" in schema["paths"]
    assert "/ingest/{address}" in schema["paths"]


def test_docs_endpoint(test_client):
    response = test_client.get("/docs")
    assert response.status_code == 200
    assert "Swagger UI" in response.text
