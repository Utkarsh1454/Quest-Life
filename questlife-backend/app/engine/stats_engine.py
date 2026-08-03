def stat_points_per_level(level: int) -> int:
    """Points earned per level-up."""
    if level % 25 == 0:
        return 8
    if level % 10 == 0:
        return 5
    return 3

def auto_allocate_stats(activity_history: list[str], points: int) -> dict[str, int]:
    """Distribute stat points weighted by activity history."""
    stats = {
        'strength': 0,
        'endurance': 0,
        'speed': 0,
        'discipline': 0,
        'consistency': 0,
        'recovery': 0
    }
    
    if not activity_history:
        # Distribute evenly
        stat_keys = list(stats.keys())
        for i in range(points):
            stats[stat_keys[i % len(stat_keys)]] += 1
        return stats
        
    weights = {k: 0 for k in stats.keys()}
    
    for activity in activity_history:
        activity = activity.lower()
        if activity == 'workout':
            weights['strength'] += 1
            weights['endurance'] += 1
        elif activity in ['cardio', 'running']:
            weights['speed'] += 1
            weights['endurance'] += 1
        elif activity in ['yoga', 'meditation']:
            weights['discipline'] += 1
            weights['recovery'] += 1
        elif activity == 'meal':
            weights['discipline'] += 1
            weights['consistency'] += 1
        elif activity == 'steps':
            weights['speed'] += 1
            weights['consistency'] += 1
        elif activity == 'sleep':
            weights['recovery'] += 1
            
    total_weight = sum(weights.values())
    if total_weight == 0:
        stat_keys = list(stats.keys())
        for i in range(points):
            stats[stat_keys[i % len(stat_keys)]] += 1
        return stats
        
    # Allocate points based on weights
    for _ in range(points):
        # find the stat with highest weight
        best_stat = max(weights.items(), key=lambda x: x[1])[0]
        stats[best_stat] += 1
        # Decrease its weight slightly so others get a chance if points > 1
        # Instead of just picking the highest, we could do proper proportional distribution, 
        # but picking highest and reducing weight by (total_weight / points) works roughly
        # For simplicity, we just distribute 1 point to max, and remove 1 from its weight?
        # Actually it's better to just calculate float points and round, but it might not sum correctly.
        # Let's do simple distribution:
        weights[best_stat] -= (total_weight / points)
        
    return stats

def get_stat_bonuses(character_class: str) -> dict[str, float]:
    """Return stat growth multipliers for a class."""
    bonuses = {
        'strength': 1.0,
        'endurance': 1.0,
        'speed': 1.0,
        'discipline': 1.0,
        'consistency': 1.0,
        'recovery': 1.0
    }
    
    c = character_class.lower()
    if c == 'warrior':
        bonuses['strength'] = 1.2
    elif c == 'ranger':
        bonuses['speed'] = 1.2
    elif c == 'paladin':
        bonuses['endurance'] = 1.2
    elif c == 'monk':
        bonuses['discipline'] = 1.2
    elif c == 'phoenix':
        bonuses['consistency'] = 1.2
    elif c == 'druid':
        bonuses['recovery'] = 1.2
        
    return bonuses
