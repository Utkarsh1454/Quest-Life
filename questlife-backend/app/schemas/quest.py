"""Pydantic schemas for quests."""

from datetime import date, datetime
from pydantic import BaseModel, ConfigDict


class QuestResponse(BaseModel):
    """Schema for quest details."""
    id: int
    title: str
    description: str
    quest_type: str
    xp_reward: int
    target_value: float
    target_unit: str

    model_config = ConfigDict(from_attributes=True)


class UserQuestResponse(BaseModel):
    """Schema for a user's assigned quest."""
    id: int
    quest: QuestResponse
    progress: float
    status: str
    assigned_date: date

    model_config = ConfigDict(from_attributes=True)


class QuestClaimResponse(BaseModel):
    """Schema for quest claim result."""
    xp_earned: int
    new_total_xp: int
    new_level: int
    stats_after: dict[str, int] | None = None
