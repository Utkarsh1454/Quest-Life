"""Tests for activity logging and XP engine integration."""
import pytest


def test_log_workout_xp(client, auth_headers):
    response = client.post(
        "/api/v1/activities/log",
        headers=auth_headers,
        json={
            "activity_type": "workout",
            "workout": {
                "exercise_name": "Bench Press",
                "sets": 3,
                "reps": 10,
                "weight_kg": 60,
                "duration_minutes": 45,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["xp_earned"] > 0
    assert data["new_total_xp"] > 0


def test_log_meal_healthy_xp(client, auth_headers):
    response = client.post(
        "/api/v1/activities/log",
        headers=auth_headers,
        json={
            "activity_type": "meal",
            "meal": {
                "meal_type": "lunch",
                "calories": 500,
                "protein_g": 30,
                "carbs_g": 40,
                "fat_g": 15,
                "is_healthy": True,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["xp_earned"] > 0


def test_log_meal_unhealthy_no_xp(client, auth_headers):
    response = client.post(
        "/api/v1/activities/log",
        headers=auth_headers,
        json={
            "activity_type": "meal",
            "meal": {
                "meal_type": "snack",
                "calories": 800,
                "protein_g": 5,
                "carbs_g": 100,
                "fat_g": 40,
                "is_healthy": False,
            },
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["xp_earned"] >= 0


def test_xp_includes_intensity_multiplier(client, auth_headers):
    # Change intensity to hard
    client.put(
        "/api/v1/users/me/preferences",
        headers=auth_headers,
        json={"intensity": "hard"},
    )

    response = client.post(
        "/api/v1/activities/log",
        headers=auth_headers,
        json={
            "activity_type": "workout",
            "workout": {"exercise_name": "Squats"},
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["xp_earned"] > 0


def test_level_up_triggers(client, auth_headers):
    # Log workouts until level up
    leveled_up = False
    for _ in range(5):
        resp = client.post(
            "/api/v1/activities/log",
            headers=auth_headers,
            json={
                "activity_type": "workout",
                "workout": {"exercise_name": "Pullups"},
            },
        )
        if resp.json()["level_up"]:
            leveled_up = True
            break

    assert leveled_up


def test_streak_updates(client, auth_headers):
    # Log an activity
    client.post(
        "/api/v1/activities/log",
        headers=auth_headers,
        json={
            "activity_type": "sleep",
            "sleep": {"hours": 8, "quality": 4},
        },
    )

    # Check streak is updated
    resp = client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["streak"]["current_streak"] >= 1
