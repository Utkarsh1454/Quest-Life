from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database import get_db
from app.models.badge import Badge, UserBadge
from app.engine.badge_system import check_and_award_badges

router = APIRouter()

@router.get("/")
def get_all_badges(db: Session = Depends(get_db)):
    return db.query(Badge).all()

@router.get("/recent")
def get_recent_badges(user_id: int = 1, db: Session = Depends(get_db)): # mock user_id for now
    user_badges = db.query(UserBadge).filter(UserBadge.user_id == user_id).order_by(UserBadge.earned_at.desc()).limit(5).all()
    return [{"badge_id": ub.badge_id, "earned_at": ub.earned_at} for ub in user_badges]

@router.post("/check")
def check_badges(user_id: int = 1, db: Session = Depends(get_db)):
    awarded = check_and_award_badges(db, user_id)
    return {"awarded": [b.name for b in awarded]}
