"""QuestLife XP Progression Engine.

Implements RPG-style progression principles:
1. Consistency > Intensity
2. No Infinite Farming & Daily Limits
3. Difficulty & Performance Confidence
4. Recovery & Quality Multipliers
5. Quadratic Level Scaling (XP_next = 100 + 25L + 8L^2)
6. Calibrated Nutrition, Daily Quest, and Fitness Score Calculations
"""

# Quadratic level curve constants
# XP_next(L) = 100 + 25*L + 8*L^2 where L is current level (L >= 1)
def xp_required(level: int) -> int:
    """XP required to level up from `level` to `level + 1`."""
    if level < 1:
        return 0
    return 100 + 25 * level + 8 * (level ** 2)

def cumulative_xp_for_level(level: int) -> int:
    """Total XP accumulated to reach a specific `level` starting from level 1 (0 XP)."""
    if level <= 1:
        return 0
    return sum(xp_required(lvl) for lvl in range(1, level))

def level_for_xp(total_xp: int) -> int:
    """Calculates user level based on cumulative total XP."""
    if total_xp <= 0:
        return 1
    level = 1
    while True:
        if cumulative_xp_for_level(level + 1) > total_xp:
            return level
        level += 1

def xp_progress_in_level(total_xp: int) -> tuple[int, int, float]:
    """Returns (current_xp_in_level, xp_needed_for_next, progress_percent)."""
    level = level_for_xp(total_xp)
    base_xp_for_level = cumulative_xp_for_level(level)
    current_xp_in_level = max(0, total_xp - base_xp_for_level)
    xp_needed_for_next = xp_required(level)
    
    progress_percent = 0.0
    if xp_needed_for_next > 0:
        progress_percent = min(100.0, (current_xp_in_level / xp_needed_for_next) * 100.0)
        
    return current_xp_in_level, xp_needed_for_next, round(progress_percent, 2)

def check_level_up(old_total_xp: int, new_total_xp: int) -> tuple[bool, int, int]:
    """Check if the user leveled up from old_total_xp to new_total_xp."""
    old_level = level_for_xp(old_total_xp)
    new_level = level_for_xp(new_total_xp)
    return new_level > old_level, old_level, new_level


# --- WORKOUT XP MULTIPLIERS & FORMULA ---

DIFFICULTY_MULTIPLIERS = {
    'easy': 0.8,
    'moderate': 1.0,
    'medium': 1.0,
    'hard': 1.15,
    'elite': 1.3,
    'extreme': 1.3,
}

QUALITY_SCORES = {
    'poor': 0.70,
    'average': 0.90,
    'good': 1.00,
    'excellent': 1.10,
    'perfect': 1.20,
}

RECOVERY_MULTIPLIERS = {
    'excellent': 1.05,
    'good': 1.00,
    'fair': 0.95,
    'poor': 0.85,
    'overtrained': 0.70,
}

def get_base_workout_xp(duration_minutes: float) -> int:
    """Base workout XP B determined by session duration with hard caps."""
    if duration_minutes < 15:
        return 8
    elif duration_minutes < 30:
        return 18
    elif duration_minutes < 45:
        return 28
    elif duration_minutes < 60:
        return 35
    elif duration_minutes < 90:
        return 42
    else:
        return 45  # 90+ min hard cap

def get_consistency_multiplier(adherence_ratio: float = 0.5) -> float:
    """Rolling 30-day adherence consistency multiplier C = 0.8 + 0.4 * Adherence."""
    clamped = max(0.0, min(1.0, adherence_ratio))
    return round(0.8 + 0.4 * clamped, 3)

def get_workout_streak_bonus(streak_days: int) -> float:
    """Workout combo streak bonus."""
    if streak_days >= 365:
        return 0.25
    elif streak_days >= 90:
        return 0.18
    elif streak_days >= 30:
        return 0.12
    elif streak_days >= 14:
        return 0.08
    elif streak_days >= 7:
        return 0.05
    elif streak_days >= 3:
        return 0.02
    return 0.0

def calculate_workout_xp(
    duration_minutes: float = 45.0,
    difficulty: str = 'moderate',
    quality: str = 'good',
    adherence_ratio: float = 0.5,
    recovery_state: str = 'good',
    streak_days: int = 0,
    confidence: float = 1.0,
    workout_days_pref: int = 3,
    is_planned: bool = True,
    is_extra: bool = False,
    all_sets_completed: bool = False,
    progressive_overload: bool = False,
    cardio_completed: bool = False,
    goal_affinity_matched: bool = False,
    class_affinity: float = 1.0,
) -> int:
    """Calculates total workout XP using:
    XP = B * D * Q * C * R * StreakBonus * Preferences * ClassAffinity + Flat Add-ons
    """
    base_b = get_base_workout_xp(duration_minutes)
    
    declared_diff = DIFFICULTY_MULTIPLIERS.get(difficulty.lower(), 1.0)
    effective_diff = declared_diff * max(0.5, min(1.0, confidence))
    
    q_score = QUALITY_SCORES.get(quality.lower(), 1.0)
    consistency_mult = get_consistency_multiplier(adherence_ratio)
    recovery_mult = RECOVERY_MULTIPLIERS.get(recovery_state.lower(), 1.0)
    
    core_xp = base_b * effective_diff * q_score * consistency_mult * recovery_mult
    
    # Workout-only streak bonus
    streak_pct = get_workout_streak_bonus(streak_days)
    core_xp *= (1.0 + streak_pct)
    
    # Workout days preference modifier
    pref_mult = 1.0
    if workout_days_pref == 4:
        pref_mult = 1.02
    elif workout_days_pref == 5:
        pref_mult = 1.05
    elif workout_days_pref >= 6:
        pref_mult = 1.08
    core_xp *= pref_mult
    
    # Goal affinity (+5% for matching type)
    if goal_affinity_matched:
        core_xp *= 1.05
        
    core_xp *= class_affinity
    
    # Add-on flat rewards
    addons = 0
    if is_planned:
        addons += 35
    elif is_extra:
        addons += 15
        
    if all_sets_completed:
        addons += 8
    if progressive_overload:
        addons += 5
    if cardio_completed:
        addons += 20
        
    return round(core_xp) + addons


# --- NUTRITION & OTHER ACTIVITIES XP ---

def calculate_nutrition_xp(
    protein_diff_g: float | None = None,
    calorie_diff_kcal: float | None = None,
    water_goal_reached: bool = False,
    meal_type: str | None = None,
    meals_logged_today: int = 0
) -> int:
    """Calculates nutrition XP based on goals and meal logging rules."""
    xp = 0
    if protein_diff_g is not None and abs(protein_diff_g) <= 5.0:
        xp += 10
    if calorie_diff_kcal is not None:
        abs_cal = abs(calorie_diff_kcal)
        if abs_cal <= 50:
            xp += 10
        elif abs_cal <= 150:
            xp += 6
    if water_goal_reached:
        xp += 5
    if meal_type in ['breakfast', 'lunch', 'dinner']:
        if meals_logged_today < 3:
            xp += 2
    return xp


# --- GENERAL ACTION BACKWARD COMPATIBILITY ---

BASE_ACTION_XP = {
    'login': 2,
    'workout_completed': 35,
    'extra_workout': 15,
    'daily_quest_easy': 5,
    'daily_quest_medium': 8,
    'daily_quest_hard': 12,
    'daily_quest_legendary': 20,
    'daily_quest_completed': 8,
    'healthy_meal_logged': 10,
    'meal_logged': 2,
    'steps_goal_achieved': 10,
    'water_goal_achieved': 5,
    'sleep_goal_achieved': 10,
    'stretch_mobility': 5,
    'weekly_boss_completed': 80,
    'monthly_challenge': 250,
    'community_challenge': 80,
}

def calculate_xp(
    action: str, 
    streak_days: int = 0, 
    intensity: str = 'medium', 
    class_affinity: float = 1.0
) -> int:
    """Backward compatible XP calculation function for standard actions."""
    base_xp = BASE_ACTION_XP.get(action, 10)
    
    # If action is workout_completed, use calculate_workout_xp default
    if action == 'workout_completed':
        return calculate_workout_xp(
            duration_minutes=45.0,
            difficulty=intensity,
            streak_days=streak_days,
            class_affinity=class_affinity
        )
        
    # For non-workout activities, basic multipliers apply softly
    intensity_mult = DIFFICULTY_MULTIPLIERS.get(intensity.lower(), 1.0)
    final_xp = base_xp * intensity_mult * class_affinity
    return max(1, round(final_xp))


# --- HIDDEN FITNESS SCORE ---

def calculate_fitness_score(
    workout_adherence: float = 0.8,
    nutrition_adherence: float = 0.7,
    recovery_score: float = 0.8,
    progressive_overload: float = 0.6,
    cardio_score: float = 0.7,
    mobility_score: float = 0.5
) -> float:
    """Calculates hidden fitness score (0-100) based on weighted parameters:
    30% Workout Adherence
    25% Nutrition Adherence
    20% Recovery
    10% Progressive Overload
    10% Cardio
    5% Mobility
    """
    w_adh = max(0.0, min(1.0, workout_adherence))
    n_adh = max(0.0, min(1.0, nutrition_adherence))
    rec = max(0.0, min(1.0, recovery_score))
    po = max(0.0, min(1.0, progressive_overload))
    cardio = max(0.0, min(1.0, cardio_score))
    mob = max(0.0, min(1.0, mobility_score))
    
    total = (
        0.30 * w_adh +
        0.25 * n_adh +
        0.20 * rec +
        0.10 * po +
        0.10 * cardio +
        0.05 * mob
    ) * 100.0
    
    return round(total, 1)
