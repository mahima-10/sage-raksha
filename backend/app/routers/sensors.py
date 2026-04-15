from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from uuid import UUID
import secrets
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func

from app.schemas.sensor import SensorCreate, SensorResponse, SensorListResponse, SensorUpdate, RecentAlertResponse
from app.database import get_db
from app.dependencies import get_home_membership
from app.models.sensor import Sensor
from app.models.alert import Alert
from app.models.home_member import HomeMember
from app.utils.security import get_password_hash

router = APIRouter()

@router.post("/{home_id}/sensors", response_model=SensorResponse)
async def create_sensor(
    home_id: UUID, 
    data: SensorCreate, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    # Check if hardware_id already exists globally across the platform
    res = await db.execute(select(Sensor).where(Sensor.hardware_id == data.hardware_id))
    if res.scalars().first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Hardware ID already registered")
        
    api_key_raw = secrets.token_hex(16)
    api_key_hashed = get_password_hash(api_key_raw)
    
    sensor = Sensor(
        hardware_id=data.hardware_id,
        home_id=home_id,
        label=data.label,
        api_key_hash=api_key_hashed
    )
    db.add(sensor)
    await db.commit()
    await db.refresh(sensor)
    
    # We assign api_key attribute temporarily to be picked up by the Pydantic schema Model
    sensor.api_key = api_key_raw
    print(f"=============================")
    print(f"SENSOR PAIRED: {data.hardware_id}")
    print(f"API KEY: {api_key_raw}")
    print(f"=============================")
    sensor.active_alert_count = 0
    sensor.recent_alerts = []
    
    return sensor

@router.get("/{home_id}/sensors", response_model=SensorListResponse)
async def list_sensors(
    home_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Sensor).where(Sensor.home_id == home_id))
    sensors = list(res.scalars().all())
    # Basic list response mapping 
    for s in sensors:
        s.active_alert_count = 0 
        s.recent_alerts = []
        
        # Get active alert count
        count_res = await db.execute(
            select(func.count()).select_from(Alert).where(
                Alert.sensor_id == s.id,
                Alert.state != 'resolved'
            )
        )
        s.active_alert_count = count_res.scalar() or 0
        
        # Get recent alerts limit 3
        alerts_res = await db.execute(
            select(Alert).where(Alert.sensor_id == s.id).order_by(Alert.triggered_at.desc()).limit(3)
        )
        s.recent_alerts = list(alerts_res.scalars().all())
        
    return SensorListResponse(sensors=sensors)

@router.get("/{home_id}/sensors/{sensor_id}", response_model=SensorResponse)
async def get_sensor(
    home_id: UUID, 
    sensor_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Sensor).where(Sensor.id == sensor_id, Sensor.home_id == home_id))
    sensor = res.scalars().first()
    
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")
        
    # Get active alert count
    count_res = await db.execute(
        select(func.count()).select_from(Alert).where(
            Alert.sensor_id == sensor_id,
            Alert.state != 'resolved'
        )
    )
    sensor.active_alert_count = count_res.scalar() or 0
    
    # Get recent alerts limit 3
    alerts_res = await db.execute(
        select(Alert).where(Alert.sensor_id == sensor_id).order_by(Alert.triggered_at.desc()).limit(3)
    )
    sensor.recent_alerts = list(alerts_res.scalars().all())
    
    return sensor

@router.patch("/{home_id}/sensors/{sensor_id}", response_model=SensorResponse)
async def update_sensor(
    home_id: UUID, 
    sensor_id: UUID, 
    data: SensorUpdate, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Sensor).where(Sensor.id == sensor_id, Sensor.home_id == home_id))
    sensor = res.scalars().first()
    
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")
        
    sensor.label = data.label
    await db.commit()
    await db.refresh(sensor)
    
    # Needs metrics to conform to Response mapping
    count_res = await db.execute(
        select(func.count()).select_from(Alert).where(
            Alert.sensor_id == sensor_id,
            Alert.state != 'resolved'
        )
    )
    sensor.active_alert_count = count_res.scalar() or 0
    alerts_res = await db.execute(
        select(Alert).where(Alert.sensor_id == sensor_id).order_by(Alert.triggered_at.desc()).limit(3)
    )
    sensor.recent_alerts = list(alerts_res.scalars().all())
    
    return sensor

@router.delete("/{home_id}/sensors/{sensor_id}", response_model=dict)
async def delete_sensor(
    home_id: UUID, 
    sensor_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(Sensor).where(Sensor.id == sensor_id, Sensor.home_id == home_id))
    sensor = res.scalars().first()
    
    if not sensor:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Sensor not found")
        
    await db.delete(sensor)
    await db.commit()
    return {"message": "Sensor deleted"}
