from fastapi import APIRouter, HTTPException
from app.schemas.auth import RequestOTPRequest, RequestOTPResponse, VerifyOTPRequest, VerifyOTPResponse, RefreshTokenRequest, RefreshTokenResponse, LogoutRequest, LogoutResponse

router = APIRouter()

@router.post("/request-otp", response_model=RequestOTPResponse)
async def request_otp(data: RequestOTPRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(data: VerifyOTPRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/refresh-token", response_model=RefreshTokenResponse)
async def refresh_token(data: RefreshTokenRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")

@router.post("/logout", response_model=LogoutResponse)
async def logout(data: LogoutRequest):
    raise HTTPException(status_code=501, detail="Not Implemented")
