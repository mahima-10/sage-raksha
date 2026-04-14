from fastapi import APIRouter, HTTPException, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func
from datetime import datetime, timedelta, timezone

from app.schemas.auth import RequestOTPRequest, RequestOTPResponse, VerifyOTPRequest, VerifyOTPResponse, RefreshTokenRequest, RefreshTokenResponse, LogoutRequest, LogoutResponse
from app.database import get_db
from app.models.otp_code import OtpCode
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.utils.security import generate_otp, get_password_hash, verify_password, create_access_token
from app.dependencies import get_current_user_id
import uuid
import jwt
from app.config import settings
from uuid import UUID

router = APIRouter()

@router.post("/request-otp", response_model=RequestOTPResponse)
async def request_otp(data: RequestOTPRequest, db: AsyncSession = Depends(get_db)):
    ten_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=10)
    
    # Check rate limit: max 3 requests per phone in the last 10 minutes
    rate_limit_query = select(func.count()).select_from(OtpCode).where(
        OtpCode.phone == data.phone,
        OtpCode.created_at >= ten_minutes_ago
    )
    request_count = await db.scalar(rate_limit_query)
    
    if request_count is not None and request_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS, 
            detail={"code": "RATE_LIMITED", "message": "Too many OTP requests. Please try again later."}
        )
    
    # Delete expired/older OTPs for this phone, keeping recent ones for rate limit checking
    await db.execute(delete(OtpCode).where(
        OtpCode.phone == data.phone,
        OtpCode.created_at < ten_minutes_ago
    ))
    
    # Generate new OTP
    otp = generate_otp()
    print(f"=============================")
    print(f"OTP for {data.phone}: {otp}")
    print(f"=============================")
    
    # Handle storing
    hashed_otp = get_password_hash(otp)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=5)
    
    new_otp = OtpCode(
        phone=data.phone,
        otp_hash=hashed_otp,
        expires_at=expires_at
    )
    db.add(new_otp)
    await db.commit()
    
    return RequestOTPResponse()

@router.post("/verify-otp", response_model=VerifyOTPResponse)
async def verify_otp(data: VerifyOTPRequest, db: AsyncSession = Depends(get_db)):
    now = datetime.now(timezone.utc)
    
    # Get latest unexpired OTP
    result = await db.execute(
        select(OtpCode)
        .where(OtpCode.phone == data.phone)
        .where(OtpCode.expires_at > now)
        .order_by(OtpCode.created_at.desc())
    )
    otp_record = result.scalars().first()
    
    if not otp_record:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired or not requested")
        
    if not verify_password(data.otp, otp_record.otp_hash):
        otp_record.attempts += 1
        if otp_record.attempts >= 5:
            await db.delete(otp_record)
            await db.commit()
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Too many failed attempts. Request a new OTP.")
        await db.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid OTP")
        
    # Valid OTP: Upsert User
    user_res = await db.execute(select(User).where(User.phone == data.phone))
    user = user_res.scalars().first()
    
    if not user:
        user = User(phone=data.phone)
        db.add(user)
        await db.flush() # get user.id
        
    # Generate Tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    jti = str(uuid.uuid4())
    refresh_token_code = str(uuid.uuid4()) # We return this directly as the refresh_token string we want them to pass later? The prompt says "generate JWT access + refresh tokens". 
    # Usually refresh token is opaque string, sometimes JWT. 
    # Let's map refresh_token to use JWT too, or opaque? FRD says "JWT access + refresh tokens". We'll just generate an opaque token / JWT.
    refresh_token = create_access_token(
        data={"sub": str(user.id), "jti": jti}, 
        expires_delta=timedelta(days=7)
    )
    
    # Store Refresh Token
    db_refresh = RefreshToken(
        user_id=user.id,
        jti=jti,
        expires_at=now + timedelta(days=7)
    )
    db.add(db_refresh)
    
    # Clean up OTP
    await db.execute(delete(OtpCode).where(OtpCode.phone == data.phone))
    await db.commit()
    await db.refresh(user)
    
    return VerifyOTPResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=user
    )

@router.post("/refresh-token", response_model=RefreshTokenResponse)
async def refresh_token(data: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(data.refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        jti = payload.get("jti")
        user_id = payload.get("sub")
        if not jti or not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    res = await db.execute(select(RefreshToken).where(RefreshToken.jti == jti))
    rt_record = res.scalars().first()
    
    if not rt_record:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
        
    if rt_record.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")
        
    # Issue new access token
    access_token = create_access_token({"sub": user_id})
    
    return RefreshTokenResponse(access_token=access_token)

@router.post("/logout", response_model=LogoutResponse)
async def logout(
    data: LogoutRequest, 
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = jwt.decode(data.refresh_token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        jti = payload.get("jti")
        if not jti:
            raise HTTPException(status_code=400, detail="Invalid token payload")
    except jwt.PyJWTError:
        raise HTTPException(status_code=400, detail="Invalid refresh token")
        
    await db.execute(select(RefreshToken).where(RefreshToken.jti == jti))
    await db.execute(delete(RefreshToken).where(RefreshToken.jti == jti, RefreshToken.user_id == user_id))
    await db.commit()
    
    return LogoutResponse(message="Logged out successfully")
