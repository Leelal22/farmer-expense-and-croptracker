import pytest
import sys
import os

# Add backend app directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models import User, Farm, Crop, Expense, Income, Inventory

@pytest.fixture
def app():
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def auth_headers(client):
    # Register and login user
    reg_payload = {
        "name": "Test Farmer",
        "email": "testfarmer@farmertrack.com",
        "password": "Password123",
        "phone": "9998887770"
    }
    client.post('/api/auth/register', json=reg_payload)
    login_resp = client.post('/api/auth/login', json={"email": "testfarmer@farmertrack.com", "password": "Password123"})
    token = login_resp.get_json()['data']['access_token']
    return {"Authorization": f"Bearer {token}"}
