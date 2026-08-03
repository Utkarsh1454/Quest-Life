"""Activity logging models."""

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    """Return current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


class Activity(Base):
    """Core activity log entry."""
    __tablename__ = "activities"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    activity_type: Mapped[str] = mapped_column(String)  # workout, meal, steps, sleep
    xp_earned: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    metadata_json: Mapped[dict[str, Any] | None] = mapped_column(JSON, nullable=True)

    # Relationships
    workout_log: Mapped["WorkoutLog | None"] = relationship("WorkoutLog", back_populates="activity", uselist=False, cascade="all, delete-orphan")
    meal_log: Mapped["MealLog | None"] = relationship("MealLog", back_populates="activity", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Activity(id={self.id}, user_id={self.user_id}, type='{self.activity_type}')>"


class WorkoutLog(Base):
    """Specific details for workout activities."""
    __tablename__ = "workout_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(Integer, ForeignKey("activities.id"))
    exercise_name: Mapped[str] = mapped_column(String)
    sets: Mapped[int | None] = mapped_column(Integer, nullable=True)
    reps: Mapped[int | None] = mapped_column(Integer, nullable=True)
    weight_kg: Mapped[float | None] = mapped_column(Float, nullable=True)
    duration_minutes: Mapped[float | None] = mapped_column(Float, nullable=True)
    notes: Mapped[str | None] = mapped_column(String, nullable=True)

    # Relationships
    activity: Mapped["Activity"] = relationship("Activity", back_populates="workout_log")

    def __repr__(self) -> str:
        return f"<WorkoutLog(id={self.id}, activity_id={self.activity_id}, exercise='{self.exercise_name}')>"


class MealLog(Base):
    """Specific details for meal activities."""
    __tablename__ = "meal_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    activity_id: Mapped[int] = mapped_column(Integer, ForeignKey("activities.id"))
    meal_type: Mapped[str] = mapped_column(String)  # breakfast, lunch, dinner, snack
    calories: Mapped[float] = mapped_column(Float)
    protein_g: Mapped[float] = mapped_column(Float)
    carbs_g: Mapped[float] = mapped_column(Float)
    fat_g: Mapped[float] = mapped_column(Float)
    food_items: Mapped[list[Any]] = mapped_column(JSON, default=list)
    is_healthy: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    activity: Mapped["Activity"] = relationship("Activity", back_populates="meal_log")

    def __repr__(self) -> str:
        return f"<MealLog(id={self.id}, activity_id={self.activity_id}, type='{self.meal_type}')>"
