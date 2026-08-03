import pytest
from fastapi.testclient import TestClient
from fastapi import FastAPI
from app.routers import vision, wearables, notifications

app = FastAPI()
app.include_router(vision.router)
app.include_router(wearables.router)
app.include_router(notifications.router)

client = TestClient(app)

def test_form_check():
    response = client.post("/vision/form-check", json={
        "exercise_type": "squat",
        "pose_data": {"joints": []}
    })
    assert response.status_code == 200
    assert response.json()["accuracy_score"] == 90.0

def test_food_recognition():
    response = client.post("/vision/food-recognition", json={
        "image_base64": "dummy_base64"
    })
    assert response.status_code == 200
    assert response.json()["total_calories"] == 378

def test_sync_google_fit():
    response = client.post("/wearables/sync/google-fit", json={
        "user_id": 1,
        "auth_token": "token123"
    })
    assert response.status_code == 200
    assert response.json()["source"] == "google-fit"

def test_sync_apple_health():
    response = client.post("/wearables/sync/apple-health", json={
        "user_id": 1,
        "auth_token": "token123"
    })
    assert response.status_code == 200
    assert response.json()["source"] == "apple-health"

def test_register_device():
    response = client.post("/notifications/register-device", json={
        "user_id": 1,
        "fcm_token": "fcm123"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "success"

def test_send_test_notification():
    response = client.post("/notifications/send-test", json={
        "user_id": 1,
        "title": "Streak Warning",
        "body": "Don't lose your 5-day streak!",
        "type": "streak_warning"
    })
    assert response.status_code == 200
    assert response.json()["status"] == "sent"
