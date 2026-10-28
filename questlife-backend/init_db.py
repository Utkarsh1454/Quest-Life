"""Database initialization and seeding script for QuestLife.

Supports both SQLite (local development) and PostgreSQL (Vercel Postgres, Neon, Supabase).
Creates all database tables defined in SQLAlchemy models and seeds default quests,
badges, and a sample demo user ("hero1" with password "password123").
"""

import asyncio
import logging
import re
import sys
from sqlalchemy import select, func

from app.config import settings
from app.database import Base, engine, async_sessionmaker_factory
from app.models.user import User, UserStats, UserPreferences, UserStreak
from app.models.quest import Quest
from app.models.guild import Guild, GuildMember
from app.models.badge import Badge
from app.utils.security import hash_password
import app.models  # ensure all models are registered with Base.metadata

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("init_db")

DEFAULT_SEED_QUESTS = [
    {"title": "Morning Run", "description": "Run 5km before 9 AM", "quest_type": "daily", "xp_reward": 8, "target_value": 100, "target_unit": "%", "stat_affinity": "speed"},
    {"title": "Strength Training", "description": "Complete upper body workout", "quest_type": "daily", "xp_reward": 12, "target_value": 100, "target_unit": "%", "stat_affinity": "strength"},
    {"title": "Hydration Hero", "description": "Drink 3L of water", "quest_type": "daily", "xp_reward": 5, "target_value": 100, "target_unit": "%", "stat_affinity": "recovery"},
    {"title": "Mindful Meditation", "description": "10 mins mindfulness session", "quest_type": "daily", "xp_reward": 5, "target_value": 100, "target_unit": "%", "stat_affinity": "discipline"},
    {"title": "Mobility Stretch", "description": "Complete 15 min mobility routine", "quest_type": "daily", "xp_reward": 5, "target_value": 100, "target_unit": "%", "stat_affinity": "consistency"},
    {"title": "Marathon Prep", "description": "Run total 30km this week", "quest_type": "weekly", "xp_reward": 80, "target_value": 100, "target_unit": "%", "stat_affinity": "endurance"},
    {"title": "Perfect Week", "description": "Workout 5 days this week", "quest_type": "weekly", "xp_reward": 80, "target_value": 100, "target_unit": "%", "stat_affinity": "consistency"},
    {"title": "Titan's Challenge", "description": "Lift 10,000kg total volume this month", "quest_type": "boss", "xp_reward": 250, "target_value": 100, "target_unit": "%", "stat_affinity": "strength"}
]

DEFAULT_SEED_BADGES = [
    {"name": "First Blood", "description": "Complete your first quest", "criteria_type": "quests_done", "criteria_threshold": 1, "icon_url": "sword"},
    {"name": "Iron Discipline", "description": "Maintain a 7-day workout streak", "criteria_type": "days_streak", "criteria_threshold": 7, "icon_url": "flame"},
    {"name": "Titan Lifter", "description": "Complete 10 strength workouts", "criteria_type": "workouts_completed", "criteria_threshold": 10, "icon_url": "dumbbell"},
    {"name": "Grandmaster", "description": "Reach Level 10 in any character class", "criteria_type": "level_reached", "criteria_threshold": 10, "icon_url": "crown"},
]


async def init_database():
    target_url = settings.effective_database_url
    masked_url = target_url
    if "@" in target_url:
        masked_url = re.sub(r':([^:@]+)@', r':****@', target_url)

    logger.info(f"Target Database URL: {masked_url}")
    logger.info("Connecting to database and verifying connection...")

    try:
        async with engine.begin() as conn:
            logger.info("Creating all tables from SQLAlchemy models...")
            await conn.run_sync(Base.metadata.create_all)
            logger.info("All tables successfully verified and created.")
    except Exception as e:
        logger.error(f"Failed to connect or create tables: {e}")
        raise

    async with async_sessionmaker_factory() as session:
        # 1. Seed Quests
        res = await session.execute(select(func.count(Quest.id)))
        quest_count = res.scalar_one()
        if quest_count == 0:
            logger.info("Seeding default quests...")
            for qdata in DEFAULT_SEED_QUESTS:
                session.add(Quest(**qdata, is_active=True))
            await session.commit()
            logger.info(f"Seeded {len(DEFAULT_SEED_QUESTS)} default quests.")
        else:
            logger.info(f"Quests table already contains {quest_count} records.")

        # 2. Seed Badges
        res = await session.execute(select(func.count(Badge.id)))
        badge_count = res.scalar_one()
        if badge_count == 0:
            logger.info("Seeding default badges...")
            for bdata in DEFAULT_SEED_BADGES:
                session.add(Badge(**bdata))
            await session.commit()
            logger.info(f"Seeded {len(DEFAULT_SEED_BADGES)} default badges.")
        else:
            logger.info(f"Badges table already contains {badge_count} records.")

        # 3. Seed Demo User
        res = await session.execute(select(User).where(User.username == "hero1"))
        demo_user = res.scalar_one_or_none()
        if not demo_user:
            logger.info("Creating demo user 'hero1' (password: password123)...")
            user = User(
                email="hero@example.com",
                username="hero1",
                display_name="Hero of the Realm",
                hashed_password=hash_password("password123"),
                character_class="warrior",
                is_active=True
            )
            session.add(user)
            await session.flush()

            stats = UserStats(
                user_id=user.id,
                level=5,
                current_xp=120,
                total_xp=5000,
                gold=250,
                strength=18,
                endurance=15,
                speed=12,
                discipline=14,
                consistency=16,
                recovery=13,
                unspent_stat_points=2
            )
            prefs = UserPreferences(
                user_id=user.id,
                goal="build_muscle",
                diet_type="high_protein",
                intensity="medium"
            )
            streak = UserStreak(
                user_id=user.id,
                current_streak=7,
                longest_streak=14
            )
            guild = Guild(
                name="Iron Vanguard",
                description="Warriors united for glory and strength.",
                leader_id=user.id
            )
            session.add_all([stats, prefs, streak, guild])
            await session.flush()

            member = GuildMember(guild_id=guild.id, user_id=user.id, role="leader")
            session.add(member)
            await session.commit()
            logger.info("Demo user 'hero1' and 'Iron Vanguard' guild created successfully!")
        else:
            logger.info("Demo user 'hero1' already exists.")

    await engine.dispose()
    logger.info("Database initialization and seeding completed successfully! ⚔️")


if __name__ == "__main__":
    asyncio.run(init_database())
