"""Coach router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.engine.coach import AICoach
from app.models.user import User, UserStats, UserStreak, UserPreferences
from app.dependencies import get_current_user

router = APIRouter()


class CoachResponse(BaseModel):
    message: str
    cta: str


@router.get("/message", response_model=CoachResponse)
async def get_coach_message(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dynamic coach message based on user state."""
    res_stats = await db.execute(select(UserStats).where(UserStats.user_id == current_user.id))
    stats = res_stats.scalar_one_or_none()

    res_streak = await db.execute(select(UserStreak).where(UserStreak.user_id == current_user.id))
    streak = res_streak.scalar_one_or_none()

    res_prefs = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    prefs = res_prefs.scalar_one_or_none()

    stats_dict = {}
    if stats:
        stats_dict = {
            "level": stats.level,
            "strength": stats.strength,
            "endurance": stats.endurance,
            "speed": stats.speed,
            "discipline": stats.discipline,
            "consistency": stats.consistency,
            "recovery": stats.recovery
        }

    streak_val = streak.current_streak if streak else 0
    prefs_dict = {"goal": prefs.goal} if prefs else {}

    response = AICoach.generate_message(stats_dict, streak_val, prefs_dict)

    return CoachResponse(
        message=response["message"],
        cta=response["cta"]
    )
