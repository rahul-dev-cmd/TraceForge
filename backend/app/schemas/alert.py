from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class AlertResponse(BaseModel):
    id: int
    wallet_address: str
    tx_hash: Optional[str] = None
    reason: str
    severity: str
    risk_score: Optional[float] = None
    created_at: datetime

    model_config = {
        "from_attributes": True,
        "json_schema_extra": {
            "example": {
                "id": 1,
                "wallet_address": "0x9999999999999999999999999999999999999999",
                "tx_hash": "0xreal_trigger_tx_10_fanout",
                "reason": "fan_out",
                "severity": "high",
                "risk_score": 0.85,
                "created_at": "2026-09-09T15:51:13"
            }
        }
    }


class AlertListResponse(BaseModel):
    total: int
    alerts: List[AlertResponse]
