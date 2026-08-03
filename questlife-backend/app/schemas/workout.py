from pydantic import BaseModel
from typing import List, Optional, Dict

class ExerciseBase(BaseModel):
    name: str
    muscle_group: str
    equipment: str
    difficulty: str
    type: str
    calories_per_min: float
    stat_affinity: str
    default_sets: int
    default_reps: int
    default_rest_seconds: int

class Exercise(ExerciseBase):
    pass

class WorkoutDay(BaseModel):
    day_name: str
    focus_area: str
    exercises: List[Exercise]
    estimated_calories: float
    stat_affinity: str
    total_minutes: float

class WeeklyWorkoutPlan(BaseModel):
    days: List[WorkoutDay]
    total_calories: float
    primary_stat_affinity: str
    
class WorkoutPreference(BaseModel):
    fitness_level: str  # beginner, intermediate, advanced
    goal: str  # weight_loss, muscle_gain, general_fitness
    days_per_week: int
    preferred_equipment: List[str]  # e.g., ["dumbbell", "bodyweight"]
