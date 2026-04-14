from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID

# We reuse UserResponse from auth for the GET /users/me

class UserUpdate(BaseModel):
    name: Optional[str] = None
    mode: Optional[str] = None
