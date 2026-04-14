from fastapi import APIRouter, HTTPException, Depends, Header, status
from typing import List, Optional
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timezone
from app.schemas.device import HeartbeatRequest, BaseDeviceResponse, DeviceAlertRequest, DeviceAlertResponse
from app.database import get_db
from app.models.sensor import Sensor
from app.models.alert import Alert
from app.utils.security import verify_password

router = APIRouter()

async def authenticate_device(db: AsyncSession, hardware_id: str, api_key: Optional[str]):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key missing"
        )
        
    result = await db.execute(select(Sensor).where(Sensor.hardware_id == hardware_id))
    sensor = result.scalars().first()
    
    if not sensor or not verify_password(api_key, sensor.api_key_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid hardware ID or API key"
        )
    return sensor

@router.post("/heartbeat", response_model=BaseDeviceResponse)
async def map_heartbeat(
    data: HeartbeatRequest,
    x_api_key: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    sensor = await authenticate_device(db, data.hardware_id, x_api_key)
    
    sensor.status = "online"
    sensor.last_heartbeat = datetime.now(timezone.utc)
    
    await db.commit()
    return BaseDeviceResponse(ok=True)

@router.post("/alerts", response_model=DeviceAlertResponse)
async def map_alert(
    data: DeviceAlertRequest,
    x_api_key: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db)
):
    sensor = await authenticate_device(db, data.hardware_id, x_api_key)
    
    new_alert = Alert(
        sensor_id=sensor.id,
        home_id=sensor.home_id,
        alert_type=data.alert_type,
        state="active",
        triggered_at=data.triggered_at
    )
    db.add(new_alert)
    await db.commit()
    await db.refresh(new_alert)
    
    return DeviceAlertResponse(ok=True, alert_id=new_alert.id)
