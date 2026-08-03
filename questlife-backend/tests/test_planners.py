import pytest
from app.schemas.workout import WorkoutPreference
from app.engine.workout_planner import generate_workout_plan
from app.schemas.diet import DietPreference
from app.engine.diet_planner import generate_diet_plan, calculate_tdee

def test_workout_planner():
    pref = WorkoutPreference(
        fitness_level="beginner",
        goal="weight_loss",
        days_per_week=4,
        preferred_equipment=["dumbbell"]
    )
    plan = generate_workout_plan(pref)
    
    assert len(plan.days) == 7
    # 4 active days, 3 rest days
    active_days = [d for d in plan.days if len(d.exercises) > 0]
    rest_days = [d for d in plan.days if len(d.exercises) == 0]
    assert len(active_days) == 4
    assert len(rest_days) == 3

def test_tdee_calculation():
    pref = DietPreference(
        age=30,
        gender="male",
        weight_kg=80,
        height_cm=180,
        activity_level="sedentary",
        goal="maintain",
        diet_type="omnivore",
        allergies=[]
    )
    tdee = calculate_tdee(pref)
    assert tdee > 1500

def test_diet_planner():
    pref = DietPreference(
        age=30,
        gender="female",
        weight_kg=65,
        height_cm=165,
        activity_level="moderate",
        goal="lose_weight",
        diet_type="vegetarian",
        allergies=[]
    )
    plan = generate_diet_plan(pref)
    
    assert len(plan.days) == 7
    for day in plan.days:
        assert len(day.meals) == 3
        # Ensure daily target macros is present
        assert day.target_macros.calories > 0

    assert plan.weekly_target_macros.calories > 0
