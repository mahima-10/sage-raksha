from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.schemas.auth import UserResponse
from app.schemas.user import UserUpdate
from app.database import get_db
from app.dependencies import get_current_user_id
from app.models.user import User
from app.models.home_member import HomeMember

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    # Get home_ids
    homes_res = await db.execute(select(HomeMember.home_id).where(HomeMember.user_id == user_id))
    home_ids = homes_res.scalars().all()
    
    # We convert to dict to inject home_ids if the schema doesn't handle it via associations automatically
    user_data = UserResponse.model_validate(user)
    user_data.home_ids = list(home_ids)
    
    return user_data

@router.patch("/me", response_model=UserResponse)
async def update_me(
    data: UserUpdate,
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    if data.name is not None:
        user.name = data.name
        
    if data.mode is not None:
        if user.mode is not None and user.mode != data.mode:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Mode already set and cannot be changed")
        user.mode = data.mode
        
    await db.commit()
    await db.refresh(user)
    
    # Refresh home_ids too
    homes_res = await db.execute(select(HomeMember.home_id).where(HomeMember.user_id == user_id))
    home_ids = homes_res.scalars().all()
    
    user_data = UserResponse.model_validate(user)
    user_data.home_ids = list(home_ids)
    
    return user_data
