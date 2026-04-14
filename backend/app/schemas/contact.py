from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class ContactCreate(BaseModel):
    name: str
    phone: str
    relationship: str

class ContactUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    relationship: Optional[str] = None

class ContactResponse(BaseModel):
    id: UUID
    home_id: UUID
    name: str
    phone: str
    relationship: str
    created_at: datetime

    model_config = {
        "from_attributes": True
    }

class ContactListResponse(BaseModel):
    contacts: List[ContactResponse]
