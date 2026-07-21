from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from app.database import Base

class Template(Base):
    """
    SQLAlchemy model representing the 'templates' table.
    """
    __tablename__ = "templates"

    id = Column(UUID(as_uuid=True), primary_key=True)
    event_type_id = Column(UUID(as_uuid=True), ForeignKey("event_types.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    default_items = Column(JSONB, nullable=True)
