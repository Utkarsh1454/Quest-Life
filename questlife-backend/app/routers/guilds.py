"""Guilds router."""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models.guild import Guild, GuildMember
from app.models.user import User
from app.dependencies import get_current_user

router = APIRouter()


class GuildCreate(BaseModel):
    name: str
    description: str | None = None
    is_public: bool = True


class GuildResponse(BaseModel):
    id: int
    name: str
    description: str | None
    leader_id: int
    is_public: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GuildMemberResponse(BaseModel):
    id: int
    guild_id: int
    user_id: int
    role: str
    joined_at: datetime

    model_config = ConfigDict(from_attributes=True)


@router.post("/create", response_model=GuildResponse, status_code=status.HTTP_201_CREATED)
async def create_guild(
    guild_in: GuildCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new guild."""
    result = await db.execute(select(Guild).where(Guild.name == guild_in.name))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Guild name already taken")

    guild = Guild(
        name=guild_in.name,
        description=guild_in.description,
        is_public=guild_in.is_public,
        leader_id=current_user.id
    )
    db.add(guild)
    await db.commit()
    await db.refresh(guild)

    # Add creator as leader
    member = GuildMember(
        guild_id=guild.id,
        user_id=current_user.id,
        role="leader"
    )
    db.add(member)
    await db.commit()

    return guild


@router.get("/list", response_model=list[GuildResponse])
async def list_guilds(
    skip: int = 0, limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List public guilds."""
    result = await db.execute(
        select(Guild).where(Guild.is_public == True).offset(skip).limit(limit)
    )
    guilds = result.scalars().all()
    return guilds


@router.get("/me", response_model=list[GuildMemberResponse])
async def my_guilds(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get guilds the current user belongs to."""
    result = await db.execute(
        select(GuildMember).where(GuildMember.user_id == current_user.id)
    )
    memberships = result.scalars().all()
    return memberships


@router.post("/{guild_id}/join", response_model=GuildMemberResponse)
async def join_guild(
    guild_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Join a public guild."""
    result = await db.execute(select(Guild).where(Guild.id == guild_id))
    guild = result.scalar_one_or_none()
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")

    if not guild.is_public:
        raise HTTPException(status_code=403, detail="Cannot join private guild")

    result_existing = await db.execute(
        select(GuildMember).where(
            GuildMember.guild_id == guild_id,
            GuildMember.user_id == current_user.id
        )
    )
    existing = result_existing.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Already a member")

    member = GuildMember(
        guild_id=guild.id,
        user_id=current_user.id,
        role="member"
    )
    db.add(member)
    await db.commit()
    await db.refresh(member)

    return member
