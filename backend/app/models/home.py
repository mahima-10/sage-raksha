from sqlalchemy import Column, String, DateTime, text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Home(Base):
    __tablename__ = "homes"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    name = Column(String, nullable=False)
    address = Column(String, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    invite_code = Column(String, unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()"))

    # Relationships
    creator = relationship("User", back_populates="homes_created", foreign_keys=[created_by])
    members = relationship("HomeMember", back_populates="home", cascade="all, delete-orphan")
    sensors = relationship("Sensor", back_populates="home", cascade="all, delete-orphan")
    alerts = relationship("Alert", back_populates="home", cascade="all, delete-orphan")
    emergency_contacts = relationship("EmergencyContact", back_populates="home", cascade="all, delete-orphan")
