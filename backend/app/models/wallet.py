from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Wallet(Base):
    __tablename__ = "wallets"

    address = Column(String(64), primary_key=True, index=True)
    first_seen = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    flagged = Column(Boolean, default=False, nullable=False, index=True)

    # Relationships
    outgoing_transactions = relationship(
        "Transaction",
        foreign_keys="Transaction.from_address",
        back_populates="sender",
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    incoming_transactions = relationship(
        "Transaction",
        foreign_keys="Transaction.to_address",
        back_populates="recipient",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self):
        return f"<Wallet address={self.address} flagged={self.flagged}>"
