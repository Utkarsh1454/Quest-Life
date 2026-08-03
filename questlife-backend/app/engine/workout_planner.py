from app.schemas.workout import WorkoutPreference, WeeklyWorkoutPlan, WorkoutDay, Exercise
from app.engine.exercise_db import get_all_exercises

DAILY_SPLITS = [
    {
        "day_name": "Monday",
        "focus_area": "Upper Body Push (Chest & Shoulders)",
        "muscles": ["Chest", "Shoulders", "Arms"],
        "stat": "str"
    },
    {
        "day_name": "Tuesday",
        "focus_area": "Upper Body Pull (Back & Biceps)",
        "muscles": ["Back", "Arms"],
        "stat": "str"
    },
    {
        "day_name": "Wednesday",
        "focus_area": "Leg Squat Focus (Legs & Calves)",
        "muscles": ["Quadriceps", "Hamstrings", "Calves"],
        "stat": "end"
    },
    {
        "day_name": "Thursday",
        "focus_area": "Agility & HIIT Cardio (HIIT Cardio & Abs)",
        "muscles": ["Core", "Calves"],
        "stat": "agi"
    },
    {
        "day_name": "Friday",
        "focus_area": "Golden Era Arnold Split (Chest & Back)",
        "muscles": ["Chest", "Back", "Shoulders"],
        "stat": "str"
    },
    {
        "day_name": "Saturday",
        "focus_area": "Arms & Core Warrior (Biceps & Triceps)",
        "muscles": ["Arms", "Core"],
        "stat": "str"
    },
    {
        "day_name": "Sunday",
        "focus_area": "Rest & Recovery (Yoga & Foam Rolling)",
        "muscles": ["Core", "Back"],
        "stat": "vit"
    }
]

def generate_workout_plan(preference: WorkoutPreference) -> WeeklyWorkoutPlan:
    all_ex = get_all_exercises()
    days = []
    total_cal = 0
    
    for day_idx, split in enumerate(DAILY_SPLITS):
        if day_idx < preference.days_per_week:
            selected = [e for e in all_ex if e.muscle_group in split["muscles"]]
            if preference.preferred_equipment:
                filtered_eq = [e for e in selected if e.equipment in preference.preferred_equipment]
                if filtered_eq:
                    selected = filtered_eq

            if not selected:
                selected = all_ex[:3]
                
            cal = sum(e.calories_per_min * (e.default_sets * e.default_reps / 10 + e.default_rest_seconds / 60) for e in selected[:3])
            mins = sum(e.default_sets * e.default_reps / 10 + e.default_rest_seconds / 60 for e in selected[:3])
            
            day = WorkoutDay(
                day_name=split["day_name"],
                focus_area=split["focus_area"],
                exercises=selected[:3],
                estimated_calories=round(cal, 1),
                stat_affinity=split["stat"],
                total_minutes=round(mins, 1)
            )
            days.append(day)
            total_cal += cal
        else:
            day = WorkoutDay(
                day_name=split["day_name"],
                focus_area="Rest",
                exercises=[],
                estimated_calories=0.0,
                stat_affinity="none",
                total_minutes=0.0
            )
            days.append(day)
            
    return WeeklyWorkoutPlan(days=days, total_calories=round(total_cal, 1), primary_stat_affinity="str")
