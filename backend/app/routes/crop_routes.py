from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import Farm, Crop, Expense, Income
from app.services.profitability_service import ProfitabilityService
from app.utils.validators import api_response, parse_date
from app.utils.decorators import get_user_farm, get_user_crop
from sqlalchemy import func


crop_bp = Blueprint('crops', __name__, url_prefix='/api/crops')


# ---------------------------------------------------------
# Helper: safely convert optional values to float
# ---------------------------------------------------------
def optional_float(value):
    """
    Convert a value to float if provided.
    Return None when the value is empty, None, or whitespace.
    """
    if value is None:
        return None

    if isinstance(value, str) and value.strip() == '':
        return None

    return float(value)


# ---------------------------------------------------------
# GET ALL CROPS
# ---------------------------------------------------------
@crop_bp.route('', methods=['GET'])
@jwt_required()
def get_crops():
    current_user_id = int(get_jwt_identity())

    user_farms = Farm.query.filter_by(user_id=current_user_id).all()
    farm_ids = [f.id for f in user_farms]

    farm_id_param = request.args.get('farm_id')
    status_param = request.args.get('status')
    season_param = request.args.get('season')

    if farm_id_param:
        farm_ids = [
            f for f in farm_ids
            if f == int(farm_id_param)
        ]

    if not farm_ids:
        return api_response(
            success=True,
            message="Crops fetched",
            data=[]
        )

    query = Crop.query.filter(
        Crop.farm_id.in_(farm_ids)
    )

    if status_param:
        query = query.filter(
            Crop.status == status_param
        )

    if season_param:
        query = query.filter(
            Crop.season == season_param
        )

    crops = query.all()

    result = []

    for crop in crops:
        c_dict = crop.to_dict()

        tot_exp = float(
            db.session.query(
                func.coalesce(func.sum(Expense.amount), 0)
            )
            .filter(Expense.crop_id == crop.id)
            .scalar()
        )

        tot_inc = float(
            db.session.query(
                func.coalesce(func.sum(Income.total_amount), 0)
            )
            .filter(Income.crop_id == crop.id)
            .scalar()
        )

        c_dict['total_expense'] = round(tot_exp, 2)
        c_dict['total_income'] = round(tot_inc, 2)
        c_dict['profit'] = round(tot_inc - tot_exp, 2)

        c_dict['roi'] = (
            round(((tot_inc - tot_exp) / tot_exp * 100), 2)
            if tot_exp > 0
            else (100.0 if tot_inc > 0 else 0.0)
        )

        result.append(c_dict)

    return api_response(
        success=True,
        message="Crops fetched successfully",
        data=result
    )


# ---------------------------------------------------------
# CREATE CROP
# ---------------------------------------------------------
@crop_bp.route('', methods=['POST'])
@jwt_required()
def create_crop():

    current_user_id = int(get_jwt_identity())

    data = request.get_json() or {}

    farm_id = data.get('farm_id')
    crop_name = data.get('crop_name', '').strip()

    errors = {}

    # Validate farm
    if not farm_id:
        errors['farm_id'] = 'Farm ID is required'
    else:
        try:
            farm = get_user_farm(
                int(farm_id),
                current_user_id
            )

            if not farm:
                errors['farm_id'] = (
                    'Farm not found or unauthorized'
                )

        except (ValueError, TypeError):
            errors['farm_id'] = 'Invalid farm ID'

    # Validate crop name
    if not crop_name:
        errors['crop_name'] = 'Crop name is required'

    if errors:
        return api_response(
            success=False,
            message="Validation failed",
            errors=errors,
            status_code=400
        )

    # -----------------------------------------------------
    # Create crop
    # -----------------------------------------------------

    crop = Crop(
        farm_id=int(farm_id),

        crop_name=crop_name,

        crop_variety=data.get('crop_variety'),

        season=data.get('season'),

        sowing_date=parse_date(
            data.get('sowing_date')
        ),

        expected_harvest_date=parse_date(
            data.get('expected_harvest_date')
        ),

        actual_harvest_date=parse_date(
            data.get('actual_harvest_date')
        ),

        # IMPORTANT:
        # Empty string "" becomes None
        area=optional_float(
            data.get('area')
        ),

        area_unit=data.get(
            'area_unit',
            'acres'
        ),

        seed_quantity=optional_float(
            data.get('seed_quantity')
        ),

        seed_unit=data.get(
            'seed_unit'
        ),

        expected_yield=optional_float(
            data.get('expected_yield')
        ),

        yield_unit=data.get(
            'yield_unit'
        ),

        expected_price=optional_float(
            data.get('expected_price')
        ),

        status=data.get(
            'status',
            'PLANNED'
        ),

        notes=data.get('notes')
    )

    try:

        db.session.add(crop)

        db.session.commit()

        return api_response(
            success=True,
            message="Crop created successfully",
            data=crop.to_dict(),
            status_code=201
        )

    except Exception as e:

        db.session.rollback()

        return api_response(
            success=False,
            message="Failed to create crop",
            errors={
                'server': str(e)
            },
            status_code=500
        )


# ---------------------------------------------------------
# GET SINGLE CROP
# ---------------------------------------------------------
@crop_bp.route('/<int:crop_id>', methods=['GET'])
@jwt_required()
def get_crop(crop_id):

    current_user_id = int(get_jwt_identity())

    crop = get_user_crop(
        crop_id,
        current_user_id
    )

    if not crop:
        return api_response(
            success=False,
            message="Crop not found or unauthorized",
            status_code=404
        )

    c_dict = crop.to_dict()

    tot_exp = float(
        db.session.query(
            func.coalesce(func.sum(Expense.amount), 0)
        )
        .filter(Expense.crop_id == crop.id)
        .scalar()
    )

    tot_inc = float(
        db.session.query(
            func.coalesce(func.sum(Income.total_amount), 0)
        )
        .filter(Income.crop_id == crop.id)
        .scalar()
    )

    c_dict['total_expense'] = round(
        tot_exp,
        2
    )

    c_dict['total_income'] = round(
        tot_inc,
        2
    )

    c_dict['profit'] = round(
        tot_inc - tot_exp,
        2
    )

    c_dict['roi'] = (
        round(
            ((tot_inc - tot_exp) / tot_exp * 100),
            2
        )
        if tot_exp > 0
        else (
            100.0
            if tot_inc > 0
            else 0.0
        )
    )

    return api_response(
        success=True,
        message="Crop details fetched",
        data=c_dict
    )


# ---------------------------------------------------------
# CROP PROFITABILITY
# ---------------------------------------------------------
@crop_bp.route(
    '/<int:crop_id>/profitability',
    methods=['GET']
)
@jwt_required()
def get_crop_profitability(crop_id):

    current_user_id = int(
        get_jwt_identity()
    )

    result, errors, status_code = (
        ProfitabilityService.get_crop_profitability(
            crop_id,
            current_user_id
        )
    )

    if errors:
        return api_response(
            success=False,
            message=errors.get(
                'message',
                'Failed'
            ),
            errors=errors,
            status_code=status_code
        )

    return api_response(
        success=True,
        message="Crop profitability fetched successfully",
        data=result
    )


# ---------------------------------------------------------
# UPDATE CROP
# ---------------------------------------------------------
@crop_bp.route('/<int:crop_id>', methods=['PUT'])
@jwt_required()
def update_crop(crop_id):

    current_user_id = int(
        get_jwt_identity()
    )

    crop = get_user_crop(
        crop_id,
        current_user_id
    )

    if not crop:
        return api_response(
            success=False,
            message="Crop not found or unauthorized",
            status_code=404
        )

    data = request.get_json() or {}

    # -----------------------------------------------------
    # Basic fields
    # -----------------------------------------------------

    if 'crop_name' in data:
        crop.crop_name = (
            data['crop_name'].strip()
        )

    if 'crop_variety' in data:
        crop.crop_variety = data['crop_variety']

    if 'season' in data:
        crop.season = data['season']

    # -----------------------------------------------------
    # Dates
    # -----------------------------------------------------

    if 'sowing_date' in data:
        crop.sowing_date = parse_date(
            data['sowing_date']
        )

    if 'expected_harvest_date' in data:
        crop.expected_harvest_date = parse_date(
            data['expected_harvest_date']
        )

    if 'actual_harvest_date' in data:
        crop.actual_harvest_date = parse_date(
            data['actual_harvest_date']
        )

    # -----------------------------------------------------
    # Numeric fields
    # -----------------------------------------------------

    if 'area' in data:
        crop.area = optional_float(
            data['area']
        )

    if 'area_unit' in data:
        crop.area_unit = data['area_unit']

    if 'seed_quantity' in data:
        crop.seed_quantity = optional_float(
            data['seed_quantity']
        )

    if 'seed_unit' in data:
        crop.seed_unit = data['seed_unit']

    if 'expected_yield' in data:
        crop.expected_yield = optional_float(
            data['expected_yield']
        )

    if 'yield_unit' in data:
        crop.yield_unit = data['yield_unit']

    if 'expected_price' in data:
        crop.expected_price = optional_float(
            data['expected_price']
        )

    # -----------------------------------------------------
    # Other fields
    # -----------------------------------------------------

    if 'status' in data:
        crop.status = data['status']

    if 'notes' in data:
        crop.notes = data['notes']

    # -----------------------------------------------------
    # Save changes
    # -----------------------------------------------------

    try:

        db.session.commit()

        return api_response(
            success=True,
            message="Crop updated successfully",
            data=crop.to_dict()
        )

    except Exception as e:

        db.session.rollback()

        return api_response(
            success=False,
            message="Failed to update crop",
            errors={
                'server': str(e)
            },
            status_code=500
        )


# ---------------------------------------------------------
# DELETE CROP
# ---------------------------------------------------------
@crop_bp.route('/<int:crop_id>', methods=['DELETE'])
@jwt_required()
def delete_crop(crop_id):

    current_user_id = int(
        get_jwt_identity()
    )

    crop = get_user_crop(
        crop_id,
        current_user_id
    )

    if not crop:
        return api_response(
            success=False,
            message="Crop not found or unauthorized",
            status_code=404
        )

    try:

        db.session.delete(crop)

        db.session.commit()

        return api_response(
            success=True,
            message="Crop deleted successfully"
        )

    except Exception as e:

        db.session.rollback()

        return api_response(
            success=False,
            message="Failed to delete crop",
            errors={
                'server': str(e)
            },
            status_code=500
        )