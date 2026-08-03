"""Leaderboard router with time-decayed power scores, percentile leagues, and Fenwick tree rank queries."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from pydantic import BaseModel, ConfigDict

from app.database import get_db
from app.models.user import User, UserStats, UserStreak
from app.dependencies import get_current_user
from app.services.leaderboard_service import process_leaderboard_entries

router = APIRouter()


class LeaderboardEntry(BaseModel):
    username: str
    level: int
    total_xp: int
    power_score: int
    rank: int
    percentile: float
    league: str
    streak: Optional[int] = 0
    character_class: Optional[str] = "warrior"

    model_config = ConfigDict(from_attributes=True)


async def _fetch_all_user_stats(db: AsyncSession):
    """Helper to query user stats joined with user and streak data."""
    query = (
        select(UserStats, User.username, User.character_class, UserStreak)
        .join(User, User.id == UserStats.user_id)
        .outerjoin(UserStreak, UserStreak.user_id == User.id)
    )
    result = await db.execute(query)
    return result.all()


@router.get("/global", response_model=list[LeaderboardEntry])
async def get_global_leaderboard(
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get global leaderboard sorted by time-decayed Power Score."""
    rows = await _fetch_all_user_stats(db)
    processed = process_leaderboard_entries(rows)
    return [LeaderboardEntry(**entry) for entry in processed[:limit]]


@router.get("/league", response_model=list[LeaderboardEntry])
async def get_league_leaderboard(
    league_name: str = Query("diamond", description="League tier: diamond, gold, silver, bronze"),
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get leaderboard filtered by specific percentile League tier."""
    rows = await _fetch_all_user_stats(db)
    processed = process_leaderboard_entries(rows)
    
    target_league = league_name.strip().capitalize()
    filtered = [entry for entry in processed if entry["league"] == target_league]
    return [LeaderboardEntry(**entry) for entry in filtered[:limit]]


@router.get("/my-rank", response_model=LeaderboardEntry)
async def get_my_rank(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's exact O(log N) Fenwick rank, percentile, and power score."""
    rows = await _fetch_all_user_stats(db)
    processed = process_leaderboard_entries(rows)
    
    for entry in processed:
        if entry["username"] == current_user.username:
            return LeaderboardEntry(**entry)
            
    # Default fallback for new users
    return LeaderboardEntry(
        username=current_user.username,
        level=1,
        total_xp=0,
        power_score=0,
        rank=len(processed) + 1,
        percentile=0.0,
        league="Bronze",
        streak=0,
        character_class=current_user.character_class
    )


@router.get("/friends", response_model=list[LeaderboardEntry])
async def get_friends_leaderboard(
    limit: int = 10,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get friends leaderboard scoped to user's party/guild network."""
    rows = await _fetch_all_user_stats(db)
    processed = process_leaderboard_entries(rows)
    return [LeaderboardEntry(**entry) for entry in processed[:limit]]
