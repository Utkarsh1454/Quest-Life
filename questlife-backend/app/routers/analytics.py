"""Analytics router."""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User, UserPreferences
from app.dependencies import get_current_user
from app.ml.weight_predictor import predictor
from app.ml.recommender import Recommender

router = APIRouter()


class WeightPredictionRequest(BaseModel):
    current_weight: float
    calorie_diff: float
    weekly_workout_mins: float
    weeks: int


class WeightPredictionResponse(BaseModel):
    predicted_weight: float
    weeks: int


class RecommendationResponse(BaseModel):
    exercises: list[str]
    meals: list[str]


@router.post("/weight-prediction", response_model=WeightPredictionResponse)
async def predict_weight(
    request: WeightPredictionRequest,
    current_user: User = Depends(get_current_user)
):
    """Predict future weight."""
    predicted = predictor.predict_weeks(
        request.current_weight,
        request.calorie_diff,
        request.weekly_workout_mins,
        request.weeks
    )

    return WeightPredictionResponse(
        predicted_weight=round(predicted, 2),
        weeks=request.weeks
    )


@router.get("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get personalized recommendations."""
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == current_user.id))
    prefs = result.scalar_one_or_none()

    goal = prefs.goal if prefs else "maintain"
    level = prefs.experience_level if prefs else "beginner"

    recs = Recommender.get_recommendations(goal, level)

    return RecommendationResponse(
        exercises=recs["exercises"],
        meals=recs["meals"]
    )
