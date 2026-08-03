"""Recommender system for exercises and meals."""

from typing import Dict, Any, List

class Recommender:
    """Provides recommendations based on user preferences."""
    
    @staticmethod
    def get_recommendations(goal: str, experience_level: str) -> Dict[str, List[str]]:
        """Get simple recommendations."""
        exercises = []
        meals = []
        
        if goal == "lose_weight":
            exercises = ["Running", "HIIT", "Cycling", "Jump Rope"]
            meals = ["Grilled Chicken Salad", "Oatmeal with Berries", "Lentil Soup"]
        elif goal == "build_muscle":
            exercises = ["Deadlifts", "Squats", "Bench Press", "Pull-ups"]
            meals = ["Steak and Sweet Potato", "Protein Shake", "Greek Yogurt with Nuts"]
        else:
            exercises = ["Yoga", "Brisk Walking", "Bodyweight Squats"]
            meals = ["Avocado Toast", "Quinoa Bowl", "Fruit Smoothie"]
            
        if experience_level == "beginner":
            exercises = [ex + " (Beginner Friendly)" for ex in exercises[:2]]
            
        return {
            "exercises": exercises,
            "meals": meals
        }
