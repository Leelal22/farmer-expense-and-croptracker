from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Farm, Crop, Income
from app.utils.validators import api_response, parse_date
from app.utils.decorators import get_user_crop, get_user_income

income_bp = Blueprint('incomes', __name__, url_prefix='/api/incomes')

@income_bp.route('', methods=['GET'])
@jwt_required()
def get_incomes():
    current_user_id = int(get_jwt_identity())
    user_farms = Farm.query.filter_by(user_id=current_user_id).all()
    farm_ids = [f.id for f in user_farms]

    crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
    if not crop_ids:
        return api_response(success=True, message="Incomes fetched", data=[])

    crop_id_param = request.args.get('crop_id')
    buyer_param = request.args.get('buyer')
    payment_status_param = request.args.get('payment_status')
    start_date_param = request.args.get('start_date')
    end_date_param = request.args.get('end_date')

    if crop_id_param:
        crop_ids = [c for c in crop_ids if c == int(crop_id_param)]

    query = Income.query.filter(Income.crop_id.in_(crop_ids))

    if buyer_param:
        query = query.filter(Income.buyer_name.ilike(f'%{buyer_param}%'))
    if payment_status_param:
        query = query.filter(Income.payment_status == payment_status_param)

    s_date = parse_date(start_date_param)
    if s_date:
        query = query.filter(Income.sale_date >= s_date)
    e_date = parse_date(end_date_param)
    if e_date:
        query = query.filter(Income.sale_date <= e_date)

    incomes = query.order_by(Income.sale_date.desc()).all()
    return api_response(success=True, message="Incomes fetched successfully", data=[i.to_dict() for i in incomes])

@income_bp.route('', methods=['POST'])
@jwt_required()
def create_income():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    crop_id = data.get('crop_id')
    quantity = data.get('quantity')
    price_per_unit = data.get('price_per_unit')
    sale_date = parse_date(data.get('sale_date'))

    errors = {}
    if not crop_id:
        errors['crop_id'] = 'Crop ID is required'
    else:
        crop = get_user_crop(int(crop_id), current_user_id)
        if not crop:
            errors['crop_id'] = 'Crop not found or unauthorized'

    if quantity is None or float(quantity) <= 0:
        errors['quantity'] = 'Quantity must be greater than zero'

    if price_per_unit is None or float(price_per_unit) < 0:
        errors['price_per_unit'] = 'Price per unit cannot be negative'

    if not sale_date:
        errors['sale_date'] = 'Valid sale date is required (YYYY-MM-DD)'

    if errors:
        return api_response(success=False, message="Validation failed", errors=errors, status_code=400)

    # Secure automatic calculation on backend
    qty_val = float(quantity)
    price_val = float(price_per_unit)
    total_val = round(qty_val * price_val, 2)

    income = Income(
        crop_id=int(crop_id),
        buyer_name=data.get('buyer_name'),
        quantity=qty_val,
        unit=data.get('unit'),
        price_per_unit=price_val,
        total_amount=total_val,
        sale_date=sale_date,
        payment_status=data.get('payment_status', 'Paid'),
        payment_method=data.get('payment_method', 'Cash'),
        notes=data.get('notes')
    )

    try:
        db.session.add(income)
        db.session.commit()
        return api_response(success=True, message="Income recorded successfully", data=income.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to record income", errors={'server': str(e)}, status_code=500)

@income_bp.route('/<int:income_id>', methods=['GET'])
@jwt_required()
def get_income(income_id):
    current_user_id = int(get_jwt_identity())
    income = get_user_income(income_id, current_user_id)
    if not income:
        return api_response(success=False, message="Income record not found or unauthorized", status_code=404)
    return api_response(success=True, message="Income details fetched", data=income.to_dict())

@income_bp.route('/<int:income_id>', methods=['PUT'])
@jwt_required()
def update_income(income_id):
    current_user_id = int(get_jwt_identity())
    income = get_user_income(income_id, current_user_id)
    if not income:
        return api_response(success=False, message="Income record not found or unauthorized", status_code=404)

    data = request.get_json() or {}

    if 'buyer_name' in data:
        income.buyer_name = data['buyer_name']
    if 'quantity' in data and data['quantity'] is not None:
        if float(data['quantity']) <= 0:
            return api_response(success=False, message="Validation failed", errors={'quantity': 'Quantity must be greater than zero'}, status_code=400)
        income.quantity = float(data['quantity'])
    if 'price_per_unit' in data and data['price_per_unit'] is not None:
        if float(data['price_per_unit']) < 0:
            return api_response(success=False, message="Validation failed", errors={'price_per_unit': 'Price per unit cannot be negative'}, status_code=400)
        income.price_per_unit = float(data['price_per_unit'])
    if 'unit' in data:
        income.unit = data['unit']
    if 'sale_date' in data:
        s_date = parse_date(data['sale_date'])
        if s_date:
            income.sale_date = s_date
    if 'payment_status' in data:
        income.payment_status = data['payment_status']
    if 'payment_method' in data:
        income.payment_method = data['payment_method']
    if 'notes' in data:
        income.notes = data['notes']

    # Recalculate total_amount securely
    income.total_amount = round(float(income.quantity) * float(income.price_per_unit), 2)

    try:
        db.session.commit()
        return api_response(success=True, message="Income updated successfully", data=income.to_dict())
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to update income", errors={'server': str(e)}, status_code=500)

@income_bp.route('/<int:income_id>', methods=['DELETE'])
@jwt_required()
def delete_income(income_id):
    current_user_id = int(get_jwt_identity())
    income = get_user_income(income_id, current_user_id)
    if not income:
        return api_response(success=False, message="Income record not found or unauthorized", status_code=404)

    try:
        db.session.delete(income)
        db.session.commit()
        return api_response(success=True, message="Income deleted successfully")
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to delete income", errors={'server': str(e)}, status_code=500)
