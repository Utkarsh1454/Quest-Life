"""Leaderboard service implementing time-decayed power scores, league bucketing, and Fenwick tree ranking."""

from datetime import date, datetime, timezone
import heapq
from typing import Any, Dict, List, Tuple

from app.utils.fenwick import FenwickTree


def calculate_power_score(total_xp: int, last_activity_date: date | datetime | None = None) -> int:
    """
    Calculate time-decayed Power Score:
    Score = round(total_xp * (0.9 ^ days_inactive))
    """
    if not last_activity_date:
        return total_xp

    if isinstance(last_activity_date, datetime):
        activity_day = last_activity_date.date()
    else:
        activity_day = last_activity_date

    today = date.today()
    days_inactive = max(0, (today - activity_day).days)
    
    # Apply exponential decay: 0.9 ^ days_inactive
    decay_factor = 0.9 ** days_inactive
    decayed_score = round(total_xp * decay_factor)
    return max(1, decayed_score)


def determine_league(percentile: float) -> str:
    """Determine league tier based on percentile cutoff."""
    if percentile >= 90.0:
        return "Diamond"
    elif percentile >= 70.0:
        return "Gold"
    elif percentile >= 40.0:
        return "Silver"
    else:
        return "Bronze"


def get_percentile_cutoffs(scores: List[int]) -> Dict[str, int]:
    """
    Find cutoff scores for 90th, 70th, 40th percentiles using selection algorithms (heapq.nlargest)
    instead of full sorting for large populations.
    """
    if not scores:
        return {"diamond": 0, "gold": 0, "silver": 0, "bronze": 0}

    n = len(scores)
    # k elements to extract with heapq
    k_diamond = max(1, int(n * 0.10))
    k_gold = max(1, int(n * 0.30))
    k_silver = max(1, int(n * 0.60))

    top_diamond = heapq.nlargest(k_diamond, scores)
    top_gold = heapq.nlargest(k_gold, scores)
    top_silver = heapq.nlargest(k_silver, scores)

    return {
        "diamond": top_diamond[-1] if top_diamond else 0,
        "gold": top_gold[-1] if top_gold else 0,
        "silver": top_silver[-1] if top_silver else 0,
        "bronze": 0
    }


def process_leaderboard_entries(user_rows: List[Tuple[Any, str, str, Any]]) -> List[Dict[str, Any]]:
    """
    Process raw DB user rows into enhanced Leaderboard entries:
    - Calculates decayed power_score
    - Builds FenwickTree for O(log N) rank & percentile queries
    - Assigns league tier (Diamond, Gold, Silver, Bronze)
    """
    if not user_rows:
        return []

    # 1. Calculate power scores
    raw_entries = []
    max_score = 1000
    for row in user_rows:
        if len(row) == 4:
            stat, username, char_class, streak = row
        else:
            stat, username, streak = row[0], row[1], row[2] if len(row) > 2 else None
            char_class = "warrior"

        last_date = streak.last_activity_date if streak else None
        p_score = calculate_power_score(stat.total_xp, last_date)
        max_score = max(max_score, p_score)
        raw_entries.append({
            "username": username,
            "level": stat.level,
            "total_xp": stat.total_xp,
            "power_score": p_score,
            "streak": streak.current_streak if streak else 0,
            "character_class": char_class or "warrior"
        })

    # 2. Build Fenwick Tree over power scores
    fenwick = FenwickTree(max_val=max_score + 100)
    for entry in raw_entries:
        fenwick.add(entry["power_score"], 1)

    # 3. Annotate rank, percentile, and league tier
    processed = []
    for entry in raw_entries:
        score = entry["power_score"]
        rank = fenwick.get_rank(score)
        percentile = fenwick.get_percentile(score)
        league = determine_league(percentile)

        processed.append({
            "username": entry["username"],
            "level": entry["level"],
            "total_xp": entry["total_xp"],
            "power_score": score,
            "rank": rank,
            "percentile": percentile,
            "league": league,
            "streak": entry["streak"],
            "character_class": entry["character_class"]
        })

    # 4. Sort final result by power_score descending
    processed.sort(key=lambda x: (x["power_score"], x["total_xp"]), reverse=True)
    return processed
