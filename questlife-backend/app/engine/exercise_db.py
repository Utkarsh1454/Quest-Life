from typing import List
from app.schemas.workout import Exercise

# Full database of real mapped exercises
EXERCISES_DB: List[Exercise] = [
    # Chest
    Exercise(name="Barbell Bench Press", muscle_group="Chest", equipment="barbell", difficulty="intermediate", type="strength", calories_per_min=8.0, stat_affinity="str", default_sets=3, default_reps=8, default_rest_seconds=90),
    Exercise(name="Incline Bench Press", muscle_group="Chest", equipment="barbell", difficulty="intermediate", type="strength", calories_per_min=7.5, stat_affinity="str", default_sets=4, default_reps=10, default_rest_seconds=90),
    Exercise(name="Push-ups", muscle_group="Chest", equipment="bodyweight", difficulty="beginner", type="strength", calories_per_min=6.0, stat_affinity="end", default_sets=3, default_reps=15, default_rest_seconds=60),

    # Back
    Exercise(name="Deadlift", muscle_group="Back", equipment="barbell", difficulty="advanced", type="strength", calories_per_min=10.0, stat_affinity="str", default_sets=3, default_reps=5, default_rest_seconds=120),
    Exercise(name="Lat Pulldowns", muscle_group="Back", equipment="cable", difficulty="beginner", type="strength", calories_per_min=6.5, stat_affinity="str", default_sets=3, default_reps=10, default_rest_seconds=60),
    Exercise(name="Barbell Row", muscle_group="Back", equipment="barbell", difficulty="intermediate", type="strength", calories_per_min=7.5, stat_affinity="str", default_sets=4, default_reps=8, default_rest_seconds=90),

    # Shoulders
    Exercise(name="Overhead Shoulder Press", muscle_group="Shoulders", equipment="barbell", difficulty="intermediate", type="strength", calories_per_min=7.0, stat_affinity="str", default_sets=3, default_reps=8, default_rest_seconds=90),
    Exercise(name="Dumbbell Lateral Raise", muscle_group="Shoulders", equipment="dumbbell", difficulty="beginner", type="strength", calories_per_min=5.5, stat_affinity="agi", default_sets=3, default_reps=12, default_rest_seconds=60),

    # Legs
    Exercise(name="Barbell Back Squat", muscle_group="Quadriceps", equipment="barbell", difficulty="intermediate", type="strength", calories_per_min=9.5, stat_affinity="str", default_sets=3, default_reps=6, default_rest_seconds=120),
    Exercise(name="Romanian Deadlift", muscle_group="Hamstrings", equipment="barbell", difficulty="intermediate", type="strength", calories_per_min=8.0, stat_affinity="str", default_sets=3, default_reps=10, default_rest_seconds=90),
    Exercise(name="Standing Calf Raises", muscle_group="Calves", equipment="machine", difficulty="beginner", type="strength", calories_per_min=5.0, stat_affinity="end", default_sets=4, default_reps=15, default_rest_seconds=45),

    # Arms
    Exercise(name="Barbell Bicep Curl", muscle_group="Arms", equipment="barbell", difficulty="beginner", type="strength", calories_per_min=5.5, stat_affinity="str", default_sets=3, default_reps=10, default_rest_seconds=60),
    Exercise(name="Dumbbell Hammer Curl", muscle_group="Arms", equipment="dumbbell", difficulty="beginner", type="strength", calories_per_min=5.5, stat_affinity="str", default_sets=3, default_reps=12, default_rest_seconds=60),
    Exercise(name="Triceps Pushdown", muscle_group="Arms", equipment="cable", difficulty="beginner", type="strength", calories_per_min=5.5, stat_affinity="str", default_sets=3, default_reps=10, default_rest_seconds=60),
    Exercise(name="Overhead Triceps Extension", muscle_group="Arms", equipment="dumbbell", difficulty="beginner", type="strength", calories_per_min=5.5, stat_affinity="str", default_sets=3, default_reps=10, default_rest_seconds=60),

    # Core & Cardio
    Exercise(name="Interval Sprints", muscle_group="Core", equipment="bodyweight", difficulty="intermediate", type="cardio", calories_per_min=12.0, stat_affinity="agi", default_sets=4, default_reps=60, default_rest_seconds=60),
    Exercise(name="Hanging Leg Raise", muscle_group="Core", equipment="bodyweight", difficulty="intermediate", type="strength", calories_per_min=6.0, stat_affinity="agi", default_sets=3, default_reps=12, default_rest_seconds=60),
    Exercise(name="Plank Hold", muscle_group="Core", equipment="bodyweight", difficulty="beginner", type="strength", calories_per_min=5.0, stat_affinity="end", default_sets=3, default_reps=60, default_rest_seconds=60),
    Exercise(name="Russian Twists", muscle_group="Core", equipment="dumbbell", difficulty="beginner", type="strength", calories_per_min=5.5, stat_affinity="agi", default_sets=3, default_reps=20, default_rest_seconds=45),
    Exercise(name="Yoga Stretching", muscle_group="Core", equipment="bodyweight", difficulty="beginner", type="flexibility", calories_per_min=4.0, stat_affinity="vit", default_sets=3, default_reps=60, default_rest_seconds=30),
    Exercise(name="Foam Rolling", muscle_group="Back", equipment="bodyweight", difficulty="beginner", type="flexibility", calories_per_min=3.5, stat_affinity="vit", default_sets=1, default_reps=60, default_rest_seconds=30)
]

def get_all_exercises() -> List[Exercise]:
    return EXERCISES_DB

def filter_exercises(muscle_group: str = None, equipment: List[str] = None, difficulty: str = None) -> List[Exercise]:
    filtered = EXERCISES_DB
    if muscle_group:
        filtered = [e for e in filtered if e.muscle_group.lower() == muscle_group.lower()]
    if equipment:
        filtered = [e for e in filtered if e.equipment in equipment]
    if difficulty:
        filtered = [e for e in filtered if e.difficulty == difficulty]
    return filtered
