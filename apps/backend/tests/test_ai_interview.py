import pytest
import uuid
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.db.engine import get_session
from app.core.security import create_access_token
from app.models.user import User
from app.models.interview_engine import InterviewSession
from app.models.resume import Resume

client = TestClient(app)

TEST_USER_ID = str(uuid.uuid4())
TEST_RESUME_ID = str(uuid.uuid4())
TEST_SESSION_ID = str(uuid.uuid4())

@pytest.fixture
def mock_db_session():
    mock_db = AsyncMock()
    app.dependency_overrides[get_session] = lambda: mock_db
    yield mock_db
    app.dependency_overrides.clear()

def test_interview_start(mock_db_session):
    token = create_access_token(TEST_USER_ID)
    
    mock_user = User(
        id=uuid.UUID(TEST_USER_ID),
        email="test@example.com",
        is_active=True
    )
    
    mock_resume = Resume(
        id=uuid.UUID(TEST_RESUME_ID),
        user_id=uuid.UUID(TEST_USER_ID),
        parsing_status="completed"
    )
    
    def side_effect(stmt, *args, **kwargs):
        mock_result = MagicMock()
        stmt_str = str(stmt).lower()
        if "users" in stmt_str:
            mock_result.scalars().first.return_value = mock_user
        elif "resumes" in stmt_str:
            mock_result.scalars().first.return_value = mock_resume
        else:
            mock_result.scalars().first.return_value = None
        return mock_result
        
    mock_db_session.execute.side_effect = side_effect
    mock_db_session.get.return_value = mock_resume

    response = client.post(
        "/api/v1/interview/start",
        json={
            "resume_id": TEST_RESUME_ID,
            "target_company": "Google",
            "target_role": "Software Engineer",
            "difficulty": "Hard",
            "interview_type": "Technical",
            "duration_minutes": 45
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    
    if response.status_code != 201:
        print("ERROR RESPONSE:", response.json())
        
    assert response.status_code == 201
    data = response.json()
    assert "id" in data


@patch('app.api.v1.endpoints.interview.ai_gateway')
def test_interview_next_question(mock_ai_gateway, mock_db_session):
    token = create_access_token(TEST_USER_ID)
    
    mock_user = User(
        id=uuid.UUID(TEST_USER_ID),
        email="test@example.com",
        is_active=True
    )
    
    mock_session = InterviewSession(
        id=uuid.UUID(TEST_SESSION_ID),
        user_id=uuid.UUID(TEST_USER_ID),
        resume_id=uuid.UUID(TEST_RESUME_ID),
        target_company="Google",
        target_role="SWE",
        difficulty="Hard",
        status="scheduled"
    )
    
    def side_effect(stmt, *args, **kwargs):
        mock_result = MagicMock()
        stmt_str = str(stmt).lower()
        if "users" in stmt_str:
            mock_result.scalars().first.return_value = mock_user
        elif "interview_sessions" in stmt_str:
            mock_result.scalars().first.return_value = mock_session
        elif "resumes" in stmt_str:
            mock_result.scalars().first.return_value = mock_resume
        else:
            mock_result.scalars().first.return_value = None
        return mock_result
        
    mock_db_session.execute.side_effect = side_effect
    mock_db_session.get = AsyncMock(return_value=mock_session)
    
    class MockGenerated:
        category = "System Design"
        content = "How do you implement a load balancer?"
        expected_points = ["Check scalable", "Talk about hashing"]
        
    # Mock AI Gateway response
    mock_ai_gateway.generate_interview_question = AsyncMock(return_value=MockGenerated())

    response = client.post(
        f"/api/v1/interview/sessions/{TEST_SESSION_ID}/next-question",
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "content" in data
    assert mock_ai_gateway.generate_interview_question.called
