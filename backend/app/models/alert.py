from sqlalchemy import Column, String, DateTime, text, ForeignKey, CheckConstraint, Integer, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    sensor_id = Column(UUID(as_uuid=True), ForeignKey("sensors.id", ondelete="CASCADE"), nullable=False, index=True)
    home_id = Column(UUID(as_uuid=True), ForeignKey("homes.id", ondelete="CASCADE"), nullable=False)

    alert_type = Column(String, CheckConstraint("alert_type IN ('fall', 'stillness')"), nullable=False)
    state = Column(String, CheckConstraint("state IN ('active', 'escalated', 'acknowledged', 'resolved')"), nullable=False, default="active")
    outcome = Column(String, CheckConstraint("outcome IN ('real_fall', 'false_alarm')"), nullable=True)
    stillness_timeout_minutes = Column(Integer, nullable=True)

    triggered_at = Column(DateTime(timezone=True), nullable=False)
    received_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    escalated_at = Column(DateTime(timezone=True), nullable=True)
    acknowledged_at = Column(DateTime(timezone=True), nullable=True)
    resolved_at = Column(DateTime(timezone=True), nullable=True)

    acknowledged_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    resolved_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    notes = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=text("NOW()"))

    __table_args__ = (
        CheckConstraint("state != 'resolved' OR outcome IS NOT NULL", name="outcome_required_when_resolved"),
        Index("idx_alerts_home_id_state", "home_id", "state"),
        Index("idx_alerts_triggered_at", "triggered_at"),
        Index("idx_alerts_alert_type", "home_id", "alert_type"),
    )

    # Relationships
    sensor = relationship("Sensor", back_populates="alerts")
    home = relationship("Home", back_populates="alerts")
    acknowledged_by_user = relationship("User", foreign_keys=[acknowledged_by], back_populates="alerts_acknowledged")
    resolved_by_user = relationship("User", foreign_keys=[resolved_by], back_populates="alerts_resolved")
