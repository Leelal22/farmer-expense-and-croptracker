from app.models import Crop, Expense, Income, Farm
from sqlalchemy import func
from app.extensions import db

class ProfitabilityService:
    @staticmethod
    def get_crop_profitability(crop_id, user_id):
        crop = Crop.query.join(Farm).filter(Crop.id == crop_id, Farm.user_id == user_id).first()
        if not crop:
            return None, {'message': 'Crop not found or unauthorized'}, 404

        # Calculate Total Expenses
        total_expense = db.session.query(func.coalesce(func.sum(Expense.amount), 0))\
            .filter(Expense.crop_id == crop_id).scalar()
        total_expense = float(total_expense)

        # Calculate Total Income
        total_income = db.session.query(func.coalesce(func.sum(Income.total_amount), 0))\
            .filter(Income.crop_id == crop_id).scalar()
        total_income = float(total_income)

        profit = total_income - total_expense

        # ROI Calculation (Handle zero expense safely)
        if total_expense > 0:
            roi = round(((total_income - total_expense) / total_expense) * 100, 2)
        else:
            roi = 100.0 if total_income > 0 else 0.0

        # Expense Breakdown by Category
        expenses_by_cat = db.session.query(
            Expense.category,
            func.sum(Expense.amount).label('total')
        ).filter(Expense.crop_id == crop_id).group_by(Expense.category).all()

        expense_breakdown = [
            {'category': cat, 'amount': float(tot)}
            for cat, tot in expenses_by_cat
        ]

        # Recent Incomes
        incomes = [inc.to_dict() for inc in crop.incomes.order_by(Income.sale_date.desc()).all()]

        return {
            'crop_id': crop.id,
            'crop_name': crop.crop_name,
            'crop_variety': crop.crop_variety,
            'farm_id': crop.farm_id,
            'farm_name': crop.farm.farm_name,
            'status': crop.status,
            'area': float(crop.area) if crop.area else 0.0,
            'area_unit': crop.area_unit,
            'sowing_date': crop.sowing_date.isoformat() if crop.sowing_date else None,
            'expected_harvest_date': crop.expected_harvest_date.isoformat() if crop.expected_harvest_date else None,
            'total_expense': round(total_expense, 2),
            'total_income': round(total_income, 2),
            'profit': round(profit, 2),
            'roi': roi,
            'is_profitable': profit >= 0,
            'expense_breakdown': expense_breakdown,
            'incomes': incomes
        }, None, 200
