"""Pydantic schemas for users."""

from datetime import date, datetime
from typing import Any

from pydantic import BaseModel, ConfigDict


class UserResponse(BaseModel):
    """Schema for user public data."""
    id: int
    email: str
    username: str
    display_name: str | None
    avatar_url: str | None
    character_class: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class UserStatsResponse(BaseModel):
    """Schema for user statistics."""
    level: int
    current_xp: int
    total_xp: int
    gold: int = 0
    xp_to_next_level: int | None = None
    xp_progress_percent: float | None = None
    strength: int
    endurance: int
    speed: int
    discipline: int
    consistency: int
    recovery: int
    unspent_stat_points: int

    model_config = ConfigDict(from_attributes=True)


class UserPreferencesResponse(BaseModel):
    """Schema for user preferences."""
    goal: str
    experience_level: str
    workout_days_per_week: int
    workout_type: str
    diet_type: str
    allergies: list[Any]
    cuisine_preferences: list[Any]
    budget: str
    daily_steps_goal: int
    sleep_goal_hours: float
    intensity: str

    model_config = ConfigDict(from_attributes=True)


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences."""
    goal: str | None = None
    experience_level: str | None = None
    workout_days_per_week: int | None = None
    workout_type: str | None = None
    diet_type: str | None = None
    allergies: list[Any] | None = None
    cuisine_preferences: list[Any] | None = None
    budget: str | None = None
    daily_steps_goal: int | None = None
    sleep_goal_hours: float | None = None
    intensity: str | None = None


class UserStreakResponse(BaseModel):
    """Schema for user streak."""
    current_streak: int
    longest_streak: int
    last_activity_date: date | None
    streak_freeze_count: int

    model_config = ConfigDict(from_attributes=True)


class UserProfileResponse(BaseModel):
    """Combined schema for full user profile."""
    user: UserResponse
    stats: UserStatsResponse
    preferences: UserPreferencesResponse
    streak: UserStreakResponse

    model_config = ConfigDict(from_attributes=True)
