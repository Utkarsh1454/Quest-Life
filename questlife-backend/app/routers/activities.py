from datetime import datetime, timezone, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserStats, UserPreferences, UserStreak
from app.models.activity import Activity, WorkoutLog, MealLog
from app.models.quest import UserQuest, Quest
from app.schemas.activity import (
    LogWorkoutRequest,
    LogMealRequest,
    LogStepsRequest,
    LogSleepRequest,
    ActivityResponse,
    XPAwardResponse
)
from app.engine import (
    get_xp_affinity,
    calculate_xp,
    calculate_workout_xp,
    calculate_nutrition_xp,
    check_level_up,
    check_streak,
    stat_points_per_level,
    auto_allocate_stats
)

router = APIRouter()

class LogActivityRequest(BaseModel):
    activity_type: str
    workout: LogWorkoutRequest | None = None
    meal: LogMealRequest | None = None
    steps: LogStepsRequest | None = None
    sleep: LogSleepRequest | None = None

def get_today_utc():
    return datetime.now(timezone.utc).date()

@router.post("/log", response_model=XPAwardResponse)
async def log_activity(
    request: LogActivityRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Eagerly load all required user relations
    result = await db.execute(
        select(User)
        .options(
            selectinload(User.stats),
            selectinload(User.preferences),
            selectinload(User.streak)
        )
        .where(User.id == current_user.id)
    )
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    activity_type = request.activity_type.lower()
    action = ""
    metadata = {}
    
    today = get_today_utc()
    start_of_today = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    start_of_tomorrow = datetime.combine(today + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
    
    # Query today's existing activities for anti-abuse checks
    today_acts_res = await db.execute(
        select(Activity).where(
            Activity.user_id == user.id,
            Activity.created_at >= start_of_today,
            Activity.created_at < start_of_tomorrow
        )
    )
    today_activities = today_acts_res.scalars().all()
    workouts_today = [a for a in today_activities if a.activity_type == 'workout']
    meals_today = [a for a in today_activities if a.activity_type == 'meal']

    # Pre-create the activity record
    activity = Activity(
        user_id=user.id,
        activity_type=activity_type,
        metadata_json={}
    )
    db.add(activity)
    await db.flush() # flush to get activity.id
    
    xp_earned = 0
    class_affinity = 1.0

    if activity_type == "workout" and request.workout:
        action = "workout_completed"
        class_affinity = get_xp_affinity(user.character_class, action)
        wl = request.workout
        workout_log = WorkoutLog(
            activity_id=activity.id,
            exercise_name=wl.exercise_name,
            sets=wl.sets,
            reps=wl.reps,
            weight_kg=wl.weight_kg,
            duration_minutes=wl.duration_minutes,
            notes=wl.notes
        )
        db.add(workout_log)
        metadata = request.workout.model_dump()
        user.stats.strength += 2
        user.stats.endurance += 1

        # Anti-abuse: Maximum 2 rewarded workouts per day
        if len(workouts_today) >= 2:
            xp_earned = 0
        else:
            xp_earned = calculate_workout_xp(
                duration_minutes=wl.duration_minutes or 45.0,
                difficulty=user.preferences.intensity or 'moderate',
                streak_days=user.streak.current_streak,
                workout_days_pref=user.preferences.workout_days_per_week,
                class_affinity=class_affinity
            )
        
    elif activity_type == "meal" and request.meal:
        action = "healthy_meal_logged" if request.meal.is_healthy else "meal_logged"
        class_affinity = get_xp_affinity(user.character_class, action)
        ml = request.meal
        meal_log = MealLog(
            activity_id=activity.id,
            meal_type=ml.meal_type,
            calories=ml.calories,
            protein_g=ml.protein_g,
            carbs_g=ml.carbs_g,
            fat_g=ml.fat_g,
            food_items=ml.food_items,
            is_healthy=ml.is_healthy
        )
        db.add(meal_log)
        metadata = request.meal.model_dump()
        user.stats.discipline += 2
        user.stats.consistency += 1

        # Meal XP calculation with daily cap of 3 meals (+2 XP each, max 6 XP)
        xp_earned = calculate_nutrition_xp(
            meal_type=ml.meal_type,
            meals_logged_today=len(meals_today)
        )
        
    elif activity_type == "steps" and request.steps:
        if request.steps.steps_count >= user.preferences.daily_steps_goal:
            action = "steps_goal_achieved"
        else:
            action = "steps_logged"
        class_affinity = get_xp_affinity(user.character_class, action)
        metadata = request.steps.model_dump()
        user.stats.speed += 2
        user.stats.consistency += 1
        xp_earned = calculate_xp(
            action=action, 
            streak_days=user.streak.current_streak, 
            intensity=user.preferences.intensity, 
            class_affinity=class_affinity
        )
        
    elif activity_type == "sleep" and request.sleep:
        action = "sleep_logged"
        class_affinity = get_xp_affinity(user.character_class, action)
        metadata = request.sleep.model_dump()
        user.stats.recovery += 2
        xp_earned = calculate_xp(
            action=action, 
            streak_days=user.streak.current_streak, 
            intensity=user.preferences.intensity, 
            class_affinity=class_affinity
        )
        
    else:
        raise HTTPException(status_code=400, detail="Invalid activity type or missing payload")

    activity.metadata_json = metadata

    # 1. Check and update streak
    streak_action, streak_broken, is_same_day = check_streak(user.streak.last_activity_date, today)
    
    if streak_broken:
        user.streak.current_streak = 1
    elif streak_action == 1:
        user.streak.current_streak += 1
        if user.streak.current_streak > user.streak.longest_streak:
            user.streak.longest_streak = user.streak.current_streak
            
    user.streak.last_activity_date = today

    activity.xp_earned = xp_earned
    
    # 2. Update stats & check level up
    leveled_up, old_level, new_level = check_level_up(user.stats.total_xp, user.stats.total_xp + xp_earned)
    
    user.stats.total_xp += xp_earned
    user.stats.current_xp += xp_earned
    
    if leveled_up:
        user.stats.level = new_level
        
        points_to_award = stat_points_per_level(new_level)
        user.stats.unspent_stat_points += points_to_award
        
        allocated = auto_allocate_stats([activity_type], points_to_award)
        user.stats.strength += allocated['strength']
        user.stats.endurance += allocated['endurance']
        user.stats.speed += allocated['speed']
        user.stats.discipline += allocated['discipline']
        user.stats.consistency += allocated['consistency']
        user.stats.recovery += allocated['recovery']

    # 3. Update matching active user quest progress
    active_quests_res = await db.execute(
        select(UserQuest)
        .options(selectinload(UserQuest.quest))
        .where(
            UserQuest.user_id == user.id,
            UserQuest.status == "active"
        )
    )
    active_quests = active_quests_res.scalars().all()
    for uq in active_quests:
        affinity = (uq.quest.stat_affinity or "").lower()
        qtype = uq.quest.quest_type
        should_advance = False
        if activity_type == "workout" and (affinity in ["strength", "endurance", "speed"] or qtype in ["daily", "weekly", "boss"]):
            should_advance = True
        elif activity_type == "meal" and (affinity in ["discipline", "recovery", "consistency"] or qtype in ["daily"]):
            should_advance = True
        elif activity_type == "steps" and (affinity in ["speed", "consistency", "endurance"] or qtype in ["daily"]):
            should_advance = True
        elif activity_type == "sleep" and (affinity in ["recovery", "discipline"] or qtype in ["daily"]):
            should_advance = True

        if should_advance:
            advance_val = 50.0 if qtype == "daily" else 25.0
            uq.progress = min(uq.quest.target_value, uq.progress + advance_val)
            if uq.progress >= uq.quest.target_value:
                uq.status = "completed"
                uq.completed_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(user.stats)

    return XPAwardResponse(
        xp_earned=xp_earned,
        new_total_xp=user.stats.total_xp,
        new_level=user.stats.level,
        level_up=leveled_up,
        stats_after={
            "strength": user.stats.strength,
            "endurance": user.stats.endurance,
            "speed": user.stats.speed,
            "discipline": user.stats.discipline,
            "consistency": user.stats.consistency,
            "recovery": user.stats.recovery,
        }
    )

@router.get("/history", response_model=list[ActivityResponse])
async def get_activity_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Activity)
        .where(Activity.user_id == current_user.id)
        .order_by(Activity.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    activities = result.scalars().all()
    
    response = []
    for a in activities:
        response.append(
            ActivityResponse(
                id=a.id,
                activity_type=a.activity_type,
                xp_earned=a.xp_earned,
                created_at=a.created_at,
                metadata=a.metadata_json
            )
        )
    return response

@router.get("/today")
async def get_today_activities(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    today = get_today_utc()
    start_of_today = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
    start_of_tomorrow = datetime.combine(today + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
    
    result = await db.execute(
        select(Activity)
        .where(
            Activity.user_id == current_user.id,
            Activity.created_at >= start_of_today,
            Activity.created_at < start_of_tomorrow
        )
    )
    activities = result.scalars().all()
    
    total_xp = sum(a.xp_earned for a in activities)
    
    return {
        "activities": [
            ActivityResponse(
                id=a.id,
                activity_type=a.activity_type,
                xp_earned=a.xp_earned,
                created_at=a.created_at,
                metadata=a.metadata_json
            ).model_dump() for a in activities
        ],
        "summary": {
            "total_xp_earned": total_xp,
            "activity_count": len(activities)
        }
    }

@router.delete("/{activity_id}")
async def delete_activity(
    activity_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a logged activity entry by ID."""
    result = await db.execute(
        select(Activity).where(Activity.id == activity_id, Activity.user_id == current_user.id)
    )
    activity = result.scalar_one_or_none()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
        
    await db.delete(activity)
    await db.commit()
    return {"status": "success", "message": "Activity deleted successfully"}
