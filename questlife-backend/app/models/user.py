"""User related database models."""

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow() -> datetime:
    """Return current timezone-aware UTC datetime."""
    return datetime.now(timezone.utc)


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String)
    display_name: Mapped[str | None] = mapped_column(String, nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String, nullable=True)
    character_class: Mapped[str] = mapped_column(String, default="warrior")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=utcnow, onupdate=utcnow
    )

    # Relationships
    stats: Mapped["UserStats"] = relationship("UserStats", back_populates="user", uselist=False, cascade="all, delete-orphan")
    preferences: Mapped["UserPreferences"] = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    streak: Mapped["UserStreak"] = relationship("UserStreak", back_populates="user", uselist=False, cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username='{self.username}')>"


class UserStats(Base):
    """User statistics and attributes model."""
    __tablename__ = "user_stats"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    level: Mapped[int] = mapped_column(Integer, default=1)
    current_xp: Mapped[int] = mapped_column(Integer, default=0)
    total_xp: Mapped[int] = mapped_column(Integer, default=0)
    gold: Mapped[int] = mapped_column(Integer, default=0)
    strength: Mapped[int] = mapped_column(Integer, default=10)
    endurance: Mapped[int] = mapped_column(Integer, default=10)
    speed: Mapped[int] = mapped_column(Integer, default=10)
    discipline: Mapped[int] = mapped_column(Integer, default=10)
    consistency: Mapped[int] = mapped_column(Integer, default=10)
    recovery: Mapped[int] = mapped_column(Integer, default=10)
    unspent_stat_points: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="stats")

    def __repr__(self) -> str:
        return f"<UserStats(user_id={self.user_id}, level={self.level})>"


class UserPreferences(Base):
    """User settings and preferences model."""
    __tablename__ = "user_preferences"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    goal: Mapped[str] = mapped_column(String, default="maintain")
    experience_level: Mapped[str] = mapped_column(String, default="beginner")
    workout_days_per_week: Mapped[int] = mapped_column(Integer, default=3)
    workout_type: Mapped[str] = mapped_column(String, default="mixed")
    diet_type: Mapped[str] = mapped_column(String, default="balanced")
    allergies: Mapped[list[Any]] = mapped_column(JSON, default=list)
    cuisine_preferences: Mapped[list[Any]] = mapped_column(JSON, default=list)
    budget: Mapped[str] = mapped_column(String, default="medium")
    daily_steps_goal: Mapped[int] = mapped_column(Integer, default=8000)
    sleep_goal_hours: Mapped[float] = mapped_column(Float, default=8.0)
    intensity: Mapped[str] = mapped_column(String, default="medium")

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="preferences")

    def __repr__(self) -> str:
        return f"<UserPreferences(user_id={self.user_id})>"


class UserStreak(Base):
    """User activity streak model."""
    __tablename__ = "user_streaks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), unique=True)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_activity_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    streak_freeze_count: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="streak")

    def __repr__(self) -> str:
        return f"<UserStreak(user_id={self.user_id}, current={self.current_streak})>"
