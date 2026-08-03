"""SQLAlchemy models registry."""

# Import all models here so Alembic can discover them
from app.database import Base
from app.models.user import User, UserStats, UserPreferences, UserStreak
from app.models.quest import Quest, UserQuest
from app.models.activity import Activity, WorkoutLog, MealLog
from app.models.badge import Badge, UserBadge
from app.models.guild import Guild, GuildMember

__all__ = [
    "Base",
    "User",
    "UserStats",
    "UserPreferences",
    "UserStreak",
    "Quest",
    "UserQuest",
    "Activity",
    "WorkoutLog",
    "MealLog",
    "Badge",
    "UserBadge",
    "Guild",
    "GuildMember"
]