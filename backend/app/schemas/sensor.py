from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class RecentAlertResponse(BaseModel):
    id: UUID
    alert_type: str
    state: str
    triggered_at: datetime
    outcome: Optional[str] = None

    model_config = {
        "from_attributes": True
    }

class SensorCreate(BaseModel):
    hardware_id: str
    label: str

class SensorResponse(BaseModel):
    id: UUID
    hardware_id: str
    home_id: UUID
    label: str
    status: str
    api_key: Optional[str] = None # Only returned on creation
    last_heartbeat: Optional[datetime] = None
    created_at: datetime
    active_alert_count: int = 0
    recent_alerts: List[RecentAlertResponse] = []

    model_config = {
        "from_attributes": True
    }

class SensorListResponse(BaseModel):
    sensors: List[SensorResponse]

class SensorUpdate(BaseModel):
    label: str
