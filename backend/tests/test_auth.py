"""Tests for registration, login, token refresh, and role-based access checks."""


def test_register_new_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "newuser@example.com", "password": "strongpassword1", "full_name": "New User"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "newuser@example.com"
    assert body["role"] == "user"


def test_register_duplicate_email_rejected(client, registered_user):
    response = client.post("/api/v1/auth/register", json=registered_user)
    assert response.status_code == 400


def test_register_rejects_admin_self_service(client):
    response = client.post(
        "/api/v1/auth/register",
        json={"email": "wannabe_admin@example.com", "password": "strongpassword1", "role": "admin"},
    )
    assert response.status_code == 422


def test_login_success(client, registered_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": registered_user["email"], "password": registered_user["password"]},
    )
    assert response.status_code == 200
    body = response.json()
    assert "access_token" in body
    assert "refresh_token" in body


def test_login_wrong_password(client, registered_user):
    response = client.post(
        "/api/v1/auth/login",
        data={"username": registered_user["email"], "password": "wrong-password"},
    )
    assert response.status_code == 401


def test_me_requires_auth(client):
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_returns_current_user(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "testuser@example.com"


def test_admin_only_endpoint_rejects_regular_user(client, auth_headers):
    response = client.get("/api/v1/analytics/system", headers=auth_headers)
    assert response.status_code == 403


def test_refresh_token_flow(client, registered_user):
    login_response = client.post(
        "/api/v1/auth/login",
        data={"username": registered_user["email"], "password": registered_user["password"]},
    )
    refresh_token = login_response.json()["refresh_token"]

    refresh_response = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_response.status_code == 200
    assert "access_token" in refresh_response.json()
