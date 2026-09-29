def test_farm_and_crop_workflow(client, auth_headers):
    # 1. Create Farm
    farm_payload = {
        "farm_name": "Green Valley Farm",
        "location": "Sector 4, Guntur",
        "total_area": 10.5,
        "area_unit": "acres",
        "soil_type": "Black Soil",
        "irrigation_type": "Borewell"
    }
    farm_resp = client.post('/api/farms', json=farm_payload, headers=auth_headers)
    assert farm_resp.status_code == 201
    farm_data = farm_resp.get_json()['data']
    farm_id = farm_data['id']
    assert farm_data['farm_name'] == "Green Valley Farm"

    # 2. Get Farms
    farms_list_resp = client.get('/api/farms', headers=auth_headers)
    assert farms_list_resp.status_code == 200
    assert len(farms_list_resp.get_json()['data']) == 1

    # 3. Create Crop
    crop_payload = {
        "farm_id": farm_id,
        "crop_name": "Organic Paddy",
        "crop_variety": "BPT 5204",
        "season": "Kharif",
        "sowing_date": "2026-06-01",
        "area": 5.0,
        "status": "GROWING"
    }
    crop_resp = client.post('/api/crops', json=crop_payload, headers=auth_headers)
    assert crop_resp.status_code == 201
    crop_data = crop_resp.get_json()['data']
    crop_id = crop_data['id']
    assert crop_data['crop_name'] == "Organic Paddy"

    # 4. Get Crops
    crops_resp = client.get('/api/crops', headers=auth_headers)
    assert crops_resp.status_code == 200
    assert len(crops_resp.get_json()['data']) == 1

def test_financial_and_profitability_engine(client, auth_headers):
    # Create farm & crop
    f_res = client.post('/api/farms', json={"farm_name": "Profit Farm", "total_area": 5.0}, headers=auth_headers)
    farm_id = f_res.get_json()['data']['id']
    
    c_res = client.post('/api/crops', json={"farm_id": farm_id, "crop_name": "Sweet Corn"}, headers=auth_headers)
    crop_id = c_res.get_json()['data']['id']

    # Record Expenses (Total = 15,000)
    client.post('/api/expenses', json={
        "crop_id": crop_id, "category": "Seeds", "amount": 5000, "expense_date": "2026-07-01"
    }, headers=auth_headers)
    client.post('/api/expenses', json={
        "crop_id": crop_id, "category": "Fertilizer", "amount": 10000, "expense_date": "2026-07-15"
    }, headers=auth_headers)

    # Record Income (Total = 35,000 via qty=10, price=3500)
    client.post('/api/incomes', json={
        "crop_id": crop_id, "quantity": 10, "price_per_unit": 3500, "sale_date": "2026-09-01"
    }, headers=auth_headers)

    # Check Profitability API
    prof_resp = client.get(f'/api/crops/{crop_id}/profitability', headers=auth_headers)
    assert prof_resp.status_code == 200
    pdata = prof_resp.get_json()['data']

    assert pdata['total_expense'] == 15000.0
    assert pdata['total_income'] == 35000.0
    assert pdata['profit'] == 20000.0
    assert pdata['roi'] == 133.33
    assert pdata['is_profitable'] is True

def test_inventory_and_dashboard_summary(client, auth_headers):
    # Create Farm
    f_res = client.post('/api/farms', json={"farm_name": "Inventory Test Farm", "total_area": 3.0}, headers=auth_headers)
    farm_id = f_res.get_json()['data']['id']

    # Create Inventory item with low stock
    inv_payload = {
        "farm_id": farm_id,
        "item_name": "Urea Fertilizer",
        "category": "Fertilizers",
        "quantity": 2.0,
        "minimum_stock": 5.0,
        "unit": "bags"
    }
    inv_resp = client.post('/api/inventory', json=inv_payload, headers=auth_headers)
    assert inv_resp.status_code == 201
    assert inv_resp.get_json()['data']['stock_status'] == "LOW_STOCK"

    # Dashboard Summary test
    dash_resp = client.get('/api/dashboard/summary', headers=auth_headers)
    assert dash_resp.status_code == 200
    d_data = dash_resp.get_json()['data']
    assert d_data['total_farms'] == 1
    assert d_data['low_stock_items'] == 1
