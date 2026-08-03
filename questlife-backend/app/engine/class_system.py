CHARACTER_CLASSES = {
    'warrior': {
        'name': 'Warrior',
        'icon': '⚔️',
        'description': 'Masters of raw strength. Bonus XP for weightlifting and resistance training.',
        'primary_stat': 'strength',
        'xp_affinity_actions': ['workout_completed'],
        'xp_affinity_multiplier': 1.2,
        'stat_growth': {'strength': 1.2, 'endurance': 1.1},
        'color': '#ef4444',
    },
    'ranger': {
        'name': 'Ranger',
        'icon': '🏹',
        'description': 'Swift and agile. Bonus XP for cardio, running, and speed training.',
        'primary_stat': 'speed',
        'xp_affinity_actions': ['steps_goal_achieved'],
        'xp_affinity_multiplier': 1.2,
        'stat_growth': {'speed': 1.2, 'endurance': 1.1},
        'color': '#22c55e',
    },
    'paladin': {
        'name': 'Paladin',
        'icon': '🛡️',
        'description': 'Unwavering endurance. Bonus XP for long workouts and high-rep training.',
        'primary_stat': 'endurance',
        'xp_affinity_actions': ['workout_completed', 'weekly_boss_completed'],
        'xp_affinity_multiplier': 1.2,
        'stat_growth': {'endurance': 1.2, 'strength': 1.1},
        'color': '#3b82f6',
    },
    'monk': {
        'name': 'Monk',
        'icon': '🧘',
        'description': 'Masters of mind and body. Bonus XP for yoga, meditation, and healthy meals.',
        'primary_stat': 'discipline',
        'xp_affinity_actions': ['healthy_meal_logged'],
        'xp_affinity_multiplier': 1.2,
        'stat_growth': {'discipline': 1.2, 'recovery': 1.1},
        'color': '#a855f7',
    },
    'phoenix': {
        'name': 'Phoenix',
        'icon': '🔥',
        'description': 'Relentless consistency. Bonus XP for maintaining streaks and daily check-ins.',
        'primary_stat': 'consistency',
        'xp_affinity_actions': ['daily_quest_completed'],
        'xp_affinity_multiplier': 1.2,
        'stat_growth': {'consistency': 1.2, 'discipline': 1.1},
        'color': '#f97316',
    },
    'druid': {
        'name': 'Druid',
        'icon': '🌿',
        'description': 'Guardians of balance and recovery. Bonus XP for rest, sleep, and restoration.',
        'primary_stat': 'recovery',
        'xp_affinity_actions': ['healthy_meal_logged'],
        'xp_affinity_multiplier': 1.2,
        'stat_growth': {'recovery': 1.2, 'endurance': 1.1},
        'color': '#14b8a6',
    },
}

def get_class(class_name: str) -> dict:
    """Get class info, raise ValueError if invalid."""
    class_key = class_name.lower()
    if class_key not in CHARACTER_CLASSES:
        raise ValueError(f"Invalid character class: {class_name}")
    return CHARACTER_CLASSES[class_key]

def get_xp_affinity(class_name: str, action: str) -> float:
    """Returns the XP multiplier for a given class and action."""
    try:
        cls_info = get_class(class_name)
    except ValueError:
        return 1.0
        
    if action in cls_info['xp_affinity_actions']:
        return cls_info['xp_affinity_multiplier']
    return 1.0

def get_all_classes() -> dict:
    """Return all classes."""
    return CHARACTER_CLASSES

def get_class_names() -> list[str]:
    """Return list of valid class names."""
    return list(CHARACTER_CLASSES.keys())
