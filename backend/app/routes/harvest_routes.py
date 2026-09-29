from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Farm, Crop, Harvest
from app.utils.validators import api_response, parse_date
from app.utils.decorators import get_user_crop, get_user_harvest

harvest_bp = Blueprint('harvests', __name__, url_prefix='/api/harvests')

@harvest_bp.route('', methods=['GET'])
@jwt_required()
def get_harvests():
    current_user_id = int(get_jwt_identity())
    user_farms = Farm.query.filter_by(user_id=current_user_id).all()
    farm_ids = [f.id for f in user_farms]

    crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
    if not crop_ids:
        return api_response(success=True, message="Harvests fetched", data=[])

    crop_id_param = request.args.get('crop_id')
    if crop_id_param:
        crop_ids = [c for c in crop_ids if c == int(crop_id_param)]

    harvests = Harvest.query.filter(Harvest.crop_id.in_(crop_ids)).order_by(Harvest.harvest_date.desc()).all()
    return api_response(success=True, message="Harvests fetched successfully", data=[h.to_dict() for h in harvests])

@harvest_bp.route('', methods=['POST'])
@jwt_required()
def create_harvest():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    crop_id = data.get('crop_id')
    quantity = data.get('quantity')
    harvest_date = parse_date(data.get('harvest_date'))

    errors = {}
    if not crop_id:
        errors['crop_id'] = 'Crop ID is required'
    else:
        crop = get_user_crop(int(crop_id), current_user_id)
        if not crop:
            errors['crop_id'] = 'Crop not found or unauthorized'

    if quantity is None or float(quantity) <= 0:
        errors['quantity'] = 'Quantity must be greater than zero'

    if not harvest_date:
        errors['harvest_date'] = 'Valid harvest date is required (YYYY-MM-DD)'

    if errors:
        return api_response(success=False, message="Validation failed", errors=errors, status_code=400)

    qty_val = float(quantity)
    price_val = float(data.get('selling_price')) if data.get('selling_price') is not None else None
    tot_inc = round(qty_val * price_val, 2) if price_val is not None else None

    harvest = Harvest(
        crop_id=int(crop_id),
        harvest_date=harvest_date,
        quantity=qty_val,
        unit=data.get('unit'),
        quality=data.get('quality'),
        selling_price=price_val,
        total_income=tot_inc,
        storage_location=data.get('storage_location'),
        notes=data.get('notes')
    )

    try:
        db.session.add(harvest)
        db.session.commit()
        return api_response(success=True, message="Harvest recorded successfully", data=harvest.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to record harvest", errors={'server': str(e)}, status_code=500)

@harvest_bp.route('/<int:harvest_id>', methods=['GET'])
@jwt_required()
def get_harvest(harvest_id):
    current_user_id = int(get_jwt_identity())
    harvest = get_user_harvest(harvest_id, current_user_id)
    if not harvest:
        return api_response(success=False, message="Harvest not found or unauthorized", status_code=404)
    return api_response(success=True, message="Harvest details fetched", data=harvest.to_dict())

@harvest_bp.route('/<int:harvest_id>', methods=['PUT'])
@jwt_required()
def update_harvest(harvest_id):
    current_user_id = int(get_jwt_identity())
    harvest = get_user_harvest(harvest_id, current_user_id)
    if not harvest:
        return api_response(success=False, message="Harvest not found or unauthorized", status_code=404)

    data = request.get_json() or {}

    if 'quantity' in data and data['quantity'] is not None:
        if float(data['quantity']) <= 0:
            return api_response(success=False, message="Validation failed", errors={'quantity': 'Quantity must be greater than zero'}, status_code=400)
        harvest.quantity = float(data['quantity'])
    if 'unit' in data:
        harvest.unit = data['unit']
    if 'quality' in data:
        harvest.quality = data['quality']
    if 'selling_price' in data and data['selling_price'] is not None:
        harvest.selling_price = float(data['selling_price'])
    if 'harvest_date' in data:
        h_date = parse_date(data['harvest_date'])
        if h_date:
            harvest.harvest_date = h_date
    if 'storage_location' in data:
        harvest.storage_location = data['storage_location']
    if 'notes' in data:
        harvest.notes = data['notes']

    if harvest.selling_price is not None:
        harvest.total_income = round(float(harvest.quantity) * float(harvest.selling_price), 2)

    try:
        db.session.commit()
        return api_response(success=True, message="Harvest updated successfully", data=harvest.to_dict())
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to update harvest", errors={'server': str(e)}, status_code=500)

@harvest_bp.route('/<int:harvest_id>', methods=['DELETE'])
@jwt_required()
def delete_harvest(harvest_id):
    current_user_id = int(get_jwt_identity())
    harvest = get_user_harvest(harvest_id, current_user_id)
    if not harvest:
        return api_response(success=False, message="Harvest not found or unauthorized", status_code=404)

    try:
        db.session.delete(harvest)
        db.session.commit()
        return api_response(success=True, message="Harvest deleted successfully")
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to delete harvest", errors={'server': str(e)}, status_code=500)
