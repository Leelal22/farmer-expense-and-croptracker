from flask import Blueprint
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.dashboard_service import DashboardService
from app.utils.validators import api_response

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    current_user_id = int(get_jwt_identity())
    result, errors, status_code = DashboardService.get_summary(current_user_id)
    if errors:
        return api_response(success=False, message="Failed to fetch dashboard summary", errors=errors, status_code=status_code)
    return api_response(success=True, message="Summary fetched", data=result)

@dashboard_bp.route('/monthly-financials', methods=['GET'])
@jwt_required()
def get_monthly_financials():
    current_user_id = int(get_jwt_identity())
    result, errors, status_code = DashboardService.get_monthly_financials(current_user_id)
    if errors:
        return api_response(success=False, message="Failed to fetch monthly financials", errors=errors, status_code=status_code)
    return api_response(success=True, message="Monthly financials fetched", data=result)

@dashboard_bp.route('/crop-performance', methods=['GET'])
@jwt_required()
def get_crop_performance():
    current_user_id = int(get_jwt_identity())
    result, errors, status_code = DashboardService.get_crop_performance(current_user_id)
    if errors:
        return api_response(success=False, message="Failed to fetch crop performance", errors=errors, status_code=status_code)
    return api_response(success=True, message="Crop performance fetched", data=result)

@dashboard_bp.route('/expense-categories', methods=['GET'])
@jwt_required()
def get_expense_categories():
    current_user_id = int(get_jwt_identity())
    result, errors, status_code = DashboardService.get_expense_categories(current_user_id)
    if errors:
        return api_response(success=False, message="Failed to fetch expense categories", errors=errors, status_code=status_code)
    return api_response(success=True, message="Expense categories fetched", data=result)

@dashboard_bp.route('/crop-status', methods=['GET'])
@jwt_required()
def get_crop_status():
    current_user_id = int(get_jwt_identity())
    result, errors, status_code = DashboardService.get_crop_status_distribution(current_user_id)
    if errors:
        return api_response(success=False, message="Failed to fetch crop status distribution", errors=errors, status_code=status_code)
    return api_response(success=True, message="Crop status distribution fetched", data=result)
