from datetime import date

def streak_xp_bonus(streak_days: int) -> int:
    """Bonus XP for streak. 0 if no streak, then 10 + (streak_days - 1) * 5, capped at 50."""
    if streak_days <= 0:
        return 0
    bonus = 10 + (streak_days - 1) * 5
    return min(bonus, 50)

def streak_multiplier(streak_days: int) -> float:
    """Multiplier for XP based on streak. 1.0 + min(streak_days * 0.02, 0.5)"""
    return 1.0 + min(streak_days * 0.02, 0.5)

def check_streak(last_activity_date: date | None, today: date) -> tuple[int, bool, bool]:
    """
    Check streak status.
    Returns (action, streak_broken, is_same_day)
    action: +1 if continued/started, 0 if same day, 1 if broken (starting fresh)
    """
    if last_activity_date is None:
        return (1, False, False)
        
    delta = (today - last_activity_date).days
    
    if delta == 0:
        return (0, False, True)
    elif delta == 1:
        return (1, False, False)
    else:
        # Broken streak, starting fresh today = day 1
        return (1, True, False)

def calculate_streak_freeze(streak_days: int) -> int:
    """Number of freeze days earned. 1 freeze per 7 days of streak, max 3."""
    return min(streak_days // 7, 3)
