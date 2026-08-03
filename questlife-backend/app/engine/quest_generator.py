import random

def generate_daily_quests(user_id: int, user_level: int):
    quests = [
        {"title": "Complete 1 Workout", "exp_reward": 50 * user_level, "stat_reward": {"str": 1}},
        {"title": "Log Meals", "exp_reward": 30 * user_level, "stat_reward": {"vit": 1}},
        {"title": "Drink Water", "exp_reward": 20 * user_level, "stat_reward": {"vit": 1}},
    ]
    return random.sample(quests, k=2)
