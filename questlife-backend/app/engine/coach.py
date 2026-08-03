"""AI Coach system for generating dynamic messages."""

from typing import Dict, Any, List

class AICoach:
    """State-aware AI Coach message generator."""
    
    @staticmethod
    def generate_message(
        user_stats: Dict[str, Any],
        streak: int,
        preferences: Dict[str, Any]
    ) -> Dict[str, str]:
        """Generate a contextual message based on user state."""
        message = ""
        cta = ""
        
        level = user_stats.get("level", 1)
        strength = user_stats.get("strength", 10)
        endurance = user_stats.get("endurance", 10)
        
        # Analyze state
        if streak >= 7:
            message = f"Incredible {streak}-day streak! You are unstoppable."
            cta = "Keep the momentum going with a quick workout today!"
        elif streak == 0:
            message = "Every hero needs a rest, but it's time to get back in the game."
            cta = "Log a small healthy meal or a quick walk to restart your streak."
        else:
            if strength > endurance + 5:
                message = "Your strength is impressive, but your endurance is lagging behind."
                cta = "Try adding some cardio to your routine to balance your stats."
            elif endurance > strength + 5:
                message = "Great stamina! However, your strength needs some work."
                cta = "Incorporate some resistance training this week."
            else:
                message = f"Level {level} is looking good on you. Keep pushing forward!"
                cta = "Check out your quests for today and earn some XP!"
                
        return {
            "message": message,
            "cta": cta
        }
