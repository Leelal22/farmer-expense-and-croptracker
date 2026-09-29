from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Farm, Crop, Expense
from app.utils.validators import api_response, parse_date
from app.utils.decorators import get_user_crop, get_user_expense

expense_bp = Blueprint('expenses', __name__, url_prefix='/api/expenses')

@expense_bp.route('', methods=['GET'])
@jwt_required()
def get_expenses():
    current_user_id = int(get_jwt_identity())
    user_farms = Farm.query.filter_by(user_id=current_user_id).all()
    farm_ids = [f.id for f in user_farms]

    crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
    if not crop_ids:
        return api_response(success=True, message="Expenses fetched", data=[])

    crop_id_param = request.args.get('crop_id')
    category_param = request.args.get('category')
    vendor_param = request.args.get('vendor')
    start_date_param = request.args.get('start_date')
    end_date_param = request.args.get('end_date')

    if crop_id_param:
        crop_ids = [c for c in crop_ids if c == int(crop_id_param)]

    query = Expense.query.filter(Expense.crop_id.in_(crop_ids))

    if category_param:
        query = query.filter(Expense.category == category_param)
    if vendor_param:
        query = query.filter(Expense.vendor.ilike(f'%{vendor_param}%'))

    s_date = parse_date(start_date_param)
    if s_date:
        query = query.filter(Expense.expense_date >= s_date)
    e_date = parse_date(end_date_param)
    if e_date:
        query = query.filter(Expense.expense_date <= e_date)

    # Optional Pagination
    page = request.args.get('page', type=int)
    limit = request.args.get('limit', type=int)

    if page and limit:
        paginated = query.order_by(Expense.expense_date.desc()).paginate(page=page, per_page=limit, error_out=False)
        expenses_data = [e.to_dict() for e in paginated.items]
        meta = {
            'page': paginated.page,
            'limit': paginated.per_page,
            'total': paginated.total,
            'pages': paginated.pages
        }
        return api_response(success=True, message="Expenses fetched", data={'items': expenses_data, 'pagination': meta})

    expenses = query.order_by(Expense.expense_date.desc()).all()
    return api_response(success=True, message="Expenses fetched successfully", data=[e.to_dict() for e in expenses])

@expense_bp.route('', methods=['POST'])
@jwt_required()
def create_expense():
    current_user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    crop_id = data.get('crop_id')
    category = data.get('category', '').strip()
    amount = data.get('amount')
    expense_date = parse_date(data.get('expense_date'))

    errors = {}
    if not crop_id:
        errors['crop_id'] = 'Crop ID is required'
    else:
        crop = get_user_crop(int(crop_id), current_user_id)
        if not crop:
            errors['crop_id'] = 'Crop not found or unauthorized'

    if not category:
        errors['category'] = 'Category is required'

    if amount is None or float(amount) <= 0:
        errors['amount'] = 'Amount must be greater than zero'

    if not expense_date:
        errors['expense_date'] = 'Valid expense date is required (YYYY-MM-DD)'

    if errors:
        return api_response(success=False, message="Validation failed", errors=errors, status_code=400)

    expense = Expense(
        crop_id=int(crop_id),
        category=category,
        description=data.get('description'),
        amount=float(amount),
        quantity=float(data.get('quantity')) if data.get('quantity') is not None else None,
        unit=data.get('unit'),
        vendor=data.get('vendor'),
        payment_method=data.get('payment_method', 'Cash'),
        expense_date=expense_date,
        receipt_number=data.get('receipt_number'),
        notes=data.get('notes')
    )

    try:
        db.session.add(expense)
        db.session.commit()
        return api_response(success=True, message="Expense recorded successfully", data=expense.to_dict(), status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to record expense", errors={'server': str(e)}, status_code=500)

@expense_bp.route('/<int:expense_id>', methods=['GET'])
@jwt_required()
def get_expense(expense_id):
    current_user_id = int(get_jwt_identity())
    expense = get_user_expense(expense_id, current_user_id)
    if not expense:
        return api_response(success=False, message="Expense not found or unauthorized", status_code=404)
    return api_response(success=True, message="Expense details fetched", data=expense.to_dict())

@expense_bp.route('/<int:expense_id>', methods=['PUT'])
@jwt_required()
def update_expense(expense_id):
    current_user_id = int(get_jwt_identity())
    expense = get_user_expense(expense_id, current_user_id)
    if not expense:
        return api_response(success=False, message="Expense not found or unauthorized", status_code=404)

    data = request.get_json() or {}

    if 'category' in data:
        expense.category = data['category'].strip()
    if 'description' in data:
        expense.description = data['description']
    if 'amount' in data and data['amount'] is not None:
        if float(data['amount']) <= 0:
            return api_response(success=False, message="Validation failed", errors={'amount': 'Amount must be greater than zero'}, status_code=400)
        expense.amount = float(data['amount'])
    if 'quantity' in data and data['quantity'] is not None:
        expense.quantity = float(data['quantity'])
    if 'unit' in data:
        expense.unit = data['unit']
    if 'vendor' in data:
        expense.vendor = data['vendor']
    if 'payment_method' in data:
        expense.payment_method = data['payment_method']
    if 'expense_date' in data:
        e_date = parse_date(data['expense_date'])
        if e_date:
            expense.expense_date = e_date
    if 'receipt_number' in data:
        expense.receipt_number = data['receipt_number']
    if 'notes' in data:
        expense.notes = data['notes']

    try:
        db.session.commit()
        return api_response(success=True, message="Expense updated successfully", data=expense.to_dict())
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to update expense", errors={'server': str(e)}, status_code=500)

@expense_bp.route('/<int:expense_id>', methods=['DELETE'])
@jwt_required()
def delete_expense(expense_id):
    current_user_id = int(get_jwt_identity())
    expense = get_user_expense(expense_id, current_user_id)
    if not expense:
        return api_response(success=False, message="Expense not found or unauthorized", status_code=404)

    try:
        db.session.delete(expense)
        db.session.commit()
        return api_response(success=True, message="Expense deleted successfully")
    except Exception as e:
        db.session.rollback()
        return api_response(success=False, message="Failed to delete expense", errors={'server': str(e)}, status_code=500)
