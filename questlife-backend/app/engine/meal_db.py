from typing import List
from app.schemas.diet import Meal

MEALS_DB: List[Meal] = [
    Meal(name=f"Meal {i}", calories=300 + (i*10), protein=20 + (i%10), carbs=30 + (i%15), fat=10 + (i%5),
         diet_type="omnivore" if i % 3 == 0 else ("vegetarian" if i % 3 == 1 else "vegan"),
         cuisine="global", allergies=[], meal_type="breakfast" if i % 4 == 0 else ("lunch" if i % 4 == 1 else ("dinner" if i % 4 == 2 else "snack")),
         cost_tier="medium")
    for i in range(1, 45)
]

def get_all_meals() -> List[Meal]:
    return MEALS_DB

def filter_meals(diet_type: str = None, meal_type: str = None) -> List[Meal]:
    filtered = MEALS_DB
    if diet_type:
        filtered = [m for m in filtered if m.diet_type == diet_type]
    if meal_type:
        filtered = [m for m in filtered if m.meal_type == meal_type]
    return filtered
