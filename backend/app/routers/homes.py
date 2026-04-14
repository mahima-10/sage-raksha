from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import secrets

from app.schemas.home import HomeCreate, HomeResponse, HomeUpdate, InviteCodeResponse, JoinHomeRequest
from app.database import get_db
from app.dependencies import get_current_user_id, get_home_membership, require_home_owner
from app.models.home import Home
from app.models.home_member import HomeMember

router = APIRouter()

@router.post("", response_model=HomeResponse)
async def create_home(
    data: HomeCreate, 
    user_id: UUID = Depends(get_current_user_id), 
    db: AsyncSession = Depends(get_db)
):
    invite_code = f"RAKSHA-{secrets.token_hex(2).upper()}"
    new_home = Home(
        name=data.name,
        address=data.address,
        created_by=user_id,
        invite_code=invite_code
    )
    db.add(new_home)
    await db.flush() # get new_home.id
    
    owner_member = HomeMember(
        home_id=new_home.id,
        user_id=user_id,
        role="owner"
    )
    db.add(owner_member)
    await db.commit()
    await db.refresh(new_home)
    
    # Fetch the newly created home with relationships eager-loaded
    res = await db.execute(
        select(Home).options(selectinload(Home.members)).where(Home.id == new_home.id)
    )
    return res.scalars().first()

@router.get("/{home_id}", response_model=HomeResponse)
async def get_home(
    home_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Home).options(selectinload(Home.members)).where(Home.id == home_id)
    )
    home = res.scalars().first()
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
    return home

@router.patch("/{home_id}", response_model=HomeResponse)
async def update_home(
    home_id: UUID, 
    data: HomeUpdate, 
    member: HomeMember = Depends(require_home_owner),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Home).options(selectinload(Home.members)).where(Home.id == home_id)
    )
    home = res.scalars().first()
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        
    if data.name is not None:
        home.name = data.name
    if data.address is not None:
        home.address = data.address
        
    await db.commit()
    await db.refresh(home)
    return home

@router.post("/{home_id}/invite", response_model=InviteCodeResponse)
async def invite_home(
    home_id: UUID, 
    member: HomeMember = Depends(require_home_owner),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Home).options(selectinload(Home.members)).where(Home.id == home_id)
    )
    home = res.scalars().first()
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Home not found")
        
    home.invite_code = f"RAKSHA-{secrets.token_hex(2).upper()}"
    await db.commit()
    await db.refresh(home)
    
    return InviteCodeResponse(invite_code=home.invite_code)

@router.post("/join", response_model=HomeResponse)
async def join_home(
    data: JoinHomeRequest, 
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(
        select(Home).options(selectinload(Home.members)).where(Home.invite_code == data.invite_code)
    )
    home = res.scalars().first()
    
    if not home:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invalid invite code")
        
    for m in home.members:
        if m.user_id == user_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already a member")
            
    new_member = HomeMember(
        home_id=home.id,
        user_id=user_id,
        role="caretaker"
    )
    db.add(new_member)
    await db.commit()
    
    res2 = await db.execute(
        select(Home).options(selectinload(Home.members)).where(Home.id == home.id)
    )
    home2 = res2.scalars().first()
    return home2
