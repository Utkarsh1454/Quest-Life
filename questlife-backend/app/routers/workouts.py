from fastapi import APIRouter, Query
from app.schemas.workout import WorkoutPreference, WeeklyWorkoutPlan, WorkoutDay
from app.engine.workout_planner import generate_workout_plan
from app.services.exercise_db import find_exercise, get_muscle_group_fallback

router = APIRouter()

@router.post("/plan", response_model=WeeklyWorkoutPlan)
def create_workout_plan(pref: WorkoutPreference):
    return generate_workout_plan(pref)

@router.get("/plan/{day}", response_model=WorkoutDay)
def get_workout_day(day: int):
    pref = WorkoutPreference(fitness_level="beginner", goal="general_fitness", days_per_week=3, preferred_equipment=["bodyweight"])
    plan = generate_workout_plan(pref)
    if 1 <= day <= 7:
        return plan.days[day-1]
    return plan.days[0]

@router.post("/plan/regenerate", response_model=WeeklyWorkoutPlan)
def regenerate_workout_plan(pref: WorkoutPreference):
    return generate_workout_plan(pref)

@router.get("/exercise-animation")
async def get_exercise_animation(
    name: str = Query(..., min_length=1, max_length=100, description="Name of exercise"),
    muscle_group: str | None = Query(None, description="Used only as fallback if name is not found")
):
    """
    Look up exercise image/animation keyframe data using the free-exercise-db dataset.
    Returns honest match_type: 'exact' | 'fuzzy' | 'muscle_fallback' | 'none'.
    """
    entry, match_type = find_exercise(name)

    if entry:
        return {
            "status": "success",
            "source": "free_exercise_db",
            "match_type": match_type,
            "exercise": entry["name"],
            "images": entry["images"],
            "gifUrl": entry["images"][0] if entry["images"] else None,
            "keyframes": entry["images"][:2] if len(entry["images"]) >= 2 else entry["images"]
        }

    if muscle_group:
        fallback = get_muscle_group_fallback(muscle_group)
        if fallback:
            return {
                "status": "success",
                "source": "muscle_group_fallback",
                "match_type": "muscle_fallback",
                "exercise": name,
                "images": fallback["images"],
                "gifUrl": fallback["images"][0] if fallback["images"] else None,
                "keyframes": fallback["images"][:2] if len(fallback["images"]) >= 2 else fallback["images"]
            }

    return {
        "status": "not_found",
        "source": "none",
        "match_type": "none",
        "exercise": name,
        "images": [],
        "gifUrl": None,
        "keyframes": []
    }
