from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class AlertResponse(BaseModel):
    id: UUID
    sensor_id: UUID
    home_id: UUID
    alert_type: str
    state: str
    triggered_at: datetime
    escalated_at: Optional[datetime] = None
    acknowledged_at: Optional[datetime] = None
    acknowledged_by: Optional[UUID] = None
    resolved_at: Optional[datetime] = None
    resolved_by: Optional[UUID] = None
    outcome: Optional[str] = None
    notes: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class ActiveAlertsResponse(BaseModel):
    alerts: List[AlertResponse]

class ResolveAlertRequest(BaseModel):
    outcome: str
    notes: Optional[str] = None

class PaginatedAlertHistoryResponse(BaseModel):
    items: List[AlertResponse]
    next_cursor: Optional[str] = None
    has_more: bool
    total_count: int
