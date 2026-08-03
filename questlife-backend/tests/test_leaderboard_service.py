"""Unit tests for leaderboard decay and league bucketing logic."""

from datetime import date, timedelta
from app.services.leaderboard_service import calculate_power_score, determine_league, get_percentile_cutoffs


def test_power_score_decay():
    today = date.today()
    # 0 days inactive -> 100% of XP
    assert calculate_power_score(1000, today) == 1000

    # 1 day inactive -> 90% of XP
    yesterday = today - timedelta(days=1)
    assert calculate_power_score(1000, yesterday) == 900

    # 7 days inactive -> ~478 XP (0.9^7 * 1000)
    seven_days = today - timedelta(days=7)
    assert calculate_power_score(1000, seven_days) == 478


def test_determine_league():
    assert determine_league(95.0) == "Diamond"
    assert determine_league(90.0) == "Diamond"
    assert determine_league(80.0) == "Gold"
    assert determine_league(70.0) == "Gold"
    assert determine_league(50.0) == "Silver"
    assert determine_league(39.9) == "Bronze"


def test_percentile_cutoffs():
    scores = list(range(1, 101)) # 1..100
    cutoffs = get_percentile_cutoffs(scores)
    assert cutoffs["diamond"] >= 90
    assert cutoffs["gold"] >= 70
    assert cutoffs["silver"] >= 40
