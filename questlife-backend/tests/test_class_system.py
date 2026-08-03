import pytest
from app.engine.class_system import get_class, get_xp_affinity, get_all_classes, get_class_names

def test_get_class():
    warrior = get_class('warrior')
    assert warrior['name'] == 'Warrior'
    assert warrior['primary_stat'] == 'strength'
    
    with pytest.raises(ValueError):
        get_class('invalid_class')

def test_get_xp_affinity():
    # Warrior gets bonus for workout_completed
    assert get_xp_affinity('warrior', 'workout_completed') == 1.2
    assert get_xp_affinity('warrior', 'daily_quest_completed') == 1.0
    
    # Ranger gets bonus for steps_goal_achieved
    assert get_xp_affinity('ranger', 'steps_goal_achieved') == 1.2
    assert get_xp_affinity('ranger', 'workout_completed') == 1.0

def test_get_all_classes():
    classes = get_all_classes()
    assert len(classes) == 6
    assert 'warrior' in classes
    assert 'ranger' in classes
    assert 'paladin' in classes
    assert 'monk' in classes
    assert 'phoenix' in classes
    assert 'druid' in classes

def test_get_class_names():
    names = get_class_names()
    assert len(names) == 6
    assert 'warrior' in names
    assert 'druid' in names
