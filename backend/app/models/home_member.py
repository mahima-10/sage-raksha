from sqlalchemy import Column, String, DateTime, text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class HomeMember(Base):
    __tablename__ = "home_members"

    home_id = Column(UUID(as_uuid=True), ForeignKey("homes.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True, index=True)
    role = Column(String, CheckConstraint("role IN ('owner', 'caretaker')"), nullable=False, default="caretaker")
    joined_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))

    # Relationships
    home = relationship("Home", back_populates="members")
    user = relationship("User", back_populates="home_memberships")
