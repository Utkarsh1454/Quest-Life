"""Quest related database models."""

from datetime import date, datetime
from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Quest(Base):
    """Available quests for users."""
    __tablename__ = "quests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    description: Mapped[str] = mapped_column(String)
    quest_type: Mapped[str] = mapped_column(String)  # daily, weekly, boss
    xp_reward: Mapped[int] = mapped_column(Integer)
    target_value: Mapped[float] = mapped_column(Float)
    target_unit: Mapped[str] = mapped_column(String)
    stat_affinity: Mapped[str | None] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Relationships
    user_quests: Mapped[list["UserQuest"]] = relationship("UserQuest", back_populates="quest")

    def __repr__(self) -> str:
        return f"<Quest(id={self.id}, title='{self.title}')>"


class UserQuest(Base):
    """Quests assigned to users."""
    __tablename__ = "user_quests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"))
    quest_id: Mapped[int] = mapped_column(Integer, ForeignKey("quests.id"))
    assigned_date: Mapped[date] = mapped_column(Date)
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String, default="active")  # active, completed, claimed, expired
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    quest: Mapped["Quest"] = relationship("Quest", back_populates="user_quests")

    def __repr__(self) -> str:
        return f"<UserQuest(id={self.id}, user_id={self.user_id}, quest_id={self.quest_id})>"
