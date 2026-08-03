class WearablesService:
    @staticmethod
    def sync_google_fit(user_id: int, auth_token: str) -> dict:
        """
        Mock syncing Google Fit data.
        Converts step counts, heart rate, active minutes, and sleep hours into activities.
        """
        return {
            "user_id": user_id,
            "source": "google-fit",
            "steps": 8500,
            "active_minutes": 45,
            "sleep_hours": 7.5,
            "activities_logged": 2
        }

    @staticmethod
    def sync_apple_health(user_id: int, auth_token: str) -> dict:
        """
        Mock syncing Apple Health data.
        """
        return {
            "user_id": user_id,
            "source": "apple-health",
            "steps": 9200,
            "active_minutes": 60,
            "sleep_hours": 8.0,
            "activities_logged": 3
        }
