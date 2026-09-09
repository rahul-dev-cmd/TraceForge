from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, JSON
from app.database import Base


class WalletAttribution(Base):
    __tablename__ = "wallet_attributions"

    address = Column(String(64), primary_key=True, index=True)
    tags = Column(JSON, default=list, nullable=False)
    raw_results = Column(JSON, default=list, nullable=False)
    fetched_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<WalletAttribution address={self.address} tags_count={len(self.tags or [])} fetched_at={self.fetched_at}>"
