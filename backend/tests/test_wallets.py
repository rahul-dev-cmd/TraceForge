from fastapi.testclient import TestClient
from datetime import datetime, timezone

from app.main import app
from app.database import get_db
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.models.alert import Alert


def test_list_wallets(db_session):
    # Seed a couple test wallets
    w1 = Wallet(address="0x1111111111111111111111111111111111111111", first_seen=datetime.now(timezone.utc), flagged=True)
    w2 = Wallet(address="0x2222222222222222222222222222222222222222", first_seen=datetime.now(timezone.utc), flagged=False)
    db_session.add(w1)
    db_session.add(w2)
    db_session.commit()

    # Override get_db
    app.dependency_overrides[get_db] = lambda: db_session

    client = TestClient(app)
    response = client.get("/wallets?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "wallets" in data
    assert data["total"] >= 2
    assert any(w["address"] == "0x1111111111111111111111111111111111111111" for w in data["wallets"])


def test_get_wallet_detail(db_session):
    addr = "0x3333333333333333333333333333333333333333"
    w = Wallet(address=addr, first_seen=datetime.now(timezone.utc), flagged=True)
    db_session.add(w)
    
    tx = Transaction(
        tx_hash="0xabcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234abcd1234",
        from_address=addr,
        to_address="0x4444444444444444444444444444444444444444",
        amount=1.5,
        timestamp=datetime.now(timezone.utc)
    )
    db_session.add(tx)

    alt = Alert(
        wallet_address=addr,
        tx_hash=tx.tx_hash,
        reason="fan_out",
        severity="high",
        risk_score=0.85
    )
    db_session.add(alt)
    db_session.commit()

    app.dependency_overrides[get_db] = lambda: db_session
    client = TestClient(app)
    response = client.get(f"/wallets/{addr}")
    assert response.status_code == 200
    data = response.json()
    assert data["address"] == addr
    assert data["flagged"] is True
    assert data["total_sent_eth"] == 1.5
    assert len(data["recent_transactions"]) == 1
    assert len(data["recent_alerts"]) == 1
    assert data["recent_alerts"][0]["reason"] == "fan_out"
