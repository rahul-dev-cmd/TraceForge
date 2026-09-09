from typing import Optional
from pydantic import BaseModel, Field


class IngestionResponse(BaseModel):
    address: str = Field(..., description="Target wallet address that was ingested")
    status: str = Field("success", description="Status of the ingestion operation (success / error)")
    fetched_count: int = Field(0, description="Total number of transactions retrieved from Etherscan")
    new_inserted_count: int = Field(0, description="Number of newly inserted transactions in the database")
    already_existing_count: int = Field(0, description="Number of duplicate transactions already present in database")
    message: str = Field(..., description="Human-readable summary message")
