from fastapi import APIRouter, HTTPException
from app.schemas.auth import UserResponse
from app.schemas.user import UserUpdate

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me():
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.patch("/me", response_model=UserResponse)
async def update_me(data: UserUpdate):
    raise HTTPException(status_code=501, detail="Not Implemented")
