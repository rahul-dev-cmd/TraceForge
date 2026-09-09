from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    tx_hash: str = Field(..., description="Transaction hash")
    from_address: str = Field(..., description="Sender wallet address")
    to_address: Optional[str] = Field(None, description="Recipient wallet address (None for contract creation)")
    amount: float = Field(..., description="Transaction amount in ETH")
    timestamp: datetime = Field(..., description="UTC timestamp of the transaction")


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    model_config = ConfigDict(from_attributes=True)
