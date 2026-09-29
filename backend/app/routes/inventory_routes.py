from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Farm, Inventory
from app.utils.validators import api_response, parse_date
from app.utils.decorators import get_user_farm, get_user_inventory


inventory_bp = Blueprint(
    'inventory',
    __name__,
    url_prefix='/api/inventory'
)


# ============================================================
# Helper functions
# ============================================================

def safe_float(value, default=None):
    """
    Convert a value to float safely.

    Handles:
    - None
    - ""
    - "   "
    - numeric strings
    - int / float
    """
    if value is None:
        return default

    if isinstance(value, str):
        value = value.strip()

        if value == "":
            return default

    try:
        return float(value)
    except (ValueError, TypeError):
        return default


def required_float(value):
    """
    Convert required numeric field to float.
    Returns None when the value is empty/invalid.
    """
    if value is None:
        return None

    if isinstance(value, str):
        value = value.strip()

        if value == "":
            return None

    try:
        return float(value)
    except (ValueError, TypeError):
        return None


# ============================================================
# GET ALL INVENTORY
# ============================================================

@inventory_bp.route('', methods=['GET'])
@jwt_required()
def get_inventory():

    current_user_id = int(get_jwt_identity())

    user_farms = Farm.query.filter_by(
        user_id=current_user_id
    ).all()

    farm_ids = [farm.id for farm in user_farms]

    if not farm_ids:
        return api_response(
            success=True,
            message="Inventory fetched",
            data=[]
        )

    farm_id_param = request.args.get('farm_id')
    category_param = request.args.get('category')
    stock_status_param = request.args.get('stock_status')

    # --------------------------------------------------------
    # Farm filter
    # --------------------------------------------------------

    if farm_id_param:

        try:
            farm_id = int(farm_id_param)

            if farm_id not in farm_ids:
                return api_response(
                    success=True,
                    message="Inventory fetched",
                    data=[]
                )

            farm_ids = [farm_id]

        except ValueError:
            return api_response(
                success=False,
                message="Invalid farm ID",
                status_code=400
            )

    # --------------------------------------------------------
    # Query
    # --------------------------------------------------------

    query = Inventory.query.filter(
        Inventory.farm_id.in_(farm_ids)
    )

    if category_param:
        query = query.filter(
            Inventory.category == category_param
        )

    items = query.order_by(
        Inventory.created_at.desc()
    ).all()

    result = [
        item.to_dict()
        for item in items
    ]

    # --------------------------------------------------------
    # Stock status filter
    # --------------------------------------------------------

    if stock_status_param:

        result = [
            item
            for item in result
            if item.get('stock_status') == stock_status_param
        ]

    return api_response(
        success=True,
        message="Inventory fetched successfully",
        data=result
    )


# ============================================================
# CREATE INVENTORY
# ============================================================

@inventory_bp.route('', methods=['POST'])
@jwt_required()
def create_inventory():

    current_user_id = int(get_jwt_identity())

    data = request.get_json() or {}

    # --------------------------------------------------------
    # Basic fields
    # --------------------------------------------------------

    farm_id = data.get('farm_id')

    item_name = str(
        data.get('item_name') or ''
    ).strip()

    category = str(
        data.get('category') or ''
    ).strip()

    quantity_raw = data.get('quantity')

    # --------------------------------------------------------
    # Numeric conversion
    # --------------------------------------------------------

    quantity = required_float(quantity_raw)

    minimum_stock = safe_float(
        data.get('minimum_stock'),
        default=0.0
    )

    purchase_price = safe_float(
        data.get('purchase_price'),
        default=None
    )

    # --------------------------------------------------------
    # Validation
    # --------------------------------------------------------

    errors = {}

    # Farm
    if not farm_id:

        errors['farm_id'] = 'Farm ID is required'

    else:

        try:

            farm_id = int(farm_id)

            farm = get_user_farm(
                farm_id,
                current_user_id
            )

            if not farm:
                errors['farm_id'] = (
                    'Farm not found or unauthorized'
                )

        except (ValueError, TypeError):

            errors['farm_id'] = 'Invalid farm ID'

    # Item name
    if not item_name:

        errors['item_name'] = (
            'Item name is required'
        )

    # Category
    if not category:

        errors['category'] = (
            'Category is required'
        )

    # Quantity
    if quantity is None:

        errors['quantity'] = (
            'Quantity is required and must be a valid number'
        )

    elif quantity < 0:

        errors['quantity'] = (
            'Quantity cannot be negative'
        )

    # Minimum stock
    if minimum_stock is None:

        errors['minimum_stock'] = (
            'Minimum stock must be a valid number'
        )

    elif minimum_stock < 0:

        errors['minimum_stock'] = (
            'Minimum stock cannot be negative'
        )

    # Purchase price
    if purchase_price is not None and purchase_price < 0:

        errors['purchase_price'] = (
            'Purchase price cannot be negative'
        )

    # --------------------------------------------------------
    # Return validation errors
    # --------------------------------------------------------

    if errors:

        return api_response(
            success=False,
            message="Validation failed",
            errors=errors,
            status_code=400
        )

    # --------------------------------------------------------
    # Create inventory object
    # --------------------------------------------------------

    item = Inventory(
        farm_id=farm_id,
        item_name=item_name,
        category=category,
        quantity=quantity,

        unit=data.get('unit') or None,

        minimum_stock=minimum_stock,

        purchase_price=purchase_price,

        supplier=data.get('supplier') or None,

        purchase_date=parse_date(
            data.get('purchase_date')
        ),

        expiry_date=parse_date(
            data.get('expiry_date')
        ),

        notes=data.get('notes') or None
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    try:

        db.session.add(item)

        db.session.commit()

        return api_response(
            success=True,
            message="Inventory item added successfully",
            data=item.to_dict(),
            status_code=201
        )

    except Exception as e:

        db.session.rollback()

        return api_response(
            success=False,
            message="Failed to add inventory item",
            errors={
                'server': str(e)
            },
            status_code=500
        )


# ============================================================
# GET SINGLE INVENTORY ITEM
# ============================================================

@inventory_bp.route(
    '/<int:inventory_id>',
    methods=['GET']
)
@jwt_required()
def get_inventory_item(inventory_id):

    current_user_id = int(
        get_jwt_identity()
    )

    item = get_user_inventory(
        inventory_id,
        current_user_id
    )

    if not item:

        return api_response(
            success=False,
            message="Inventory item not found or unauthorized",
            status_code=404
        )

    return api_response(
        success=True,
        message="Inventory item details fetched",
        data=item.to_dict()
    )


# ============================================================
# UPDATE INVENTORY ITEM
# ============================================================

@inventory_bp.route(
    '/<int:inventory_id>',
    methods=['PUT']
)
@jwt_required()
def update_inventory_item(inventory_id):

    current_user_id = int(
        get_jwt_identity()
    )

    item = get_user_inventory(
        inventory_id,
        current_user_id
    )

    if not item:

        return api_response(
            success=False,
            message="Inventory item not found or unauthorized",
            status_code=404
        )

    data = request.get_json() or {}

    errors = {}

    # --------------------------------------------------------
    # Item name
    # --------------------------------------------------------

    if 'item_name' in data:

        item_name = str(
            data.get('item_name') or ''
        ).strip()

        if not item_name:

            errors['item_name'] = (
                'Item name cannot be empty'
            )

        else:

            item.item_name = item_name

    # --------------------------------------------------------
    # Category
    # --------------------------------------------------------

    if 'category' in data:

        category = str(
            data.get('category') or ''
        ).strip()

        if not category:

            errors['category'] = (
                'Category cannot be empty'
            )

        else:

            item.category = category

    # --------------------------------------------------------
    # Quantity
    # --------------------------------------------------------

    if 'quantity' in data:

        quantity = required_float(
            data.get('quantity')
        )

        if quantity is None:

            errors['quantity'] = (
                'Quantity must be a valid number'
            )

        elif quantity < 0:

            errors['quantity'] = (
                'Quantity cannot be negative'
            )

        else:

            item.quantity = quantity

    # --------------------------------------------------------
    # Unit
    # --------------------------------------------------------

    if 'unit' in data:

        item.unit = data.get('unit') or None

    # --------------------------------------------------------
    # Minimum stock
    # --------------------------------------------------------

    if 'minimum_stock' in data:

        minimum_stock = safe_float(
            data.get('minimum_stock'),
            default=None
        )

        # Empty value means 0
        if minimum_stock is None:

            if (
                data.get('minimum_stock') is None
                or str(data.get('minimum_stock')).strip() == ''
            ):

                item.minimum_stock = 0.0

            else:

                errors['minimum_stock'] = (
                    'Minimum stock must be a valid number'
                )

        elif minimum_stock < 0:

            errors['minimum_stock'] = (
                'Minimum stock cannot be negative'
            )

        else:

            item.minimum_stock = minimum_stock

    # --------------------------------------------------------
    # Purchase price
    # --------------------------------------------------------

    if 'purchase_price' in data:

        purchase_price = safe_float(
            data.get('purchase_price'),
            default=None
        )

        # Empty purchase price is allowed
        if (
            data.get('purchase_price') is None
            or str(data.get('purchase_price')).strip() == ''
        ):

            item.purchase_price = None

        elif purchase_price is None:

            errors['purchase_price'] = (
                'Purchase price must be a valid number'
            )

        elif purchase_price < 0:

            errors['purchase_price'] = (
                'Purchase price cannot be negative'
            )

        else:

            item.purchase_price = purchase_price

    # --------------------------------------------------------
    # Supplier
    # --------------------------------------------------------

    if 'supplier' in data:

        item.supplier = data.get('supplier') or None

    # --------------------------------------------------------
    # Purchase date
    # --------------------------------------------------------

    if 'purchase_date' in data:

        item.purchase_date = parse_date(
            data.get('purchase_date')
        )

    # --------------------------------------------------------
    # Expiry date
    # --------------------------------------------------------

    if 'expiry_date' in data:

        item.expiry_date = parse_date(
            data.get('expiry_date')
        )

    # --------------------------------------------------------
    # Notes
    # --------------------------------------------------------

    if 'notes' in data:

        item.notes = data.get('notes') or None

    # --------------------------------------------------------
    # Validation errors
    # --------------------------------------------------------

    if errors:

        return api_response(
            success=False,
            message="Validation failed",
            errors=errors,
            status_code=400
        )

    # --------------------------------------------------------
    # Save update
    # --------------------------------------------------------

    try:

        db.session.commit()

        return api_response(
            success=True,
            message="Inventory item updated successfully",
            data=item.to_dict()
        )

    except Exception as e:

        db.session.rollback()

        return api_response(
            success=False,
            message="Failed to update inventory item",
            errors={
                'server': str(e)
            },
            status_code=500
        )


# ============================================================
# DELETE INVENTORY ITEM
# ============================================================

@inventory_bp.route(
    '/<int:inventory_id>',
    methods=['DELETE']
)
@jwt_required()
def delete_inventory_item(inventory_id):

    current_user_id = int(
        get_jwt_identity()
    )

    item = get_user_inventory(
        inventory_id,
        current_user_id
    )

    if not item:

        return api_response(
            success=False,
            message="Inventory item not found or unauthorized",
            status_code=404
        )

    try:

        db.session.delete(item)

        db.session.commit()

        return api_response(
            success=True,
            message="Inventory item deleted successfully"
        )

    except Exception as e:

        db.session.rollback()

        return api_response(
            success=False,
            message="Failed to delete inventory item",
            errors={
                'server': str(e)
            },
            status_code=500
        )