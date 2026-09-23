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


def test_unverified_clerk_jwt_rejected(client):
    """Ensure forged/unverified Clerk JWTs are rejected with 401 Unauthorized."""
    import jwt

    fake_payload = {
        "sub": "user_234987234987293847",
        "email": "hacker@example.com",
        "username": "hacker",
        "name": "Hacker User",
    }
    # Encode with an arbitrary secret key (not system SECRET_KEY)
    forged_token = jwt.encode(fake_payload, "arbitrary_fake_secret_key_32_bytes_long", algorithm="HS256")

    response = client.get(
        "/api/v1/auth/me", headers={"Authorization": f"Bearer {forged_token}"}
    )
    assert response.status_code == 401


def test_clerk_jwt_verified_with_pem(client):
    """Ensure Clerk JWT is accepted when signed by a valid configured PEM public key."""
    import jwt
    from app.config import settings

    try:
        from cryptography.hazmat.primitives.asymmetric import rsa
        from cryptography.hazmat.primitives import serialization

        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        pem_private = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption(),
        )
        pem_public = private_key.public_key().public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo,
        ).decode("utf-8")

        original_pem = settings.CLERK_PEM_PUBLIC_KEY
        settings.CLERK_PEM_PUBLIC_KEY = pem_public

        try:
            clerk_payload = {
                "sub": "user_clerk_valid_123",
                "email": "clerkuser@example.com",
                "username": "clerkhero",
                "name": "Clerk Hero",
            }
            valid_clerk_token = jwt.encode(clerk_payload, pem_private, algorithm="RS256")

            response = client.get(
                "/api/v1/auth/me", headers={"Authorization": f"Bearer {valid_clerk_token}"}
            )
            assert response.status_code == 200
            data = response.json()
            assert data["email"] == "clerkuser@example.com"
        finally:
            settings.CLERK_PEM_PUBLIC_KEY = original_pem
    except ImportError:
        pass
