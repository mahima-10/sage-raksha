from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID

class HomeMemberResponse(BaseModel):
    user_id: UUID
    name: Optional[str] = None
    role: str
    joined_at: datetime

    model_config = {
        "from_attributes": True
    }

class HomeCreate(BaseModel):
    name: str
    address: Optional[str] = None

class HomeResponse(BaseModel):
    id: UUID
    name: str
    address: Optional[str] = None
    created_by: UUID
    invite_code: str
    created_at: datetime
    members: Optional[List[HomeMemberResponse]] = None

    model_config = {
        "from_attributes": True
    }

class HomeUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None

class InviteCodeResponse(BaseModel):
    invite_code: str

class JoinHomeRequest(BaseModel):
    invite_code: str
