from pydantic import BaseModel
from typing import List, Optional

class MealBase(BaseModel):
    name: str
    calories: float
    protein: float
    carbs: float
    fat: float
    diet_type: str
    cuisine: str
    allergies: List[str]
    meal_type: str # breakfast, lunch, dinner, snack
    cost_tier: str # low, medium, high

class Meal(MealBase):
    pass

class DailyMacros(BaseModel):
    calories: float
    protein: float
    carbs: float
    fat: float

class DailyDietPlan(BaseModel):
    day_name: str
    meals: List[Meal]
    total_macros: DailyMacros
    target_macros: DailyMacros

class DietPlan(BaseModel):
    days: List[DailyDietPlan]
    weekly_target_macros: DailyMacros

class DietPreference(BaseModel):
    age: int
    gender: str # male, female
    weight_kg: float
    height_cm: float
    activity_level: str # sedentary, light, moderate, active, very_active
    goal: str # lose_weight, maintain, gain_muscle
    diet_type: str # omnivore, vegetarian, vegan, paleo, keto
    allergies: List[str]
