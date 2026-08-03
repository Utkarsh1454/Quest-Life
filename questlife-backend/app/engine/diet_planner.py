from app.schemas.diet import DietPreference, DietPlan, DailyDietPlan, DailyMacros, Meal
from app.engine.meal_db import filter_meals
import random

def calculate_tdee(pref: DietPreference) -> float:
    # Mifflin-St Jeor
    if pref.gender == 'male':
        bmr = 10 * pref.weight_kg + 6.25 * pref.height_cm - 5 * pref.age + 5
    else:
        bmr = 10 * pref.weight_kg + 6.25 * pref.height_cm - 5 * pref.age - 161
        
    multipliers = {
        'sedentary': 1.2,
        'light': 1.375,
        'moderate': 1.55,
        'active': 1.725,
        'very_active': 1.9
    }
    tdee = bmr * multipliers.get(pref.activity_level, 1.2)
    
    if pref.goal == 'lose_weight':
        tdee -= 500
    elif pref.goal == 'gain_muscle':
        tdee += 300
        
    return tdee

def generate_diet_plan(pref: DietPreference) -> DietPlan:
    tdee = calculate_tdee(pref)
    
    protein_cal = tdee * 0.3
    carbs_cal = tdee * 0.4
    fat_cal = tdee * 0.3
    
    target = DailyMacros(
        calories=tdee,
        protein=protein_cal / 4,
        carbs=carbs_cal / 4,
        fat=fat_cal / 9
    )
    
    days = []
    meals_pool = filter_meals(diet_type=pref.diet_type)
    if not meals_pool:
        meals_pool = filter_meals()
        
    for day_idx in range(7):
        breakfasts = [m for m in meals_pool if m.meal_type == 'breakfast'] or meals_pool[:5]
        lunches = [m for m in meals_pool if m.meal_type == 'lunch'] or meals_pool[:5]
        dinners = [m for m in meals_pool if m.meal_type == 'dinner'] or meals_pool[:5]
        
        day_meals = [
            random.choice(breakfasts),
            random.choice(lunches),
            random.choice(dinners)
        ]
        
        day_cal = sum(m.calories for m in day_meals)
        day_pro = sum(m.protein for m in day_meals)
        day_carb = sum(m.carbs for m in day_meals)
        day_fat = sum(m.fat for m in day_meals)
        
        days.append(
            DailyDietPlan(
                day_name=f"Day {day_idx+1}",
                meals=day_meals,
                total_macros=DailyMacros(calories=day_cal, protein=day_pro, carbs=day_carb, fat=day_fat),
                target_macros=target
            )
        )
        
    weekly_target = DailyMacros(
        calories=target.calories * 7,
        protein=target.protein * 7,
        carbs=target.carbs * 7,
        fat=target.fat * 7
    )
    return DietPlan(days=days, weekly_target_macros=weekly_target)
