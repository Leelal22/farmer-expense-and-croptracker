from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models.farm import Farm
from app.models.crop import Crop
from app.models.expense import Expense
from app.models.income import Income
from app.utils.validators import api_response
from app.utils.decorators import get_user_farm
from sqlalchemy import func

farm_bp = Blueprint('farms', __name__, url_prefix='/api/farms')

@farm_bp.route('', methods=['GET'])
@jwt_required()
def get_farms():
    current_user_id = int(get_jwt_identity())
    farms = Farm.query.filter_by(user_id=current_user_id).all()
    
    result = []
    for farm in farms:
        f_dict = farm.to_dict()
        crop_ids = [c.id for c in farm.crops.all()]
        tot_exp = 0.0
        tot_inc = 0.0
        if crop_ids:
            tot_exp = float(db.session.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.crop_id.in_(crop_ids)).scalar())
            tot_inc = float(db.session.query(func.coalesce(func.sum(Income.total_amount), 0)).filter(Income.crop_id.in_(crop_ids)).scalar())
        f_dict['total_expenses'] = round(tot_exp, 2)
        f_dict['total_income'] = round(tot_inc, 2)
        f_dict['profit'] = round(tot_inc - tot_exp, 2)
        result.append(f_dict)

    return api_response(success=True, message="Farms fetched successfully", data=result)

@farm_bp.route('', methods=['POST'])
@jwt_required()
def create_farm():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    farm_name = data.get('farm_name', '').strip()
    total_area = data.get('total_area')

    errors = {}
    if not farm_name:
        errors['farm_name'] = 'Farm name is required'
    if total_area is None or float(total_area) <= 0:
        errors['total_area'] = 'Total area must be greater than zero'

    if errors:
        return api_response(success=False, message="Validation failed", errors=errors, status_code=400)

    farm = Farm(
        user_id=current_user_id,
        farm_name=farm_name,
        location=data.get('location'),
        village=data.get('village'),
        district=data.get('district'),
        state=data.get('state'),
        total_area=float(total_area),
        area_unit=data.get('area_unit', 'acres'),
        soil_type=data.get('soil_type'),
        irrigation_type=data.get('irrigation_type'),
        ownership_type=data.get('ownership_type'),
        notes=data.get('notes')
    )

    try:
        db.session.add(farm)
        db.session.commit()
        return api_response(success=True, message="Farm created successfully", data=farm.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to create farm", errors={'server': str(e)}, status_code=500)

@farm_bp.route('/<int:farm_id>', methods=['GET'])
@jwt_required()
def get_farm(farm_id):
    current_user_id = int(get_jwt_identity())
    farm = get_user_farm(farm_id, current_user_id)
    if not farm:
        return api_response(success=False, message="Farm not found or unauthorized", status_code=404)

    f_dict = farm.to_dict()
    crop_ids = [c.id for c in farm.crops.all()]
    tot_exp = 0.0
    tot_inc = 0.0
    if crop_ids:
        tot_exp = float(db.session.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.crop_id.in_(crop_ids)).scalar())
        tot_inc = float(db.session.query(func.coalesce(func.sum(Income.total_amount), 0)).filter(Income.crop_id.in_(crop_ids)).scalar())
    f_dict['total_expenses'] = round(tot_exp, 2)
    f_dict['total_income'] = round(tot_inc, 2)
    f_dict['profit'] = round(tot_inc - tot_exp, 2)

    return api_response(success=True, message="Farm details fetched", data=f_dict)

@farm_bp.route('/<int:farm_id>', methods=['PUT'])
@jwt_required()
def update_farm(farm_id):
    current_user_id = int(get_jwt_identity())
    farm = get_user_farm(farm_id, current_user_id)
    if not farm:
        return api_response(success=False, message="Farm not found or unauthorized", status_code=404)

    data = request.get_json() or {}

    if 'farm_name' in data:
        farm.farm_name = data['farm_name'].strip()
    if 'location' in data:
        farm.location = data['location']
    if 'village' in data:
        farm.village = data['village']
    if 'district' in data:
        farm.district = data['district']
    if 'state' in data:
        farm.state = data['state']
    if 'total_area' in data and data['total_area'] is not None:
        if float(data['total_area']) <= 0:
            return api_response(success=False, message="Validation failed", errors={'total_area': 'Area must be greater than zero'}, status_code=400)
        farm.total_area = float(data['total_area'])
    if 'area_unit' in data:
        farm.area_unit = data['area_unit']
    if 'soil_type' in data:
        farm.soil_type = data['soil_type']
    if 'irrigation_type' in data:
        farm.irrigation_type = data['irrigation_type']
    if 'ownership_type' in data:
        farm.ownership_type = data['ownership_type']
    if 'notes' in data:
        farm.notes = data['notes']

    try:
        db.session.commit()
        return api_response(success=True, message="Farm updated successfully", data=farm.to_dict())
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to update farm", errors={'server': str(e)}, status_code=500)

@farm_bp.route('/<int:farm_id>', methods=['DELETE'])
@jwt_required()
def delete_farm(farm_id):
    current_user_id = int(get_jwt_identity())
    farm = get_user_farm(farm_id, current_user_id)
    if not farm:
        return api_response(success=False, message="Farm not found or unauthorized", status_code=404)

    try:
        db.session.delete(farm)
        db.session.commit()
        return api_response(success=True, message="Farm deleted successfully")
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to delete farm", errors={'server': str(e)}, status_code=500)
