from datetime import date, timedelta
from app.engine.streak_engine import streak_xp_bonus, streak_multiplier, check_streak, calculate_streak_freeze

def test_streak_xp_bonus():
    assert streak_xp_bonus(0) == 0
    assert streak_xp_bonus(1) == 10
    assert streak_xp_bonus(2) == 15
    assert streak_xp_bonus(5) == 30
    assert streak_xp_bonus(9) == 50
    assert streak_xp_bonus(15) == 50

def test_streak_multiplier():
    assert streak_multiplier(0) == 1.0
    assert streak_multiplier(10) == 1.2
    assert streak_multiplier(25) == 1.5
    assert streak_multiplier(50) == 1.5

def test_check_streak():
    today = date(2023, 10, 10)
    
    # New user
    action, broken, same = check_streak(None, today)
    assert action == 1
    assert broken is False
    assert same is False
    
    # Same day
    action, broken, same = check_streak(today, today)
    assert action == 0
    assert broken is False
    assert same is True
    
    # Consecutive day
    yesterday = today - timedelta(days=1)
    action, broken, same = check_streak(yesterday, today)
    assert action == 1
    assert broken is False
    assert same is False
    
    # Gap day
    two_days_ago = today - timedelta(days=2)
    action, broken, same = check_streak(two_days_ago, today)
    assert action == 1
    assert broken is True
    assert same is False

def test_streak_freeze():
    assert calculate_streak_freeze(0) == 0
    assert calculate_streak_freeze(6) == 0
    assert calculate_streak_freeze(7) == 1
    assert calculate_streak_freeze(14) == 2
    assert calculate_streak_freeze(21) == 3
    assert calculate_streak_freeze(28) == 3
