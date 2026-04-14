from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from uuid import UUID
from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.home_member import HomeMember

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/verify-otp")

async def get_current_user_id(token: str = Depends(oauth2_scheme)) -> UUID:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return UUID(user_id)
    except jwt.PyJWTError:
        raise credentials_exception
    except ValueError: # UUID parse error
        raise credentials_exception

async def get_home_membership(
    home_id: UUID, 
    user_id: UUID = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db)
) -> HomeMember:
    from app.models.home_member import HomeMember
    from sqlalchemy import select
    
    result = await db.execute(
        select(HomeMember).where(
            HomeMember.home_id == home_id,
            HomeMember.user_id == user_id
        )
    )
    membership = result.scalars().first()
    
    if not membership:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a member of this home")
        
    return membership

async def require_home_owner(member: HomeMember = Depends(get_home_membership)) -> HomeMember:
    if member.role != 'owner':
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Requires owner role")
    return member
