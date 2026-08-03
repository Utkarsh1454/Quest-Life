from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserStats, UserPreferences, UserStreak
from app.models.activity import Activity
from app.models.quest import UserQuest
from app.schemas.user import (
    UserProfileResponse, 
    UserStatsResponse, 
    UserPreferencesResponse, 
    UserPreferencesUpdate
)
from app.engine.xp_engine import xp_required, xp_progress_in_level

router = APIRouter()

async def _get_full_user(user_id: int, db: AsyncSession) -> User:
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.stats),
            selectinload(User.preferences),
            selectinload(User.streak)
        )
        .where(User.id == user_id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def _enrich_stats_response(stats: UserStats) -> dict:
    stats_dict = {
        "level": stats.level,
        "current_xp": stats.current_xp,
        "total_xp": stats.total_xp,
        "strength": stats.strength,
        "endurance": stats.endurance,
        "speed": stats.speed,
        "discipline": stats.discipline,
        "consistency": stats.consistency,
        "recovery": stats.recovery,
        "unspent_stat_points": stats.unspent_stat_points,
    }
    stats_dict["xp_to_next_level"] = xp_required(stats.level + 1)
    _, _, progress_pct = xp_progress_in_level(stats.total_xp)
    stats_dict["xp_progress_percent"] = progress_pct
    return stats_dict

@router.get("/me", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_full = await _get_full_user(current_user.id, db)
    
    return {
        "user": user_full,
        "stats": _enrich_stats_response(user_full.stats),
        "preferences": user_full.preferences,
        "streak": user_full.streak
    }

@router.get("/me/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserStats).where(UserStats.user_id == current_user.id))
    stats = result.scalar_one_or_none()
    if not stats:
        raise HTTPException(status_code=404, detail="Stats not found")
        
    return _enrich_stats_response(stats)

@router.get("/me/preferences", response_model=UserPreferencesResponse)
async def get_user_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    prefs = result.scalar_one_or_none()
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return prefs

@router.put("/me/preferences", response_model=UserPreferencesResponse)
async def update_user_preferences(
    update_data: UserPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    prefs = result.scalar_one_or_none()
    
    if not prefs:
        raise HTTPException(status_code=404, detail="Preferences not found")
        
    update_dict = update_data.model_dump(exclude_unset=True)
    
    for key, value in update_dict.items():
        setattr(prefs, key, value)
        
    await db.commit()
    await db.refresh(prefs)
    
    return prefs

@router.post("/me/reset")
async def reset_user_account(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Clear all activity logs, quest progress, and reset user stats/streak to starting state."""
    user = await _get_full_user(current_user.id, db)
    
    # 1. Delete all user activities
    act_res = await db.execute(select(Activity).where(Activity.user_id == user.id))
    activities = act_res.scalars().all()
    for act in activities:
        await db.delete(act)
        
    # 2. Delete all assigned user quests
    uq_res = await db.execute(select(UserQuest).where(UserQuest.user_id == user.id))
    user_quests = uq_res.scalars().all()
    for uq in user_quests:
        await db.delete(uq)
        
    # 3. Reset stats
    if user.stats:
        user.stats.level = 1
        user.stats.current_xp = 0
        user.stats.total_xp = 0
        user.stats.strength = 10
        user.stats.endurance = 10
        user.stats.speed = 10
        user.stats.discipline = 10
        user.stats.consistency = 10
        user.stats.recovery = 10
        user.stats.unspent_stat_points = 0
        
    # 4. Reset streak
    if user.streak:
        user.streak.current_streak = 0
        user.streak.longest_streak = 0
        user.streak.last_activity_date = None
        user.streak.streak_freeze_count = 0
        
    await db.commit()
    await db.refresh(user.stats)
    
    return {
        "status": "success",
        "message": "Account process, activity history, quests, and stats reset to clean initial state."
    }
