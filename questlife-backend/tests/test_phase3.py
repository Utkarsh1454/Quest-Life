"""Tests for Phase 3 features (AI Coach, Analytics/ML, Guilds, Leaderboards)."""

import pytest


def test_coach_message(client, auth_headers):
    response = client.get(
        "/api/v1/coach/message",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "cta" in data


def test_weight_prediction(client, auth_headers):
    response = client.post(
        "/api/v1/analytics/weight-prediction",
        headers=auth_headers,
        json={
            "current_weight": 80.0,
            "calorie_diff": -500,
            "weekly_workout_mins": 150,
            "weeks": 4
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "predicted_weight" in data
    assert data["weeks"] == 4
    assert data["predicted_weight"] < 80.0  # Deficit causes weight loss


def test_recommendations(client, auth_headers):
    response = client.get(
        "/api/v1/analytics/recommendations",
        headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert "exercises" in data
    assert "meals" in data


def test_guilds_workflow(client, auth_headers):
    # 1. Create guild
    response = client.post(
        "/api/v1/guilds/create",
        headers=auth_headers,
        json={
            "name": "Titans Guild",
            "description": "Guild of elite warriors",
            "icon_url": "shield"
        }
    )
    assert response.status_code == 201
    guild_data = response.json()
    assert guild_data["name"] == "Titans Guild"
    guild_id = guild_data["id"]

    # 2. List all guilds
    response = client.get(
        "/api/v1/guilds/list",
        headers=auth_headers
    )
    assert response.status_code == 200
    guilds = response.json()
    assert len(guilds) > 0

    # 3. Get my guilds
    response = client.get(
        "/api/v1/guilds/me",
        headers=auth_headers
    )
    assert response.status_code == 200
    my_guilds = response.json()
    assert len(my_guilds) > 0


def test_leaderboard(client, auth_headers):
    # Global leaderboard
    response = client.get(
        "/api/v1/leaderboard/global",
        headers=auth_headers
    )
    assert response.status_code == 200
    global_board = response.json()
    assert len(global_board) > 0

    # Friends leaderboard
    response = client.get(
        "/api/v1/leaderboard/friends",
        headers=auth_headers
    )
    assert response.status_code == 200
    friends_board = response.json()
    assert isinstance(friends_board, list)
