import pytest
import uuid
import io
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch, MagicMock
from app.main import app
from app.db.engine import get_session
from app.core.security import create_access_token
from app.models.user import User
from app.models.resume import Resume

client = TestClient(app)

TEST_USER_ID = str(uuid.uuid4())

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

def test_upload_invalid_mime_type(mock_db_session):
    token = setup_auth_mock(mock_db_session)
    
    file_content = b"test content"
    files = {"file": ("test.txt", io.BytesIO(file_content), "text/plain")}
    
    response = client.post(
        "/api/v1/resume/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 400
    assert "Invalid file type" in response.json()["detail"]

def test_upload_file_too_large(mock_db_session):
    token = setup_auth_mock(mock_db_session)
    
    # Create a 11MB file to exceed 10MB limit
    file_content = b"0" * (11 * 1024 * 1024)
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    
    response = client.post(
        "/api/v1/resume/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 413
    assert "exceeds the 10MB limit" in response.json()["detail"]

@patch('app.api.v1.endpoints.resume.StorageService')
def test_upload_success(mock_storage_service, mock_db_session):
    token = setup_auth_mock(mock_db_session)
    
    mock_storage_service.save_upload_file = AsyncMock(return_value="/mock/path/test.pdf")
    
    # Needs to return the mocked resume on refresh
    def side_effect(resume_obj, *args, **kwargs):
        resume_obj.id = uuid.uuid4()
    mock_db_session.refresh = AsyncMock(side_effect=side_effect)
    mock_db_session.commit = AsyncMock()
    
    file_content = b"dummy pdf content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    
    response = client.post(
        "/api/v1/resume/upload",
        files=files,
        headers={"Authorization": f"Bearer {token}"}
    )
    
    assert response.status_code == 202
    data = response.json()
    assert "data" in data
    assert "id" in data["data"]
    assert data["data"]["parsing_status"] == "pending"
