import pytest
from app.engine.xp_engine import (
    xp_required, cumulative_xp_for_level, level_for_xp,
    xp_progress_in_level, calculate_xp, calculate_workout_xp,
    calculate_nutrition_xp, calculate_fitness_score,
    check_level_up,
    get_base_workout_xp, get_consistency_multiplier
)

def test_quadratic_xp_required():
    assert xp_required(1) == 133
    assert xp_required(5) == 425
    assert xp_required(10) == 1150
    assert xp_required(20) == 3800
    assert xp_required(30) == 8050
    assert xp_required(40) == 13900
    assert xp_required(50) == 21350

def test_cumulative_xp():
    cum_1 = cumulative_xp_for_level(1)
    assert cum_1 == 0
    cum_2 = cumulative_xp_for_level(2)
    assert cum_2 == 133
    cum_3 = cumulative_xp_for_level(3)
    assert cum_3 == 133 + 182

def test_level_for_xp():
    assert level_for_xp(0) == 1
    assert level_for_xp(132) == 1
    assert level_for_xp(133) == 2
    cum_10 = cumulative_xp_for_level(10)
    assert level_for_xp(cum_10) == 10

def test_xp_progress_in_level():
    cum_10 = cumulative_xp_for_level(10)
    curr, needed, pct = xp_progress_in_level(cum_10)
    assert curr == 0
    assert needed == xp_required(10)
    assert pct == 0.0

def test_base_workout_xp_caps():
    assert get_base_workout_xp(10) == 8
    assert get_base_workout_xp(20) == 18
    assert get_base_workout_xp(35) == 28
    assert get_base_workout_xp(50) == 35
    assert get_base_workout_xp(75) == 42
    assert get_base_workout_xp(120) == 45  # 90+ hard cap

def test_consistency_multiplier():
    assert get_consistency_multiplier(0.2) == 0.88
    assert get_consistency_multiplier(0.5) == 1.00
    assert get_consistency_multiplier(0.8) == 1.12
    assert get_consistency_multiplier(1.0) == 1.20

def test_calculate_workout_xp():
    # 45 min workout (base 35), moderate (1.0), good quality (1.0), adherence 50% (1.0), good recovery (1.0), planned (+35)
    # core = 35, total = 35 + 35 = 70
    xp = calculate_workout_xp(duration_minutes=45, difficulty='moderate', quality='good', adherence_ratio=0.5, recovery_state='good', is_planned=True)
    assert xp == 70

    # Test confidence penalty: Elite (1.3) with 0.75 confidence -> 0.975 effective diff
    xp_conf = calculate_workout_xp(duration_minutes=45, difficulty='elite', confidence=0.75, is_planned=False)
    assert xp_conf == round(35 * 0.975)

def test_calculate_nutrition_xp():
    # Protein within 5g (+10), Calories exact (+10), Water (+5), Meal (+2)
    xp = calculate_nutrition_xp(protein_diff_g=2.0, calorie_diff_kcal=10.0, water_goal_reached=True, meal_type='lunch', meals_logged_today=0)
    assert xp == 27

def test_calculate_fitness_score():
    score = calculate_fitness_score(workout_adherence=1.0, nutrition_adherence=1.0, recovery_score=1.0, progressive_overload=1.0, cardio_score=1.0, mobility_score=1.0)
    assert score == 100.0
    
    score_mid = calculate_fitness_score(workout_adherence=0.5, nutrition_adherence=0.5, recovery_score=0.5, progressive_overload=0.5, cardio_score=0.5, mobility_score=0.5)
    assert score_mid == 50.0

def test_check_level_up():
    cum_1 = cumulative_xp_for_level(1)
    cum_2 = cumulative_xp_for_level(2)
    leveled, old, new = check_level_up(cum_1, cum_2)
    assert leveled is True
    assert old == 1
    assert new == 2
