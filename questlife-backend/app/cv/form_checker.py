class FormChecker:
    @staticmethod
    def analyze_pose(exercise_type: str, pose_data: dict) -> dict:
        """
        Analyze pose data for specific exercises.
        Returns form accuracy score (0-100) and real-time posture feedback strings.
        """
        # Mock logic
        score = 85.0
        feedback = []

        if exercise_type == "squat":
            feedback = ["Keep your back straight", "Good depth"]
            score = 90.0
        elif exercise_type == "pushup":
            feedback = ["Go lower", "Keep core tight"]
            score = 80.0
        elif exercise_type == "plank":
            feedback = ["Hips too high"]
            score = 75.0
        else:
            feedback = ["Unknown exercise"]
            score = 0.0

        return {
            "exercise": exercise_type,
            "accuracy_score": score,
            "feedback": feedback
        }
