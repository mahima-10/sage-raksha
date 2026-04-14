from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.schemas.contact import ContactCreate, ContactResponse, ContactListResponse, ContactUpdate
from app.database import get_db
from app.dependencies import get_home_membership
from app.models.emergency_contact import EmergencyContact
from app.models.home_member import HomeMember

router = APIRouter()

@router.post("/{home_id}/contacts", response_model=ContactResponse)
async def create_contact(
    home_id: UUID, 
    data: ContactCreate, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    new_contact = EmergencyContact(
        home_id=home_id,
        name=data.name,
        phone=data.phone,
        relationship=data.relationship
    )
    db.add(new_contact)
    await db.commit()
    await db.refresh(new_contact)
    return new_contact

@router.get("/{home_id}/contacts", response_model=ContactListResponse)
async def list_contacts(
    home_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(EmergencyContact).where(EmergencyContact.home_id == home_id))
    contacts = list(res.scalars().all())
    return ContactListResponse(contacts=contacts)

@router.patch("/{home_id}/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(
    home_id: UUID, 
    contact_id: UUID, 
    data: ContactUpdate, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(EmergencyContact).where(EmergencyContact.id == contact_id, EmergencyContact.home_id == home_id))
    contact = res.scalars().first()
    
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
        
    if data.name is not None:
        contact.name = data.name
    if data.phone is not None:
        contact.phone = data.phone
    if data.relationship is not None:
        contact.relationship = data.relationship
        
    await db.commit()
    await db.refresh(contact)
    return contact

@router.delete("/{home_id}/contacts/{contact_id}", response_model=dict)
async def delete_contact(
    home_id: UUID, 
    contact_id: UUID, 
    member: HomeMember = Depends(get_home_membership),
    db: AsyncSession = Depends(get_db)
):
    res = await db.execute(select(EmergencyContact).where(EmergencyContact.id == contact_id, EmergencyContact.home_id == home_id))
    contact = res.scalars().first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contact not found")
        
    await db.delete(contact)
    await db.commit()
    return {"message": "Contact deleted successfully"}
