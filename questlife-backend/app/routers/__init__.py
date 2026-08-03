"""FastAPI routers."""

from fastapi import APIRouter

from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.activities import router as activities_router
from app.routers.quests import router as quests_router
from app.routers.workouts import router as workouts_router
from app.routers.diet import router as diet_router
from app.routers.badges import router as badges_router
from app.routers.coach import router as coach_router
from app.routers.guilds import router as guilds_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.analytics import router as analytics_router
from app.routers.vision import router as vision_router
from app.routers.wearables import router as wearables_router
from app.routers.notifications import router as notifications_router
from app.routers.nutrition import router as nutrition_router

# Main API router that groups all other routers
api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(activities_router, prefix="/activities", tags=["Activities"])
api_router.include_router(quests_router, prefix="/quests", tags=["Quests"])
api_router.include_router(workouts_router, prefix="/workouts", tags=["Workouts"])
api_router.include_router(diet_router, prefix="/diet", tags=["Diet"])
api_router.include_router(badges_router, prefix="/badges", tags=["Badges"])
api_router.include_router(coach_router, prefix="/coach", tags=["Coach"])
api_router.include_router(guilds_router, prefix="/guilds", tags=["Guilds"])
api_router.include_router(leaderboard_router, prefix="/leaderboard", tags=["Leaderboard"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
api_router.include_router(vision_router, tags=["Vision"])
api_router.include_router(wearables_router, tags=["Wearables"])
api_router.include_router(notifications_router, tags=["Notifications"])
api_router.include_router(nutrition_router, tags=["Nutrition Engine"])
