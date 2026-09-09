from typing import List, Optional
from pydantic import BaseModel, Field


class AttributionSource(BaseModel):
    title: str = Field(..., description="Title of the search result")
    snippet: str = Field(..., description="Text snippet from the result")
    link: str = Field(..., description="URL to the source")
    domain: str = Field(..., description="Domain extracted from the source URL")


class AttributionClassification(BaseModel):
    tags: List[str] = Field(default_factory=list, description="List of heuristic risk and attribution tags")
    result_count: int = Field(0, description="Total number of results matching the address")


class OwnerInfo(BaseModel):
    owner_name: str = Field("Unidentified / Public Address", description="Name of the wallet owner or entity")
    entity_type: str = Field("Individual / Unhosted Wallet", description="Classification of entity")
    has_criminal_record: bool = Field(False, description="Whether criminal records, warrants, or sanctions exist")
    criminal_record_summary: str = Field("No public criminal record or law enforcement warrant detected.", description="Summary of criminal records or law enforcement actions")


class WalletAttributionResponse(BaseModel):
    address: str = Field(..., description="Target Ethereum address")
    owner_info: Optional[OwnerInfo] = Field(None, description="Wallet owner identity & criminal record intel")
    classification: AttributionClassification = Field(..., description="Attribution heuristic classification")
    sources: List[AttributionSource] = Field(default_factory=list, description="List of source results")

