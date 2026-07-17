import pytest
import uuid
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, MagicMock
from app.main import app
from app.db.engine import get_session
from app.core.security import get_password_hash, create_access_token
from app.models.user import User

client = TestClient(app)

TEST_USER_ID = str(uuid.uuid4())

@pytest.fixture
def mock_db_session():
    mock_db = AsyncMock()
    app.dependency_overrides[get_session] = lambda: mock_db
    yield mock_db
    app.dependency_overrides.clear()

def test_login_invalid_credentials(mock_db_session):
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = None
    mock_db_session.execute.return_value = mock_result

    response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "wrong"})
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]

def test_login_success(mock_db_session):
    mock_user = User(
        id=uuid.UUID(TEST_USER_ID),
        email="test@example.com",
        hashed_password=get_password_hash("password123"),
        is_active=True
    )
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = mock_user
    mock_db_session.execute.return_value = mock_result

    response = client.post("/api/v1/auth/login", json={"email": "test@example.com", "password": "password123"})
    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"

def test_protected_endpoint_without_auth():
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401

def test_protected_endpoint_with_auth(mock_db_session):
    token = create_access_token(TEST_USER_ID)
    
    mock_user = User(
        id=uuid.UUID(TEST_USER_ID),
        email="test@example.com",
        is_active=True,
        full_name="Test User",
        role="candidate",
        is_verified=True
    )
    mock_result = MagicMock()
    mock_result.scalars().first.return_value = mock_user
    mock_db_session.execute.return_value = mock_result

    response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
