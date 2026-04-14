from fastapi import APIRouter, HTTPException
from typing import List
from uuid import UUID
from app.schemas.home import HomeCreate, HomeResponse, HomeUpdate, InviteCodeResponse, JoinHomeRequest

router = APIRouter()

@router.post("", response_model=HomeResponse)
async def create_home(data: HomeCreate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.get("/{home_id}", response_model=HomeResponse)
async def get_home(home_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.patch("/{home_id}", response_model=HomeResponse)
async def update_home(home_id: UUID, data: HomeUpdate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/{home_id}/invite", response_model=InviteCodeResponse)
async def invite_home(home_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/join", response_model=HomeResponse)
async def join_home(data: JoinHomeRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")
