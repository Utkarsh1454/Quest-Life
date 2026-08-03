import asyncio
from app.database import async_sessionmaker_factory
from app.models.user import User
from sqlalchemy import select

async def run():
    async with async_sessionmaker_factory() as session:
        res = await session.execute(select(User))
        users = res.scalars().all()
        print("Users in DB:", [(u.id, u.username, u.email, u.hashed_password) for u in users])

if __name__ == "__main__":
    asyncio.run(run())
