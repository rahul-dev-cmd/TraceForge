from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Transaction(Base):
    __tablename__ = "transactions"

    tx_hash = Column(String(100), primary_key=True, index=True)
    from_address = Column(String(64), ForeignKey("wallets.address", ondelete="CASCADE"), nullable=False, index=True)
    to_address = Column(String(64), ForeignKey("wallets.address", ondelete="CASCADE"), nullable=True, index=True)
    amount = Column(Float, nullable=False, default=0.0)  # In ETH
    timestamp = Column(DateTime, nullable=False, index=True)

    # Relationships
    sender = relationship(
        "Wallet",
        foreign_keys=[from_address],
        back_populates="outgoing_transactions"
    )
    recipient = relationship(
        "Wallet",
        foreign_keys=[to_address],
        back_populates="incoming_transactions"
    )

    def __repr__(self):
        return f"<Transaction hash={self.tx_hash} from={self.from_address} to={self.to_address} amount={self.amount}>"
