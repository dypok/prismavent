from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class UserTemplate(Base):
    """
    SQLAlchemy model representing the 'user_templates' table.
    All FK constraints exist in the DB but are NOT declared in the ORM to avoid
    SQLAlchemy create_all conflicts with tables/schemas it hasn't loaded yet.
    """
    __tablename__ = "user_templates"
    __table_args__ = {"extend_existing": True}

    id = Column(UUID(as_uuid=True), primary_key=True)
    user_id = Column(UUID(as_uuid=True), nullable=False)          # FK -> auth.users(id) in DB
    event_type_id = Column(UUID(as_uuid=True), nullable=True)     # FK -> event_types(id) in DB
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    source_template_id = Column(UUID(as_uuid=True), nullable=True) # FK -> templates(id) in DB
    items = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
