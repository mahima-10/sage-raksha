from fastapi import APIRouter, HTTPException
from uuid import UUID
from app.schemas.sensor import SensorCreate, SensorResponse, SensorListResponse, SensorUpdate

router = APIRouter()

@router.post("/{home_id}/sensors", response_model=SensorResponse)
async def create_sensor(home_id: UUID, data: SensorCreate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.get("/{home_id}/sensors", response_model=SensorListResponse)
async def list_sensors(home_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.get("/{home_id}/sensors/{sensor_id}", response_model=SensorResponse)
async def get_sensor(home_id: UUID, sensor_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.patch("/{home_id}/sensors/{sensor_id}", response_model=SensorResponse)
async def update_sensor(home_id: UUID, sensor_id: UUID, data: SensorUpdate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.delete("/{home_id}/sensors/{sensor_id}")
async def delete_sensor(home_id: UUID, sensor_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")
