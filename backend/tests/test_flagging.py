from datetime import datetime, timezone, timedelta
import pytest
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.services.flagging import (
    fan_out_flag,
    round_amount_flag,
    rapid_passthrough_flag,
    compute_ml_features,
    get_ml_risk_score
)
from app.ml.model_loader import load_structuring_model, predict_structuring_risk


def test_fan_out_heuristic_unit():
    addr = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    base_time = datetime(2024, 1, 1, 12, 0, 0)

    # 1. Negative test: 9 outgoing transactions within 2 hours
    txs_9 = [
        Transaction(
            tx_hash=f"0xhash_{i}",
            from_address=addr,
            to_address=f"0xrecipient_{i:040d}",
            amount=0.5,
            timestamp=base_time + timedelta(minutes=10 * i)
        )
        for i in range(1, 10)
    ]
    trig, reason = fan_out_flag(txs_9, addr)
    assert trig is False
    assert reason is None

    # 2. Positive test: 11 distinct outgoing transactions within 3 hours
    txs_11 = [
        Transaction(
            tx_hash=f"0xhash_{i}",
            from_address=addr,
            to_address=f"0xrecipient_{i:040d}",
            amount=0.5,
            timestamp=base_time + timedelta(minutes=10 * i)
        )
        for i in range(1, 12)
    ]
    trig, reason = fan_out_flag(txs_11, addr)
    assert trig is True
    assert "Fan-out activity detected" in reason
    assert "11 distinct destination wallets" in reason

    # 3. Negative test: 10 transactions spread across 5 days (no 24h window has 10)
    txs_spread = [
        Transaction(
            tx_hash=f"0xhash_spread_{i}",
            from_address=addr,
            to_address=f"0xrecipient_{i:040d}",
            amount=0.5,
            timestamp=base_time + timedelta(hours=15 * i)
        )
        for i in range(1, 11)
    ]
    trig_spread, _ = fan_out_flag(txs_spread, addr)
    assert trig_spread is False


def test_round_amount_heuristic_unit():
    addr = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    now = datetime(2024, 1, 1, 12, 0, 0)

    # 1. Negative test: only 2 round amount txs
    txs_2_round = [
        Transaction(tx_hash="0xtx1", from_address=addr, to_address="0xother", amount=5.0, timestamp=now),
        Transaction(tx_hash="0xtx2", from_address="0xother", to_address=addr, amount=10.0, timestamp=now),
        Transaction(tx_hash="0xtx3", from_address=addr, to_address="0xother", amount=2.451, timestamp=now),
    ]
    trig, reason = round_amount_flag(txs_2_round, addr)
    assert trig is False
    assert reason is None

    # 2. Positive test: 3 round amount transactions (1.0, 5.0, 100.0)
    txs_3_round = [
        Transaction(tx_hash="0xtx1", from_address=addr, to_address="0xother", amount=1.0, timestamp=now),
        Transaction(tx_hash="0xtx2", from_address="0xother", to_address=addr, amount=5.00001, timestamp=now),
        Transaction(tx_hash="0xtx3", from_address=addr, to_address="0xother", amount=100.0, timestamp=now),
    ]
    trig, reason = round_amount_flag(txs_3_round, addr)
    assert trig is True
    assert "Round-number structuring detected" in reason
    assert "3 transactions" in reason


def test_rapid_passthrough_heuristic_unit():
    addr = "0xcccccccccccccccccccccccccccccccccccccccc"
    t0 = datetime(2024, 1, 1, 12, 0, 0)

    # 1. Positive test: receive 10 ETH, forward 9.5 ETH 4 minutes later (95% in 4 mins)
    txs_positive = [
        Transaction(tx_hash="0xin1", from_address="0xsource", to_address=addr, amount=10.0, timestamp=t0),
        Transaction(tx_hash="0xout1", from_address=addr, to_address="0xdest", amount=9.5, timestamp=t0 + timedelta(minutes=4)),
    ]
    trig, reason = rapid_passthrough_flag(txs_positive, addr)
    assert trig is True
    assert "Rapid pass-through detected" in reason
    assert "95.0%" in reason

    # 2. Negative test: receive 10 ETH, forward 8.0 ETH in 4 minutes (80% < 90%)
    txs_low_pct = [
        Transaction(tx_hash="0xin1", from_address="0xsource", to_address=addr, amount=10.0, timestamp=t0),
        Transaction(tx_hash="0xout1", from_address=addr, to_address="0xdest", amount=8.0, timestamp=t0 + timedelta(minutes=4)),
    ]
    trig_low, _ = rapid_passthrough_flag(txs_low_pct, addr)
    assert trig_low is False

    # 3. Negative test: receive 10 ETH, forward 10 ETH but 30 minutes later (> 10 minutes)
    txs_late = [
        Transaction(tx_hash="0xin1", from_address="0xsource", to_address=addr, amount=10.0, timestamp=t0),
        Transaction(tx_hash="0xout1", from_address=addr, to_address="0xdest", amount=10.0, timestamp=t0 + timedelta(minutes=30)),
    ]
    trig_late, _ = rapid_passthrough_flag(txs_late, addr)
    assert trig_late is False


def test_ml_features_and_risk_scoring_unit():
    addr = "0xdddddddddddddddddddddddddddddddddddddddd"
    t0 = datetime(2024, 1, 1, 10, 0, 0)

    # 1. Less than 3 transactions -> risk score is None
    txs_2 = [
        Transaction(tx_hash="0x1", from_address=addr, to_address="0xout1", amount=2.0, timestamp=t0),
        Transaction(tx_hash="0x2", from_address="0xin1", to_address=addr, amount=5.0, timestamp=t0 + timedelta(minutes=10)),
    ]
    score_small = get_ml_risk_score(addr, txs_2)
    assert score_small is None

    # 2. 4 transactions -> feature vector has 9 features and model predicts a score in [0.0, 1.0]
    txs_4 = [
        Transaction(tx_hash="0x1", from_address=addr, to_address="0xout1", amount=9.5, timestamp=t0),
        Transaction(tx_hash="0x2", from_address="0xin1", to_address=addr, amount=10.0, timestamp=t0 + timedelta(minutes=5)),
        Transaction(tx_hash="0x3", from_address=addr, to_address="0xout2", amount=4.8, timestamp=t0 + timedelta(minutes=15)),
        Transaction(tx_hash="0x4", from_address=addr, to_address="0xout3", amount=1.0, timestamp=t0 + timedelta(minutes=25)),
    ]
    features = compute_ml_features(addr, transactions=txs_4)
    assert len(features) == 9
    assert features[0] == 4.0  # tx_frequency
    assert features[1] == (9.5 + 10.0 + 4.8 + 1.0) / 4.0  # amount_mean

    # Verify model loaded and prediction returns valid probability
    score = get_ml_risk_score(addr, txs_4)
    assert score is not None
    assert isinstance(score, float)
    assert 0.0 <= score <= 1.0


def test_flags_endpoint_integration(test_client, db_session):
    flagged_addr = "0x3333333333333333333333333333333333333333"
    clean_addr = "0x4444444444444444444444444444444444444444"
    other_addr = "0x5555555555555555555555555555555555555555"

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    # Insert wallets
    db_session.add(Wallet(address=flagged_addr, first_seen=now, flagged=False))
    db_session.add(Wallet(address=clean_addr, first_seen=now, flagged=False))
    db_session.add(Wallet(address=other_addr, first_seen=now, flagged=False))

    # Insert round-amount pattern on flagged_addr (10.0, 20.0, 50.0 ETH)
    db_session.add(Transaction(tx_hash="0xflagtx1", from_address=flagged_addr, to_address=other_addr, amount=10.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xflagtx2", from_address=other_addr, to_address=flagged_addr, amount=20.0, timestamp=now + timedelta(minutes=5)))
    db_session.add(Transaction(tx_hash="0xflagtx3", from_address=flagged_addr, to_address=other_addr, amount=50.0, timestamp=now + timedelta(minutes=10)))

    # Insert 1 single clean transaction on clean_addr (< 3 transactions)
    db_session.add(Transaction(tx_hash="0xcleantx1", from_address=clean_addr, to_address=other_addr, amount=0.1234, timestamp=now))

    db_session.commit()

    # Query flagged address (has 3 txs -> gets real ML risk_score float)
    res_flagged = test_client.get(f"/flags/{flagged_addr}")
    assert res_flagged.status_code == 200
    data_flagged = res_flagged.json()
    assert data_flagged["address"] == flagged_addr
    assert data_flagged["overall_flagged"] is True
    assert data_flagged["risk_score"] is not None
    assert 0.0 <= data_flagged["risk_score"] <= 1.0
    
    round_flag = next(f for f in data_flagged["flags"] if f["type"] == "round_amount")
    assert round_flag["triggered"] is True
    assert "Round-number structuring" in round_flag["reason"]

    # Verify wallet table was updated in database
    w = db_session.query(Wallet).filter(Wallet.address == flagged_addr).first()
    assert w.flagged is True

    # Query clean address with 1 tx -> risk_score is None (insufficient data)
    res_clean = test_client.get(f"/flags/{clean_addr}")
    assert res_clean.status_code == 200
    data_clean = res_clean.json()
    assert data_clean["overall_flagged"] is False
    assert data_clean["risk_score"] is None
    for f in data_clean["flags"]:
        assert f["triggered"] is False
        assert f["reason"] is None


def test_flags_not_ingested_address(test_client):
    unseen_addr = "0x8888888888888888888888888888888888888888"
    res = test_client.get(f"/flags/{unseen_addr}")
    assert res.status_code == 404
    assert "has not been ingested yet" in res.json()["detail"]
