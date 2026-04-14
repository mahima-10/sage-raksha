from sqlalchemy import Column, String, DateTime, text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    hardware_id = Column(String, unique=True, nullable=False, index=True)
    home_id = Column(UUID(as_uuid=True), ForeignKey("homes.id", ondelete="CASCADE"), nullable=False, index=True)
    label = Column(String, nullable=False)
    api_key_hash = Column(String, nullable=False)
    status = Column(String, CheckConstraint("status IN ('online', 'offline')"), nullable=False, default="offline")
    last_heartbeat = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationships
    home = relationship("Home", back_populates="sensors")
    alerts = relationship("Alert", back_populates="sensor", cascade="all, delete-orphan")
