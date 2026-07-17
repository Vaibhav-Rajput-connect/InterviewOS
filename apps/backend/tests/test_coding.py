import pytest
import uuid
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.db.engine import get_session
from app.core.security import create_access_token
from app.models.user import User
from app.models.coding import CodingProblem

client = TestClient(app)

TEST_USER_ID = str(uuid.uuid4())
TEST_PROBLEM_ID = str(uuid.uuid4())

@pytest.fixture
def mock_db_session():
    mock_db = AsyncMock()
    app.dependency_overrides[get_session] = lambda: mock_db
    yield mock_db
    app.dependency_overrides.clear()

def setup_auth_mock(mock_db_session):
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
    return token

def test_get_problems_empty(mock_db_session):
    token = setup_auth_mock(mock_db_session)
    
    # Mocking problems query
    def side_effect(stmt, *args, **kwargs):
        mock_result = MagicMock()
        stmt_str = str(stmt).lower()
        if "users" in stmt_str:
            mock_result.scalars().first.return_value = User(
                id=uuid.UUID(TEST_USER_ID), email="test@example.com", is_active=True, role="candidate", is_verified=True
            )
        elif "coding_problems" in stmt_str:
            mock_result.scalars().all.return_value = []
        return mock_result
        
    mock_db_session.execute.side_effect = side_effect

    response = client.get("/api/v1/coding/problems", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json() == []

def test_get_problems_success(mock_db_session):
    token = setup_auth_mock(mock_db_session)
    
    # Mocking problems query
    def side_effect(stmt, *args, **kwargs):
        mock_result = MagicMock()
        stmt_str = str(stmt).lower()
        if "users" in stmt_str:
            mock_result.scalars().first.return_value = User(
                id=uuid.UUID(TEST_USER_ID), email="test@example.com", is_active=True, role="candidate", is_verified=True
            )
        elif "coding_problems" in stmt_str:
            mock_result.scalars().all.return_value = [
                CodingProblem(
                    id=uuid.UUID(TEST_PROBLEM_ID),
                    title="Two Sum",
                    difficulty="Easy",
                    description="Given an array of integers..."
                )
            ]
        return mock_result
        
    mock_db_session.execute.side_effect = side_effect

    response = client.get("/api/v1/coding/problems", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Two Sum"
