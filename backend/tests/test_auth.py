import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.otp_code import OtpCode

@pytest.mark.asyncio
async def test_request_otp_success(ac: AsyncClient, db_session: AsyncSession):
    phone = "9876543210"
    
    # Send request
    response = await ac.post("/api/v1/auth/request-otp", json={"phone": phone})
    
    # Assert response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "OTP sent"
    assert data["expires_in"] == 300
    
    # Verify DB state
    result = await db_session.execute(select(OtpCode).where(OtpCode.phone == phone))
    otp_row = result.scalar_one_or_none()
    assert otp_row is not None
    assert otp_row.attempts == 0

@pytest.mark.asyncio
async def test_request_otp_rate_limit(ac: AsyncClient, db_session: AsyncSession):
    phone = "1112223333"
    
    # Mocking prior requests is tough locally right now except by just hitting endpoint
    # Send 3 requests (the limit)
    for _ in range(3):
        res = await ac.post("/api/v1/auth/request-otp", json={"phone": phone})
        assert res.status_code == 200

    # 4th request should fail with 429
    res_4 = await ac.post("/api/v1/auth/request-otp", json={"phone": phone})
    assert res_4.status_code == 429
    assert res_4.json()["detail"]["code"] == "RATE_LIMITED"

@pytest.mark.asyncio
async def test_verify_otp_success(ac: AsyncClient, db_session: AsyncSession):
    from app.utils.security import get_password_hash
    from datetime import datetime, timedelta, timezone
    from app.models.otp_code import OtpCode
    
    phone = "5555555555"
    otp = "123456"
    
    # Insert known OTP
    new_otp = OtpCode(
        phone=phone,
        otp_hash=get_password_hash(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)
    )
    db_session.add(new_otp)
    await db_session.commit()
    
    res = await ac.post("/api/v1/auth/verify-otp", json={"phone": phone, "otp": otp})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["phone"] == phone

    # Verify OTP was deleted
    result = await db_session.execute(select(OtpCode).where(OtpCode.phone == phone))
    assert result.scalar_one_or_none() is None

@pytest.mark.asyncio
async def test_verify_otp_invalid_and_max_attempts(ac: AsyncClient, db_session: AsyncSession):
    from app.utils.security import get_password_hash
    from datetime import datetime, timedelta, timezone
    from app.models.otp_code import OtpCode
    
    phone = "5555555555"
    otp = "123456"
    
    # Insert known OTP
    new_otp = OtpCode(
        phone=phone,
        otp_hash=get_password_hash(otp),
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=5)
    )
    db_session.add(new_otp)
    await db_session.commit()
    
    # 4 wrong attempts, each responds 401
    for _ in range(4):
        res = await ac.post("/api/v1/auth/verify-otp", json={"phone": phone, "otp": "000000"})
        assert res.status_code == 401
    
    # 5th attempt triggers lockout and deletion
    res = await ac.post("/api/v1/auth/verify-otp", json={"phone": phone, "otp": "000000"})
    assert res.status_code == 400
    
    # 6th attempt should say it doesn't exist
    res = await ac.post("/api/v1/auth/verify-otp", json={"phone": phone, "otp": "000000"})
    assert res.status_code == 400

@pytest.mark.asyncio
async def test_refresh_token_success(ac: AsyncClient, db_session: AsyncSession):
    from app.models.user import User
    from app.models.refresh_token import RefreshToken
    from app.utils.security import create_access_token
    from datetime import datetime, timedelta, timezone
    import uuid
    
    # Create user
    user = User(phone="4444444444")
    db_session.add(user)
    await db_session.flush()
    
    # Create refresh token
    jti = str(uuid.uuid4())
    db_refresh = RefreshToken(
        user_id=user.id,
        jti=jti,
        expires_at=datetime.now(timezone.utc) + timedelta(days=7)
    )
    db_session.add(db_refresh)
    await db_session.commit()
    
    refresh_token = create_access_token(data={"sub": str(user.id), "jti": jti}, expires_delta=timedelta(days=7))
    
    res = await ac.post("/api/v1/auth/refresh-token", json={"refresh_token": refresh_token})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data

@pytest.mark.asyncio
async def test_refresh_token_invalid(ac: AsyncClient, db_session: AsyncSession):
    res = await ac.post("/api/v1/auth/refresh-token", json={"refresh_token": "fake.token.here"})
    assert res.status_code == 401

@pytest.mark.asyncio
async def test_logout_success(ac: AsyncClient, db_session: AsyncSession):
    from app.models.user import User
    from app.models.refresh_token import RefreshToken
    from app.utils.security import create_access_token
    from datetime import datetime, timedelta, timezone
    import uuid
    
    # Create user
    user = User(phone="7777777777")
    db_session.add(user)
    await db_session.flush()
    
    # Create refresh token
    jti = str(uuid.uuid4())
    db_refresh = RefreshToken(user_id=user.id, jti=jti, expires_at=datetime.now(timezone.utc) + timedelta(days=7))
    db_session.add(db_refresh)
    await db_session.commit()
    
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_access_token(data={"sub": str(user.id), "jti": jti})
    
    res = await ac.post("/api/v1/auth/logout", json={"refresh_token": refresh_token}, headers={"Authorization": f"Bearer {access_token}"})
    assert res.status_code == 200
    
    # Assert DB is empty
    result = await db_session.execute(select(RefreshToken).where(RefreshToken.jti == jti))
    assert result.scalar_one_or_none() is None

@pytest.mark.asyncio
async def test_logout_requires_auth(ac: AsyncClient):
    res = await ac.post("/api/v1/auth/logout", json={"refresh_token": "doesn't matter"})
    assert res.status_code == 401

