"""Seed script to populate database."""

import asyncio
from app.database import engine, Base, SessionLocal
from app.models.user import User, UserStats, UserPreferences, UserStreak
from app.models.guild import Guild, GuildMember
from app.core.security import get_password_hash

def seed():
    print("Seeding database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Create sample user
    if not db.query(User).filter(User.username == "hero1").first():
        user = User(
            email="hero@example.com",
            username="hero1",
            hashed_password=get_password_hash("password123"),
            character_class="warrior"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Stats
        stats = UserStats(user_id=user.id, level=5, total_xp=5000)
        prefs = UserPreferences(user_id=user.id, goal="build_muscle")
        streak = UserStreak(user_id=user.id, current_streak=10)
        
        db.add_all([stats, prefs, streak])
        db.commit()
        
        # Guild
        guild = Guild(name="Warriors Guild", description="For warriors", leader_id=user.id)
        db.add(guild)
        db.commit()
        db.refresh(guild)
        
        member = GuildMember(guild_id=guild.id, user_id=user.id, role="leader")
        db.add(member)
        db.commit()
        
        print("Successfully seeded sample user and guild.")
    else:
        print("Database already seeded.")
        
    db.close()

if __name__ == "__main__":
    seed()
