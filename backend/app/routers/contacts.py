from fastapi import APIRouter, HTTPException
from uuid import UUID
from app.schemas.contact import ContactCreate, ContactUpdate, ContactResponse, ContactListResponse

router = APIRouter()

@router.get("/{home_id}/contacts", response_model=ContactListResponse)
async def list_contacts(home_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/{home_id}/contacts", response_model=ContactResponse)
async def create_contact(home_id: UUID, data: ContactCreate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.patch("/{home_id}/contacts/{contact_id}", response_model=ContactResponse)
async def update_contact(home_id: UUID, contact_id: UUID, data: ContactUpdate):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.delete("/{home_id}/contacts/{contact_id}")
async def delete_contact(home_id: UUID, contact_id: UUID):
    raise HTTPException(status_code=501, detail="Not Implemented")
