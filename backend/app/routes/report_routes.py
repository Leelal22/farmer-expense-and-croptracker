from flask import Blueprint, request, Response
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.services.report_service import ReportService
from app.utils.validators import api_response

report_bp = Blueprint('reports', __name__, url_prefix='/api/reports')

@report_bp.route('/crop-profitability', methods=['GET'])
@jwt_required()
def crop_profitability_report():
    current_user_id = int(get_jwt_identity())
    farm_id = request.args.get('farm_id')
    crop_id = request.args.get('crop_id')
    fmt = request.args.get('format', 'json')

    result, errors, status_code = ReportService.get_crop_profitability_report(
        user_id=current_user_id, farm_id=farm_id, crop_id=crop_id, format_type=fmt
    )
    if fmt == 'csv':
        return Response(
            result,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=crop_profitability_report.csv'}
        )

    return api_response(success=True, message="Crop profitability report generated", data=result)

@report_bp.route('/expenses', methods=['GET'])
@jwt_required()
def expense_report():
    current_user_id = int(get_jwt_identity())
    farm_id = request.args.get('farm_id')
    crop_id = request.args.get('crop_id')
    category = request.args.get('category')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    fmt = request.args.get('format', 'json')

    result, errors, status_code = ReportService.get_expense_report(
        user_id=current_user_id, farm_id=farm_id, crop_id=crop_id, category=category,
        start_date=start_date, end_date=end_date, format_type=fmt
    )
    if fmt == 'csv':
        return Response(
            result,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=expense_report.csv'}
        )

    return api_response(success=True, message="Expense report generated", data=result)

@report_bp.route('/income', methods=['GET'])
@jwt_required()
def income_report():
    current_user_id = int(get_jwt_identity())
    farm_id = request.args.get('farm_id')
    crop_id = request.args.get('crop_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')
    fmt = request.args.get('format', 'json')

    result, errors, status_code = ReportService.get_income_report(
        user_id=current_user_id, farm_id=farm_id, crop_id=crop_id,
        start_date=start_date, end_date=end_date, format_type=fmt
    )
    if fmt == 'csv':
        return Response(
            result,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=income_report.csv'}
        )

    return api_response(success=True, message="Income report generated", data=result)

@report_bp.route('/farm-performance', methods=['GET'])
@jwt_required()
def farm_performance_report():
    current_user_id = int(get_jwt_identity())
    fmt = request.args.get('format', 'json')

    result, errors, status_code = ReportService.get_farm_performance_report(
        user_id=current_user_id, format_type=fmt
    )
    if fmt == 'csv':
        return Response(
            result,
            mimetype='text/csv',
            headers={'Content-Disposition': 'attachment; filename=farm_performance_report.csv'}
        )

    return api_response(success=True, message="Farm performance report generated", data=result)

@report_bp.route('/monthly-summary', methods=['GET'])
@jwt_required()
def monthly_summary_report():
    current_user_id = int(get_jwt_identity())
    # Monthly financial report delegate to dashboard monthly logic
    from app.services.dashboard_service import DashboardService
    result, errors, status_code = DashboardService.get_monthly_financials(current_user_id)
    return api_response(success=True, message="Monthly summary report generated", data=result)
