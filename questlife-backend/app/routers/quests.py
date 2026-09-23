from datetime import datetime, timezone, timedelta
import random

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.quest import Quest, UserQuest
from app.schemas.quest import UserQuestResponse, QuestClaimResponse
from app.engine.xp_engine import check_level_up

router = APIRouter()

def get_today_utc():
    return datetime.now(timezone.utc).date()

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

async def _ensure_seed_quests(db: AsyncSession):
    res = await db.execute(select(func.count(Quest.id)))
    count = res.scalar_one()
    if count == 0:
        for qdata in DEFAULT_SEED_QUESTS:
            db.add(Quest(**qdata, is_active=True))
        await db.commit()

@router.get("/daily", response_model=list[UserQuestResponse])
async def get_daily_quests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_seed_quests(db)
    today = get_today_utc()
    
    result = await db.execute(
        select(UserQuest)
        .options(selectinload(UserQuest.quest))
        .join(Quest)
        .where(
            UserQuest.user_id == current_user.id,
            UserQuest.assigned_date == today,
            Quest.quest_type == "daily"
        )
    )
    user_quests = result.scalars().all()
    
    if not user_quests:
        old_daily_res = await db.execute(
            select(UserQuest).join(Quest).where(
                UserQuest.user_id == current_user.id,
                Quest.quest_type == "daily",
                UserQuest.assigned_date < today
            )
        )
        for old_uq in old_daily_res.scalars().all():
            await db.delete(old_uq)
        await db.commit()

        quests_result = await db.execute(
            select(Quest).where(Quest.quest_type == "daily", Quest.is_active == True)
        )
        all_daily_quests = quests_result.scalars().all()
        
        if all_daily_quests:
            num_to_assign = min(5, len(all_daily_quests))
            selected_quests = random.sample(all_daily_quests, num_to_assign)
            
            new_user_quests = []
            for q in selected_quests:
                uq = UserQuest(
                    user_id=current_user.id,
                    quest_id=q.id,
                    assigned_date=today,
                    progress=0.0,
                    status="active"
                )
                db.add(uq)
                new_user_quests.append(uq)
                
            await db.commit()
            
            for uq in new_user_quests:
                await db.refresh(uq)
                uq.quest = next(q for q in selected_quests if q.id == uq.quest_id)
                
            user_quests = new_user_quests

    return [
        UserQuestResponse(
            id=uq.id,
            quest=uq.quest,
            progress=uq.progress,
            status=uq.status,
            assigned_date=uq.assigned_date
        ) for uq in user_quests
    ]

@router.get("/weekly", response_model=list[UserQuestResponse])
async def get_weekly_quests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_seed_quests(db)
    today = get_today_utc()
    
    result = await db.execute(
        select(UserQuest)
        .options(selectinload(UserQuest.quest))
        .join(Quest)
        .where(
            UserQuest.user_id == current_user.id,
            Quest.quest_type.in_(["weekly", "boss"])
        )
    )
    user_quests = result.scalars().all()
    
    if not user_quests:
        quests_result = await db.execute(
            select(Quest).where(Quest.quest_type.in_(["weekly", "boss"]), Quest.is_active == True)
        )
        all_wb_quests = quests_result.scalars().all()
        
        new_user_quests = []
        for q in all_wb_quests:
            uq = UserQuest(
                user_id=current_user.id,
                quest_id=q.id,
                assigned_date=today,
                progress=0.0,
                status="active"
            )
            db.add(uq)
            new_user_quests.append(uq)
            
        await db.commit()
        for uq in new_user_quests:
            await db.refresh(uq)
            uq.quest = next(q for q in all_wb_quests if q.id == uq.quest_id)
        user_quests = new_user_quests
        
    return [
        UserQuestResponse(
            id=uq.id,
            quest=uq.quest,
            progress=uq.progress,
            status=uq.status,
            assigned_date=uq.assigned_date
        ) for uq in user_quests
    ]

@router.post("/refresh")
async def refresh_quests_for_user(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    await _ensure_seed_quests(db)
    today = get_today_utc()
    
    existing_res = await db.execute(
        select(UserQuest).join(Quest).where(
            UserQuest.user_id == current_user.id,
            Quest.quest_type == "daily"
        )
    )
    existing_daily = existing_res.scalars().all()
    
    if not existing_daily:
        quests_result = await db.execute(
            select(Quest).where(Quest.quest_type == "daily", Quest.is_active == True)
        )
        all_daily_quests = quests_result.scalars().all()
        
        if all_daily_quests:
            num_to_assign = min(5, len(all_daily_quests))
            selected_quests = random.sample(all_daily_quests, num_to_assign)
            
            for q in selected_quests:
                uq = UserQuest(
                    user_id=current_user.id,
                    quest_id=q.id,
                    assigned_date=today,
                    progress=0.0,
                    status="active"
                )
                db.add(uq)
            await db.commit()

    return {"status": "success", "message": "Daily quests synchronized."}

@router.post("/{quest_id}/claim", response_model=QuestClaimResponse)
async def claim_quest(
    quest_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    user_result = await db.execute(
        select(User).options(selectinload(User.stats)).where(User.id == current_user.id)
    )
    user = user_result.scalar_one()

    uq_result = await db.execute(
        select(UserQuest)
        .options(selectinload(UserQuest.quest))
        .where(UserQuest.id == quest_id, UserQuest.user_id == current_user.id)
    )
    uq = uq_result.scalar_one_or_none()
    
    if not uq:
        raise HTTPException(status_code=404, detail="Quest not found")
        
    if uq.status == "claimed":
        raise HTTPException(status_code=400, detail="Quest already claimed")
        
    if uq.status != "completed" and uq.progress < uq.quest.target_value:
        uq.progress = uq.quest.target_value
        uq.status = "completed"
        uq.completed_at = datetime.now(timezone.utc)
        
    xp_reward = uq.quest.xp_reward

    if uq.quest.quest_type == "daily":
        today = get_today_utc()
        start_of_today = datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)
        start_of_tomorrow = datetime.combine(today + timedelta(days=1), datetime.min.time(), tzinfo=timezone.utc)
        
        claimed_today_res = await db.execute(
            select(UserQuest)
            .join(Quest)
            .where(
                UserQuest.user_id == current_user.id,
                UserQuest.status == "claimed",
                UserQuest.claimed_at >= start_of_today,
                UserQuest.claimed_at < start_of_tomorrow,
                Quest.quest_type == "daily"
            )
        )
        claimed_quests = claimed_today_res.scalars().all()
        xp_already_claimed = sum(cq.quest.xp_reward for cq in claimed_quests)
        if xp_already_claimed >= 40:
            xp_reward = 0
        else:
            xp_reward = min(xp_reward, 40 - xp_already_claimed)
    
    # Direct stat affinity reward from claimed quest
    affinity = (uq.quest.stat_affinity or "").lower()
    if affinity == "speed":
        user.stats.speed += 2
    elif affinity == "strength":
        user.stats.strength += 2
    elif affinity == "endurance":
        user.stats.endurance += 2
    elif affinity == "discipline":
        user.stats.discipline += 2
    elif affinity == "consistency":
        user.stats.consistency += 2
    elif affinity == "recovery":
        user.stats.recovery += 2
    else:
        user.stats.consistency += 1

    leveled_up, old_level, new_level = check_level_up(user.stats.total_xp, user.stats.total_xp + xp_reward)
    
    user.stats.total_xp += xp_reward
    user.stats.current_xp += xp_reward
    
    if leveled_up:
        user.stats.level = new_level
        
    uq.status = "claimed"
    uq.claimed_at = datetime.now(timezone.utc)
    
    await db.commit()
    await db.refresh(user.stats)
    
    return QuestClaimResponse(
        xp_earned=xp_reward,
        new_total_xp=user.stats.total_xp,
        new_level=user.stats.level,
        stats_after={
            "strength": user.stats.strength,
            "endurance": user.stats.endurance,
            "speed": user.stats.speed,
            "discipline": user.stats.discipline,
            "consistency": user.stats.consistency,
            "recovery": user.stats.recovery,
        }
    )
