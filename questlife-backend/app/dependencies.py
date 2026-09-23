"""Shared FastAPI dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func
import jwt

from app.database import get_db
from app.models.user import User, UserStats, UserPreferences, UserStreak
from app.utils.security import decode_token, decode_clerk_token, hash_password

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

# Re-export get_db for easier imports in routers
__all__ = ["get_db", "get_current_user"]

async def get_current_user(
    token: str = Depends(oauth2_scheme), 
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Dependency to get current authenticated user. Supports both internal JWTs and Clerk JWT tokens.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # 1. Try local JWT token decoding first
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if user_id_str and str(user_id_str).isdigit():
            user_id = int(user_id_str)
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user and user.is_active:
                return user
    except Exception:
        pass

    # 2. Try Clerk JWT token decoding (requires valid signature)
    try:
        clerk_payload = decode_clerk_token(token)
        sub = clerk_payload.get("sub")
        if not sub:
            raise credentials_exception

        email = clerk_payload.get("email") or clerk_payload.get("email_address") or f"{sub}@clerk.user"
        username = clerk_payload.get("username") or clerk_payload.get("given_name") or f"hero_{sub[-6:]}"
        display_name = clerk_payload.get("name") or clerk_payload.get("first_name") or username

        result = await db.execute(
            select(User).where(
                or_(
                    func.lower(User.email) == str(email).lower(),
                    func.lower(User.username) == str(username).lower()
                )
            )
        )
        user = result.scalar_one_or_none()

        if not user:
            user = User(
                email=str(email).lower(),
                username=str(username),
                hashed_password=hash_password("clerk_authenticated_user"),
                display_name=str(display_name),
                character_class="warrior"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

            stats = UserStats(
                user_id=user.id,
                level=1, current_xp=0, total_xp=0,
                strength=10, endurance=10, speed=10, discipline=10, consistency=10, recovery=10,
                unspent_stat_points=0
            )
            prefs = UserPreferences(user_id=user.id)
            streak = UserStreak(user_id=user.id, current_streak=0, longest_streak=0)
            db.add_all([stats, prefs, streak])
            await db.commit()

        if not user.is_active:
            raise HTTPException(status_code=400, detail="Inactive user")

        return user
    except Exception:
        raise credentials_exception
