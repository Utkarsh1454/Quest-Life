"""Database configuration and session management."""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


def _create_engine():
    """Create the async engine based on DATABASE_URL.
    
    Supports both PostgreSQL (asyncpg) and SQLite (aiosqlite) drivers.
    """
    connect_args = {}
    if settings.DATABASE_URL.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
        return create_async_engine(
            settings.DATABASE_URL,
            echo=settings.DEBUG,
            connect_args=connect_args,
        )
    
    return create_async_engine(
        settings.DATABASE_URL,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=settings.DEBUG,
    )


# Create async engine
engine = _create_engine()

# Create async session factory
async_sessionmaker_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)

class Base(DeclarativeBase):
    """Base class for all SQLAlchemy declarative models."""
    pass

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency to get an async database session for requests."""
    async with async_sessionmaker_factory() as session:
        yield session
