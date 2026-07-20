from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

import pytest
from unittest.mock import AsyncMock
from app.db.engine import get_session

@pytest.fixture
def override_db():
    async def override_get_session():
        mock_db = AsyncMock()
        yield mock_db
    app.dependency_overrides[get_session] = override_get_session
    yield
    app.dependency_overrides.clear()

def test_health_check(override_db):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
