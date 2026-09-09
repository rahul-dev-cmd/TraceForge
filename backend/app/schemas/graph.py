from typing import List, Optional
from pydantic import BaseModel, Field


class GraphNode(BaseModel):
    address: str = Field(..., description="Ethereum wallet address")
    flagged: bool = Field(False, description="Whether the wallet is flagged for AML suspicion")


class GraphEdge(BaseModel):
    from_address: str = Field(..., alias="from", description="Sender wallet address")
    to_address: Optional[str] = Field(None, alias="to", description="Recipient wallet address")
    amount: float = Field(..., description="Transaction value in ETH")
    tx_hash: str = Field(..., description="Transaction hash")
    timestamp: str = Field(..., description="ISO 8601 formatted timestamp")

    model_config = {
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "from": "0x1111111111111111111111111111111111111111",
                "to": "0x2222222222222222222222222222222222222222",
                "amount": 2.5,
                "tx_hash": "0xabcdef1234567890",
                "timestamp": "2024-03-10T12:00:00"
            }
        }
    }


class TraceGraphResponse(BaseModel):
    root_address: str = Field(..., description="Starting wallet address for the trace")
    depth: int = Field(..., description="Max traversal depth hops searched")
    total_nodes: int = Field(..., description="Total unique wallet nodes in trace")
    total_edges: int = Field(..., description="Total transaction edges in trace")
    nodes: List[GraphNode] = Field(..., description="List of wallet nodes")
    edges: List[GraphEdge] = Field(..., description="List of transaction edges connecting nodes")

    model_config = {
        "populate_by_name": True
    }
