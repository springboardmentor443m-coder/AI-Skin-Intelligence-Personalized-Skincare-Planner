def test_register_user(client):
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "secretpassword",
            "first_name": "Test",
            "last_name": "User",
            "role": "user"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["first_name"] == "Test"
    assert data["last_name"] == "User"
    assert data["role"] == "user"
    assert "id" in data


def test_register_user_duplicate(client):
    user_data = {
        "email": "duplicate@example.com",
        "password": "secretpassword",
        "first_name": "Dup",
        "last_name": "User",
        "role": "user"
    }
    # Register once
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 201
    
    # Register again
    response = client.post("/api/v1/auth/register", json=user_data)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_user(client):
    # Register user
    user_data = {
        "email": "login@example.com",
        "password": "secretpassword",
        "first_name": "Login",
        "last_name": "Test",
        "role": "user"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Login
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "login@example.com", "password": "secretpassword"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_credentials(client):
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nonexistent@example.com", "password": "wrongpassword"}
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"


def test_get_me(client):
    # Register user
    user_data = {
        "email": "me@example.com",
        "password": "secretpassword",
        "first_name": "Me",
        "last_name": "Self",
        "role": "user"
    }
    client.post("/api/v1/auth/register", json=user_data)

    # Login to get token
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": "me@example.com", "password": "secretpassword"}
    )
    token = login_response.json()["access_token"]

    # Get profile
    response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "me@example.com"
    assert data["first_name"] == "Me"
    assert data["role"] == "user"
