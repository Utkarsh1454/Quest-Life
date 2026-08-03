from fastapi import APIRouter
from app.schemas.diet import DietPreference, DietPlan, DailyMacros
from app.engine.diet_planner import generate_diet_plan, calculate_tdee

router = APIRouter()

@router.post("/plan", response_model=DietPlan)
def create_diet_plan(pref: DietPreference):
    return generate_diet_plan(pref)

@router.post("/plan/regenerate", response_model=DietPlan)
def regenerate_diet_plan(pref: DietPreference):
    return generate_diet_plan(pref)

@router.post("/macros", response_model=DailyMacros)
def get_macros(pref: DietPreference):
    tdee = calculate_tdee(pref)
    return DailyMacros(
        calories=tdee,
        protein=(tdee * 0.3) / 4,
        carbs=(tdee * 0.4) / 4,
        fat=(tdee * 0.3) / 9
    )
