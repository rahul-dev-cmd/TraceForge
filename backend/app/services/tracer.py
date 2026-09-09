import logging
from typing import Dict, List, Set, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.services.etherscan import normalize_address

logger = logging.getLogger(__name__)


class TraceService:
    @staticmethod
    def trace_wallet(db: Session, root_address: str, depth: int = 2) -> Dict[str, Any]:
        """
        Recursively traverse the transaction graph starting from root_address up to 'depth' hops.
        
        Args:
            db: SQLAlchemy database session
            root_address: Normalized Ethereum wallet address
            depth: Max number of hops outward (1 to 4)
            
        Returns:
            Dict containing nodes, edges, root_address, and counts.
            
        Raises:
            ValueError: If the root_address has not been ingested (no transactions in DB).
        """
        normalized_root = normalize_address(root_address)
        if not normalized_root:
            raise ValueError("Invalid Ethereum address provided.")

        # Check if the root wallet has any recorded transactions in DB
        initial_tx_count = db.query(Transaction.tx_hash).filter(
            or_(
                Transaction.from_address == normalized_root,
                Transaction.to_address == normalized_root
            )
        ).count()

        if initial_tx_count == 0:
            raise ValueError(
                f"Wallet address '{normalized_root}' has not been ingested yet (no transaction history found in database). "
                f"Please call GET /ingest/{normalized_root} first."
            )

        # BFS state
        visited_addresses: Set[str] = {normalized_root}
        visited_tx_hashes: Set[str] = set()
        nodes_map: Dict[str, Dict[str, Any]] = {}
        edges_list: List[Dict[str, Any]] = []

        # Initialize root node
        root_wallet = db.query(Wallet).filter(Wallet.address == normalized_root).first()
        nodes_map[normalized_root] = {
            "address": normalized_root,
            "flagged": root_wallet.flagged if root_wallet else False
        }

        current_frontier: Set[str] = {normalized_root}

        for hop in range(1, depth + 1):
            if not current_frontier:
                break

            # Find all transactions where current frontier addresses are either sender or recipient
            tx_batch = db.query(Transaction).filter(
                or_(
                    Transaction.from_address.in_(current_frontier),
                    Transaction.to_address.in_(current_frontier)
                )
            ).all()

            next_frontier: Set[str] = set()
            new_addresses_to_lookup: Set[str] = set()

            for tx in tx_batch:
                # Add edge if not already recorded
                if tx.tx_hash not in visited_tx_hashes:
                    visited_tx_hashes.add(tx.tx_hash)
                    edges_list.append({
                        "from": tx.from_address,
                        "to": tx.to_address,
                        "amount": tx.amount,
                        "tx_hash": tx.tx_hash,
                        "timestamp": tx.timestamp.isoformat()
                    })

                # Check both endpoints of the transaction
                endpoints = [addr for addr in [tx.from_address, tx.to_address] if addr]
                for endpoint in endpoints:
                    if endpoint not in nodes_map:
                        new_addresses_to_lookup.add(endpoint)
                    if endpoint not in visited_addresses:
                        visited_addresses.add(endpoint)
                        next_frontier.add(endpoint)

            # Batch query wallet metadata for newly discovered addresses
            if new_addresses_to_lookup:
                wallets_info = db.query(Wallet.address, Wallet.flagged).filter(
                    Wallet.address.in_(new_addresses_to_lookup)
                ).all()
                wallet_flag_dict = {w.address: w.flagged for w in wallets_info}

                for addr in new_addresses_to_lookup:
                    nodes_map[addr] = {
                        "address": addr,
                        "flagged": wallet_flag_dict.get(addr, False)
                    }

            current_frontier = next_frontier

        return {
            "root_address": normalized_root,
            "depth": depth,
            "total_nodes": len(nodes_map),
            "total_edges": len(edges_list),
            "nodes": list(nodes_map.values()),
            "edges": edges_list
        }
