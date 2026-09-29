def test_register_and_login(client):
    # Test Register
    reg_payload = {
        "name": "Ramesh Patel",
        "email": "ramesh@farm.com",
        "password": "SecurePassword123",
        "phone": "9876543210"
    }
    response = client.post('/api/auth/register', json=reg_payload)
    assert response.status_code == 201
    json_data = response.get_json()
    assert json_data['success'] is True
    assert 'access_token' in json_data['data']

    # Test Login
    login_payload = {
        "email": "ramesh@farm.com",
        "password": "SecurePassword123"
    }
    login_resp = client.post('/api/auth/login', json=login_payload)
    assert login_resp.status_code == 200
    login_data = login_resp.get_json()
    assert login_data['success'] is True
    assert 'access_token' in login_data['data']

def test_get_current_user_profile(client, auth_headers):
    response = client.get('/api/auth/me', headers=auth_headers)
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['data']['email'] == "testfarmer@farmertrack.com"
