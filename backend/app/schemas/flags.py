from typing import List, Optional
from pydantic import BaseModel, Field


class FlagDetail(BaseModel):
    type: str = Field(..., description="Flag rule identifier: 'fan_out', 'round_amount', or 'rapid_passthrough'")
    triggered: bool = Field(..., description="Whether this heuristic rule was triggered")
    reason: Optional[str] = Field(None, description="Human-readable rationale if triggered, else None")

    model_config = {
        "json_schema_extra": {
            "example": {
                "type": "fan_out",
                "triggered": True,
                "reason": "Wallet sent funds to 12 distinct addresses within a 24-hour window."
            }
        }
    }


class WalletFlagsResponse(BaseModel):
    address: str = Field(..., description="Analyzed Ethereum wallet address")
    flags: List[FlagDetail] = Field(..., description="List of evaluated heuristic rule outcomes")
    risk_score: Optional[float] = Field(
        None,
        description="ML risk score from 0.0 to 1.0 (placeholder for ML teammate's endpoint)"
    )
    overall_flagged: bool = Field(..., description="True if any rule or risk flag triggered")

    model_config = {
        "json_schema_extra": {
            "example": {
                "address": "0xde0b295669a9fd93d5f28d9ec85e40f4cb697bae",
                "flags": [
                    {
                        "type": "fan_out",
                        "triggered": False,
                        "reason": None
                    },
                    {
                        "type": "round_amount",
                        "triggered": True,
                        "reason": "Found 4 transactions with suspiciously round ETH amounts (e.g. 1.0, 5.0, 10.0 ETH)."
                    },
                    {
                        "type": "rapid_passthrough",
                        "triggered": False,
                        "reason": None
                    }
                ],
                "risk_score": None,
                "overall_flagged": True
            }
        }
    }
