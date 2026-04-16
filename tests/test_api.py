import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_root_route():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Resume Tailoring Engine is running"}

def test_upload_no_file():
    response = client.post("/api/upload")
    assert response.status_code == 422

def test_upload_wrong_file_type():
    response = client.post(
        "/api/upload",
        files={"file": ("test.txt", b"hello", "text/plain")}
    )
    assert response.status_code == 400