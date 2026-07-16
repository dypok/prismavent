from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from app.database import Base

class ProviderCategory(Base):
    __tablename__ = "provider_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String, nullable=False)

class Provider(Base):
    __tablename__ = "providers"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    category_id = Column(UUID(as_uuid=True), ForeignKey("provider_categories.id"), nullable=False)
    city_id = Column(UUID(as_uuid=True), ForeignKey("cities.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    phone = Column(String(20), nullable=True)
    website = Column(String, nullable=True)
    address = Column(String, nullable=True)
    reference_price = Column(Numeric(12, 2), nullable=True)
    price_unit = Column(String(30), nullable=True)
    rating = Column(Numeric(2, 1), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
