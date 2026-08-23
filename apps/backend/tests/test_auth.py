import json
import pytest

from app import app
from db.database import SessionLocal, init_db
from db.models import User

@pytest.fixture
def client():
    app.config["TESTING"] = True
    init_db()
    with app.test_client() as client:
        yield client

@pytest.fixture(autouse=True)
def cleanup_test_users():
    yield
    db = SessionLocal()
    try:
        db.query(User).filter(User.email.like("%test%@krakensec.io")).delete(synchronize_session=False)
        db.commit()
    finally:
        db.close()

def test_register_success(client):
    """Test registering a new SOC analyst account."""
    payload = {
        "name": "Test Analyst",
        "email": "test.register@krakensec.io",
        "password": "SecurePassword123!",
        "organization": "SOC Alpha Team"
    }
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 201
    data = json.loads(res.data)
    assert data["status"] == "success"
    assert "token" in data
    assert data["user"]["email"] == "test.register@krakensec.io"
    assert data["user"]["name"] == "Test Analyst"

def test_register_duplicate_email(client):
    """Test duplicate email rejection."""
    payload = {
        "name": "First User",
        "email": "test.duplicate@krakensec.io",
        "password": "Password123!"
    }
    client.post("/api/auth/register", json=payload)
    res = client.post("/api/auth/register", json=payload)
    assert res.status_code == 409
    data = json.loads(res.data)
    assert data["status"] == "error"
    assert "already exists" in data["message"]

def test_register_invalid_data(client):
    """Test registering with missing required fields."""
    res = client.post("/api/auth/register", json={"email": "incomplete@krakensec.io"})
    assert res.status_code == 400
    data = json.loads(res.data)
    assert data["status"] == "error"

def test_login_success(client):
    """Test logging in with valid credentials."""
    reg_payload = {
        "name": "Login User",
        "email": "test.login@krakensec.io",
        "password": "MySecretPassword123!"
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "test.login@krakensec.io",
        "password": "MySecretPassword123!"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["status"] == "success"
    assert data["user"]["email"] == "test.login@krakensec.io"
    assert "token" in data

def test_login_wrong_password(client):
    """Test logging in with invalid password."""
    reg_payload = {
        "name": "Password User",
        "email": "test.wrongpass@krakensec.io",
        "password": "CorrectPassword123!"
    }
    client.post("/api/auth/register", json=reg_payload)

    login_payload = {
        "email": "test.wrongpass@krakensec.io",
        "password": "IncorrectPassword!"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 401
    data = json.loads(res.data)
    assert data["status"] == "error"

def test_get_me_authenticated(client):
    """Test /api/auth/me resolves the logged-in user from bearer session token."""
    reg_payload = {
        "name": "Session Analyst",
        "email": "test.session@krakensec.io",
        "password": "SessionPassword123!",
        "organization": "Threat Response Unit"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = json.loads(reg_res.data)["token"]

    res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["status"] == "success"
    assert data["user"]["name"] == "Session Analyst"
    assert data["user"]["organization"] == "Threat Response Unit"

def test_logout_session(client):
    """Test /api/auth/logout clears user session token."""
    reg_payload = {
        "name": "Logout Analyst",
        "email": "test.logout@krakensec.io",
        "password": "Password123!"
    }
    reg_res = client.post("/api/auth/register", json=reg_payload)
    token = json.loads(reg_res.data)["token"]

    res = client.post("/api/auth/logout", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    data = json.loads(res.data)
    assert data["status"] == "success"
