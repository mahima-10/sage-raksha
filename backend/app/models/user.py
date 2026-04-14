from sqlalchemy import Column, String, CheckConstraint, DateTime, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    phone = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=True)
    mode = Column(String, CheckConstraint("mode IN ('independent', 'facility')"), nullable=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationships
    homes_created = relationship("Home", back_populates="creator", foreign_keys="[Home.created_by]")
    home_memberships = relationship("HomeMember", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    alerts_acknowledged = relationship("Alert", back_populates="acknowledged_by_user", foreign_keys="[Alert.acknowledged_by]")
    alerts_resolved = relationship("Alert", back_populates="resolved_by_user", foreign_keys="[Alert.resolved_by]")
