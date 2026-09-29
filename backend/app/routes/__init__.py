from app.routes.auth_routes import auth_bp
from app.routes.farm_routes import farm_bp
from app.routes.crop_routes import crop_bp
from app.routes.expense_routes import expense_bp
from app.routes.income_routes import income_bp
from app.routes.harvest_routes import harvest_bp
from app.routes.activity_routes import activity_bp
from app.routes.inventory_routes import inventory_bp
from app.routes.dashboard_routes import dashboard_bp
from app.routes.report_routes import report_bp

all_blueprints = [
    auth_bp,
    farm_bp,
    crop_bp,
    expense_bp,
    income_bp,
    harvest_bp,
    activity_bp,
    inventory_bp,
    dashboard_bp,
    report_bp
]
