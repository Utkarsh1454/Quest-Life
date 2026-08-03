from app.engine.stats_engine import stat_points_per_level, auto_allocate_stats, get_stat_bonuses

def test_stat_points_per_level():
    assert stat_points_per_level(2) == 3
    assert stat_points_per_level(9) == 3
    assert stat_points_per_level(10) == 5
    assert stat_points_per_level(20) == 5
    assert stat_points_per_level(25) == 8
    assert stat_points_per_level(50) == 8

def test_auto_allocate_stats_workout_heavy():
    history = ['workout', 'workout', 'meal']
    stats = auto_allocate_stats(history, 3)
    
    # Workout gives strength/endurance, meal gives discipline/consistency
    # We allocated 3 points. Strength and endurance have highest weights
    assert sum(stats.values()) == 3
    assert stats['strength'] >= 1
    assert stats['endurance'] >= 1

def test_auto_allocate_stats_mixed():
    history = ['cardio', 'yoga', 'sleep', 'steps']
    stats = auto_allocate_stats(history, 5)
    assert sum(stats.values()) == 5
    
def test_auto_allocate_stats_empty():
    history = []
    stats = auto_allocate_stats(history, 6)
    assert sum(stats.values()) == 6
    assert all(v == 1 for v in stats.values())
    
    stats2 = auto_allocate_stats(history, 3)
    assert sum(stats2.values()) == 3

def test_get_stat_bonuses():
    warrior = get_stat_bonuses('warrior')
    assert warrior['strength'] == 1.2
    assert warrior['speed'] == 1.0
    
    ranger = get_stat_bonuses('ranger')
    assert ranger['speed'] == 1.2
    assert ranger['endurance'] == 1.0
    
    paladin = get_stat_bonuses('paladin')
    assert paladin['endurance'] == 1.2
    
    monk = get_stat_bonuses('monk')
    assert monk['discipline'] == 1.2
    
    phoenix = get_stat_bonuses('phoenix')
    assert phoenix['consistency'] == 1.2
    
    druid = get_stat_bonuses('druid')
    assert druid['recovery'] == 1.2
