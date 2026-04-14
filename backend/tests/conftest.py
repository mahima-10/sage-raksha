import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.database import get_db, Base
from app.config import settings
from app.models import *  # import all models so metadata knows about them

# Override DB URL for testing
TEST_DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/sage_raksha_test"

engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

async def override_get_db():
    async with TestingSessionLocal() as session:
        yield session

app.dependency_overrides[get_db] = override_get_db

@pytest_asyncio.fixture(scope="function", autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def ac() -> AsyncClient:
    async with AsyncClient(
        transport=ASGITransport(app=app), base_url="http://test"
    ) as client:
        yield client

@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session

async def create_test_user_and_token(db_session: AsyncSession, phone: str = "1234567890"):
    from app.models.user import User
    from app.utils.security import create_access_token
    from sqlalchemy import select
    
    result = await db_session.execute(select(User).where(User.phone == phone))
    user = result.scalars().first()
    if not user:
        user = User(phone=phone)
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        
    token = create_access_token({"sub": str(user.id)})
    return user, token
