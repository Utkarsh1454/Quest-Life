"""Pydantic schemas for activities with strict validation bounds."""

from datetime import datetime
from typing import Any
from pydantic import BaseModel, ConfigDict, Field


class LogWorkoutRequest(BaseModel):
    """Schema for logging a workout with anti-cheat validation bounds."""
    exercise_name: str = Field(..., min_length=1, max_length=100)
    sets: int | None = Field(None, ge=1, le=100)
    reps: int | None = Field(None, ge=1, le=500)
    weight_kg: float | None = Field(None, ge=0.0, le=1000.0)
    duration_minutes: float | None = Field(None, ge=1.0, le=720.0)
    notes: str | None = Field(None, max_length=500)


class LogMealRequest(BaseModel):
    """Schema for logging a meal with bounds."""
    meal_type: str = Field(..., min_length=1, max_length=50)
    calories: float = Field(..., ge=0.0, le=10000.0)
    protein_g: float = Field(..., ge=0.0, le=1000.0)
    carbs_g: float = Field(..., ge=0.0, le=1000.0)
    fat_g: float = Field(..., ge=0.0, le=1000.0)
    food_items: list[Any] = []
    is_healthy: bool = True


class LogStepsRequest(BaseModel):
    """Schema for logging steps."""
    steps_count: int = Field(..., ge=1, le=200000)


class LogSleepRequest(BaseModel):
    """Schema for logging sleep."""
    hours: float = Field(..., ge=0.1, le=24.0)
    quality: int = Field(..., ge=1, le=5)


class ActivityResponse(BaseModel):
    """Schema for activity log response."""
    id: int
    activity_type: str
    xp_earned: int
    created_at: datetime
    metadata: dict[str, Any] | None = None

    model_config = ConfigDict(from_attributes=True)


class XPAwardResponse(BaseModel):
    """Schema for XP award results."""
    xp_earned: int
    new_total_xp: int
    new_level: int
    level_up: bool
    stats_after: dict[str, int]
