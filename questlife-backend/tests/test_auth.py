"""Tests for authentication endpoints."""
import pytest


def test_register(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@example.com",
            "username": "newuser",
            "password": "password123",
            "display_name": "New User",
            "character_class": "monk",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_register_duplicate_email(client, auth_headers):
    # 'test@example.com' is already registered in auth_headers fixture
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "username": "otheruser",
            "password": "password123",
            "display_name": "Other User",
            "character_class": "monk",
        },
    )
    assert response.status_code == 409


def test_register_duplicate_username(client, auth_headers):
    # 'testuser' is already registered in auth_headers fixture
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "other@example.com",
            "username": "testuser",
            "password": "password123",
            "display_name": "Other User",
            "character_class": "monk",
        },
    )
    assert response.status_code == 409


def test_login_success(client, auth_headers):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_json_success(client, auth_headers):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "test@example.com", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_case_insensitive(client, auth_headers):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "TEST@EXAMPLE.COM", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_by_username(client, auth_headers):
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "TESTUSER", "password": "password123"},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password(client, auth_headers):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 401


def test_login_wrong_email(client):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": "notfound@example.com", "password": "password123"},
    )
    assert response.status_code == 401


def test_get_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["username"] == "testuser"


def test_get_me_invalid_token(client):
    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": "Bearer invalidtoken"}
    )
    assert response.status_code == 401


def test_token_refresh(client, auth_headers):
    # Login to get refresh token
    login_resp = client.post(
        "/api/v1/auth/login",
        data={"username": "test@example.com", "password": "password123"},
    )
    refresh_token = login_resp.json()["refresh_token"]

    response = client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()
