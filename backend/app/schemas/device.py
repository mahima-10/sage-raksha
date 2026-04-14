from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class HeartbeatRequest(BaseModel):
    hardware_id: str
    signal_strength: int

class DeviceAlertRequest(BaseModel):
    hardware_id: str
    alert_type: str
    triggered_at: datetime

class BaseDeviceResponse(BaseModel):
    ok: bool = True

class DeviceAlertResponse(BaseDeviceResponse):
    alert_id: UUID
