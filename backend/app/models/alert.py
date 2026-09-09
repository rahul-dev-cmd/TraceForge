from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    wallet_address = Column(String(64), ForeignKey("wallets.address", ondelete="CASCADE"), nullable=False, index=True)
    tx_hash = Column(String(100), ForeignKey("transactions.tx_hash", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(String(255), nullable=False)
    severity = Column(String(32), nullable=False, default="medium")
    risk_score = Column(Float, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False, index=True)

    # Relationships
    wallet = relationship("Wallet", foreign_keys=[wallet_address])
    transaction = relationship("Transaction", foreign_keys=[tx_hash])

    def __repr__(self):
        return (
            f"<Alert id={self.id} wallet={self.wallet_address} "
            f"severity={self.severity} reason={self.reason}>"
        )
