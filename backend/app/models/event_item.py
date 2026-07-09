from sqlalchemy import Column, String, Integer, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class EventItem(Base):
    """
    SQLAlchemy model representing the 'event_items' table.
    """
    __tablename__ = "event_items"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id", ondelete="CASCADE"), nullable=False)
    provider_id = Column(UUID(as_uuid=True), nullable=True)
    provider_name = Column(String, nullable=True)
    category_name = Column(String, nullable=True)
    name = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    unit_price = Column(Numeric(10, 2), default=0.00)
    confirmed = Column(Boolean, default=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
