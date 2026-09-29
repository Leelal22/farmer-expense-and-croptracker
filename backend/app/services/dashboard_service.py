from app.models import Farm, Crop, Expense, Income, Activity, Inventory
from sqlalchemy import func, extract
from app.extensions import db

class DashboardService:
    @staticmethod
    def get_summary(user_id):
        # User Farms
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        total_farms = len(farm_ids)

        if not farm_ids:
            return {
                'total_farms': 0,
                'active_crops': 0,
                'total_expenses': 0.0,
                'total_income': 0.0,
                'total_profit': 0.0,
                'average_roi': 0.0,
                'pending_activities': 0,
                'low_stock_items': 0,
                'upcoming_activities': [],
                'low_stock_alerts': []
            }, None, 200

        # User Crops
        user_crops = Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()
        crop_ids = [c.id for c in user_crops]
        active_crops = sum(1 for c in user_crops if c.status in ['PLANNED', 'GROWING', 'HARVEST_READY'])

        # Total Expenses
        total_expenses = 0.0
        if crop_ids:
            total_expenses = db.session.query(func.coalesce(func.sum(Expense.amount), 0))\
                .filter(Expense.crop_id.in_(crop_ids)).scalar()
            total_expenses = float(total_expenses)

        # Total Income
        total_income = 0.0
        if crop_ids:
            total_income = db.session.query(func.coalesce(func.sum(Income.total_amount), 0))\
                .filter(Income.crop_id.in_(crop_ids)).scalar()
            total_income = float(total_income)

        total_profit = total_income - total_expenses

        # Average ROI
        if total_expenses > 0:
            avg_roi = round(((total_income - total_expenses) / total_expenses) * 100, 2)
        else:
            avg_roi = 100.0 if total_income > 0 else 0.0

        # Pending / Overdue Activities
        pending_activities_count = 0
        upcoming_activities = []
        if crop_ids:
            activities = Activity.query.filter(Activity.crop_id.in_(crop_ids)).all()
            pending_activities_count = sum(1 for a in activities if a.current_status in ['PENDING', 'OVERDUE'])
            upcoming_activities = [
                a.to_dict() for a in activities if a.current_status in ['PENDING', 'OVERDUE']
            ][:5]

        # Low Stock Inventory Items
        user_inventory = Inventory.query.filter(Inventory.farm_id.in_(farm_ids)).all()
        low_stock_alerts = [
            inv.to_dict() for inv in user_inventory if inv.stock_status in ['LOW_STOCK', 'OUT_OF_STOCK', 'EXPIRED']
        ]
        low_stock_count = len(low_stock_alerts)

        return {
            'total_farms': total_farms,
            'active_crops': active_crops,
            'total_expenses': round(total_expenses, 2),
            'total_income': round(total_income, 2),
            'total_profit': round(total_profit, 2),
            'average_roi': avg_roi,
            'pending_activities': pending_activities_count,
            'low_stock_items': low_stock_count,
            'upcoming_activities': upcoming_activities,
            'low_stock_alerts': low_stock_alerts[:5]
        }, None, 200

    @staticmethod
    def get_monthly_financials(user_id):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if not farm_ids:
            return [], None, 200

        user_crops = Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()
        crop_ids = [c.id for c in user_crops]
        if not crop_ids:
            return [], None, 200

        # Fetch Expenses grouped by Year-Month
        expense_rows = Expense.query.filter(Expense.crop_id.in_(crop_ids)).all()
        income_rows = Income.query.filter(Income.crop_id.in_(crop_ids)).all()

        monthly_map = {}

        for exp in expense_rows:
            if exp.expense_date:
                month_key = exp.expense_date.strftime('%Y-%m')
                if month_key not in monthly_map:
                    monthly_map[month_key] = {'month': month_key, 'expense': 0.0, 'income': 0.0, 'profit': 0.0}
                monthly_map[month_key]['expense'] += float(exp.amount)

        for inc in income_rows:
            if inc.sale_date:
                month_key = inc.sale_date.strftime('%Y-%m')
                if month_key not in monthly_map:
                    monthly_map[month_key] = {'month': month_key, 'expense': 0.0, 'income': 0.0, 'profit': 0.0}
                monthly_map[month_key]['income'] += float(inc.total_amount)

        result = []
        for month_key in sorted(monthly_map.keys()):
            data = monthly_map[month_key]
            data['expense'] = round(data['expense'], 2)
            data['income'] = round(data['income'], 2)
            data['profit'] = round(data['income'] - data['expense'], 2)
            result.append(data)

        return result, None, 200

    @staticmethod
    def get_crop_performance(user_id):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if not farm_ids:
            return [], None, 200

        crops = Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()
        performance = []

        for crop in crops:
            tot_exp = float(db.session.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.crop_id == crop.id).scalar())
            tot_inc = float(db.session.query(func.coalesce(func.sum(Income.total_amount), 0)).filter(Income.crop_id == crop.id).scalar())
            profit = tot_inc - tot_exp
            roi = round(((tot_inc - tot_exp) / tot_exp * 100), 2) if tot_exp > 0 else (100.0 if tot_inc > 0 else 0.0)

            performance.append({
                'crop_id': crop.id,
                'crop_name': crop.crop_name,
                'farm_name': crop.farm.farm_name,
                'status': crop.status,
                'total_expense': round(tot_exp, 2),
                'total_income': round(tot_inc, 2),
                'profit': round(profit, 2),
                'roi': roi
            })

        return performance, None, 200

    @staticmethod
    def get_expense_categories(user_id):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if not farm_ids:
            return [], None, 200

        crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
        if not crop_ids:
            return [], None, 200

        cat_rows = db.session.query(
            Expense.category,
            func.sum(Expense.amount).label('total')
        ).filter(Expense.crop_id.in_(crop_ids)).group_by(Expense.category).all()

        return [{'category': cat, 'amount': round(float(tot), 2)} for cat, tot in cat_rows], None, 200

    @staticmethod
    def get_crop_status_distribution(user_id):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if not farm_ids:
            return [], None, 200

        status_rows = db.session.query(
            Crop.status,
            func.count(Crop.id).label('count')
        ).filter(Crop.farm_id.in_(farm_ids)).group_by(Crop.status).all()

        return [{'status': st, 'count': cnt} for st, cnt in status_rows], None, 200
