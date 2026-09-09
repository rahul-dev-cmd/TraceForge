from datetime import datetime, timezone
import pytest
from app.models.wallet import Wallet
from app.models.transaction import Transaction


def test_trace_invalid_address(test_client):
    res = test_client.get("/trace/not_a_valid_address")
    assert res.status_code == 400
    assert "Invalid Ethereum address format" in res.json()["detail"]


def test_trace_not_ingested_wallet(test_client):
    unseen_addr = "0x9999999999999999999999999999999999999999"
    res = test_client.get(f"/trace/{unseen_addr}")
    assert res.status_code == 404
    detail = res.json()["detail"]
    assert "has not been ingested yet" in detail
    assert f"/ingest/{unseen_addr}" in detail


def test_trace_depth_levels(test_client, db_session):
    # Setup chain: W1 -> W2 -> W3 -> W4 -> W5
    w1 = "0x1000000000000000000000000000000000000001"
    w2 = "0x1000000000000000000000000000000000000002"
    w3 = "0x1000000000000000000000000000000000000003"
    w4 = "0x1000000000000000000000000000000000000004"
    w5 = "0x1000000000000000000000000000000000000005"

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    for i, w in enumerate([w1, w2, w3, w4, w5], start=1):
        db_session.add(Wallet(address=w, first_seen=now, flagged=(i == 3)))

    db_session.add(Transaction(tx_hash="0xtx1", from_address=w1, to_address=w2, amount=1.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xtx2", from_address=w2, to_address=w3, amount=2.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xtx3", from_address=w3, to_address=w4, amount=3.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xtx4", from_address=w4, to_address=w5, amount=4.0, timestamp=now))
    db_session.commit()

    # Depth 1 from W1 -> should find W1, W2 (1 edge)
    res_d1 = test_client.get(f"/trace/{w1}?depth=1")
    assert res_d1.status_code == 200
    data_d1 = res_d1.json()
    assert data_d1["depth"] == 1
    assert data_d1["total_nodes"] == 2
    assert data_d1["total_edges"] == 1
    node_addrs_d1 = {n["address"] for n in data_d1["nodes"]}
    assert node_addrs_d1 == {w1, w2}

    # Depth 2 from W1 -> should find W1, W2, W3 (2 edges)
    res_d2 = test_client.get(f"/trace/{w1}?depth=2")
    assert res_d2.status_code == 200
    data_d2 = res_d2.json()
    assert data_d2["depth"] == 2
    assert data_d2["total_nodes"] == 3
    assert data_d2["total_edges"] == 2
    node_addrs_d2 = {n["address"] for n in data_d2["nodes"]}
    assert node_addrs_d2 == {w1, w2, w3}
    
    # Check flagged status is accurately retrieved on W3
    w3_node = next(n for n in data_d2["nodes"] if n["address"] == w3)
    assert w3_node["flagged"] is True

    # Depth 3 from W1 -> should find W1, W2, W3, W4 (3 edges)
    res_d3 = test_client.get(f"/trace/{w1}?depth=3")
    assert res_d3.status_code == 200
    data_d3 = res_d3.json()
    assert data_d3["total_nodes"] == 4
    assert data_d3["total_edges"] == 3


def test_trace_cycle_handling(test_client, db_session):
    # Setup cycle: A -> B -> C -> A and B -> A
    wa = "0x200000000000000000000000000000000000000a"
    wb = "0x200000000000000000000000000000000000000b"
    wc = "0x200000000000000000000000000000000000000c"

    now = datetime.now(timezone.utc).replace(tzinfo=None)

    for w in [wa, wb, wc]:
        db_session.add(Wallet(address=w, first_seen=now, flagged=False))

    db_session.add(Transaction(tx_hash="0xcycle1", from_address=wa, to_address=wb, amount=5.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xcycle2", from_address=wb, to_address=wc, amount=4.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xcycle3", from_address=wc, to_address=wa, amount=3.0, timestamp=now))
    db_session.add(Transaction(tx_hash="0xcycle4", from_address=wb, to_address=wa, amount=1.0, timestamp=now))
    db_session.commit()

    # Trace with depth=4 should cleanly terminate and return all 3 nodes and all 4 edges
    res = test_client.get(f"/trace/{wa}?depth=4")
    assert res.status_code == 200
    data = res.json()
    assert data["total_nodes"] == 3
    assert data["total_edges"] == 4

    # Ensure no duplicate nodes or duplicate edges
    node_addresses = [n["address"] for n in data["nodes"]]
    assert len(node_addresses) == len(set(node_addresses))

    edge_hashes = [e["tx_hash"] for e in data["edges"]]
    assert len(edge_hashes) == len(set(edge_hashes))


def test_trace_depth_bounds(test_client):
    # depth=0 (< min 1) or depth=5 (> max 4) should return 422 Unprocessable Entity
    addr = "0x200000000000000000000000000000000000000a"
    res_low = test_client.get(f"/trace/{addr}?depth=0")
    assert res_low.status_code == 422

    res_high = test_client.get(f"/trace/{addr}?depth=5")
    assert res_high.status_code == 422
