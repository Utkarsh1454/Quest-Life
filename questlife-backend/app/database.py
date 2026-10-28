"""Database configuration and session management."""

from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import settings


import re

def normalize_db_url(raw_url: str) -> tuple[str, dict]:
    """Normalize connection URL and connect_args for async SQLAlchemy.
    Supports SQLite, PostgreSQL (asyncpg), Vercel Postgres, Neon, Supabase.
    """
    connect_args = {}
    url = raw_url.strip()
    
    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        return url, connect_args

    # Convert standard postgres/postgresql scheme to asyncpg driver
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://") and not url.startswith("postgresql+"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]

    # Handle SSL mode for asyncpg (Vercel Postgres / Neon / Supabase use sslmode=require)
    if "sslmode=" in url or "ssl=require" in url:
        url = re.sub(r'([?&])sslmode=[^&]+(&?)', r'\1\2', url)
        url = re.sub(r'([?&])ssl=[^&]+(&?)', r'\1\2', url)
        url = url.rstrip('?&')
        connect_args["ssl"] = "require"

    return url, connect_args


def _create_engine():
    """Create the async engine based on DATABASE_URL or POSTGRES_URL."""
    db_url, connect_args = normalize_db_url(settings.effective_database_url)
    
    if db_url.startswith("sqlite"):
        return create_async_engine(
            db_url,
            echo=settings.DEBUG,
            connect_args=connect_args,
        )
    
    return create_async_engine(
        db_url,
        pool_size=10,
        max_overflow=20,
        pool_pre_ping=True,
        echo=settings.DEBUG,
        connect_args=connect_args,
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
