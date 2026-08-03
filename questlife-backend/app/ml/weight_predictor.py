"""Weight prediction ML model."""

import numpy as np

try:
    from sklearn.linear_model import LinearRegression
    HAS_SKLEARN = True
except ImportError:
    HAS_SKLEARN = False

class WeightPredictor:
    """Predicts weight changes based on diet and exercise."""
    
    def __init__(self):
        self.model = None
        if HAS_SKLEARN:
            self.model = LinearRegression()
            
            # Simple synthetic data training
            # Features: [avg_daily_calorie_diff, avg_weekly_workout_minutes]
            # Target: weight_delta_kg_per_week
            
            X_train = np.array([
                [0, 0],
                [-500, 0],
                [-500, 150],
                [500, 0],
                [500, 150],
                [-1000, 300],
            ])
            
            y_train = np.array([
                0.0,
                -0.45,
                -0.6,
                0.45,
                0.3,
                -1.2,
            ])
            
            self.model.fit(X_train, y_train)
            
    def predict_weeks(self, current_weight: float, calorie_diff: float, weekly_workout_mins: float, weeks: int) -> float:
        """Predict weight after n weeks."""
        features = np.array([[calorie_diff, weekly_workout_mins]])
        
        if self.model is not None:
            weekly_delta = self.model.predict(features)[0]
        else:
            # Numpy fallback
            # Roughly: 500 cal diff -> 0.45 kg per week
            # Every 150 min workout -> additional 0.15 kg lost
            delta_from_cals = (calorie_diff / 500) * 0.45
            delta_from_workout = (weekly_workout_mins / 150) * -0.15
            weekly_delta = delta_from_cals + delta_from_workout
            
        return current_weight + (weekly_delta * weeks)

predictor = WeightPredictor()
