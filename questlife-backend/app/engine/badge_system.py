from sqlalchemy.orm import Session
from app.models.badge import Badge, UserBadge
from app.models.user import User

def check_and_award_badges(db: Session, user_id: int):
    # Dummy logic to award badges based on some criteria
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []
    
    # Example logic
    awarded = []
    badges = db.query(Badge).all()
    user_badges = [ub.badge_id for ub in db.query(UserBadge).filter(UserBadge.user_id == user_id).all()]
    
    for badge in badges:
        if badge.id not in user_badges:
            # Let's say everyone gets it for now if they reach this
            if badge.criteria_type == "workouts_completed" and badge.criteria_threshold <= 1:
                new_badge = UserBadge(user_id=user_id, badge_id=badge.id)
                db.add(new_badge)
                awarded.append(badge)
    
    if awarded:
        db.commit()
        
    return awarded
