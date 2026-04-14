from fastapi import APIRouter, HTTPException
from app.schemas.device import HeartbeatRequest, BaseDeviceResponse, DeviceAlertRequest, DeviceAlertResponse

router = APIRouter()

@router.post("/heartbeat", response_model=BaseDeviceResponse)
async def map_heartbeat(data: HeartbeatRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/alerts", response_model=DeviceAlertResponse)
async def map_alert(data: DeviceAlertRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")
