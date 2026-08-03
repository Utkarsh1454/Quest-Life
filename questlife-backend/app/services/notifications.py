class NotificationService:
    @staticmethod
    def register_device(user_id: int, fcm_token: str) -> dict:
        """
        Register a device for push notifications via FCM.
        """
        return {"status": "success", "message": f"Device registered for user {user_id}"}

    @staticmethod
    def send_notification(user_id: int, title: str, body: str, type: str) -> dict:
        """
        Send FCM push notification for streak warnings, level-ups, or check-ins.
        """
        # Mock logic
        return {
            "status": "sent",
            "user_id": user_id,
            "notification": {
                "title": title,
                "body": body,
                "type": type
            }
        }
