from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class WalletBase(BaseModel):
    address: str = Field(..., description="Normalized Ethereum wallet address")
    flagged: bool = Field(False, description="Whether the wallet is flagged for AML risk")


class WalletCreate(WalletBase):
    first_seen: Optional[datetime] = None


class WalletResponse(WalletBase):
    first_seen: datetime

    model_config = ConfigDict(from_attributes=True)


class WalletSummaryItem(BaseModel):
    address: str
    first_seen: datetime
    flagged: bool
    tx_count: int = 0
    total_volume_eth: float = 0.0
    latest_alert_reason: Optional[str] = None
    latest_alert_severity: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class WalletListResponse(BaseModel):
    total: int
    flagged_count: int
    page: int
    limit: int
    wallets: List[WalletSummaryItem]


class WalletTxItem(BaseModel):
    tx_hash: str
    from_address: str
    to_address: Optional[str] = None
    amount: float
    timestamp: datetime
    direction: str  # 'in' or 'out'


class WalletAlertItem(BaseModel):
    id: int
    reason: str
    severity: str
    risk_score: Optional[float] = None
    created_at: datetime
    tx_hash: Optional[str] = None


class WalletDetailResponse(BaseModel):
    address: str
    first_seen: datetime
    flagged: bool
    tx_count: int
    total_received_eth: float
    total_sent_eth: float
    recent_transactions: List[WalletTxItem]
    recent_alerts: List[WalletAlertItem]
