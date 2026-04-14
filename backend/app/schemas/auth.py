from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class RequestOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number")

class RequestOTPResponse(BaseModel):
    message: str = "OTP sent"
    expires_in: int = 300

class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., description="Phone number")
    otp: str = Field(..., description="6 digit OTP")

class UserResponse(BaseModel):
    id: UUID
    phone: str
    name: Optional[str] = None
    mode: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    # We will compute home_ids dynamically or let it be returned via an endpoint
    home_ids: list[UUID] = []

    model_config = {
        "from_attributes": True
    }

class VerifyOTPResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class RefreshTokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"

class LogoutRequest(BaseModel):
    refresh_token: str

class LogoutResponse(BaseModel):
    message: str = "Logged out successfully"
