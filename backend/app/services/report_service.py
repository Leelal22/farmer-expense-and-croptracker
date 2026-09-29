import csv
import io
from app.models import Farm, Crop, Expense, Income
from sqlalchemy import func
from app.extensions import db
from app.utils.validators import parse_date

class ReportService:
    @staticmethod
    def get_crop_profitability_report(user_id, farm_id=None, crop_id=None, format_type='json'):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if farm_id:
            farm_ids = [f for f in farm_ids if f == int(farm_id)]

        if not farm_ids:
            return [] if format_type == 'json' else "", None, 200

        query = Crop.query.filter(Crop.farm_id.in_(farm_ids))
        if crop_id:
            query = query.filter(Crop.id == int(crop_id))

        crops = query.all()
        report_data = []

        for crop in crops:
            tot_exp = float(db.session.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.crop_id == crop.id).scalar())
            tot_inc = float(db.session.query(func.coalesce(func.sum(Income.total_amount), 0)).filter(Income.crop_id == crop.id).scalar())
            profit = tot_inc - tot_exp
            roi = round(((tot_inc - tot_exp) / tot_exp * 100), 2) if tot_exp > 0 else (100.0 if tot_inc > 0 else 0.0)

            report_data.append({
                'crop': crop.crop_name,
                'variety': crop.crop_variety or '',
                'farm': crop.farm.farm_name,
                'season': crop.season or '',
                'status': crop.status,
                'expense': round(tot_exp, 2),
                'income': round(tot_inc, 2),
                'profit': round(profit, 2),
                'roi': roi
            })

        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=['crop', 'variety', 'farm', 'season', 'status', 'expense', 'income', 'profit', 'roi'])
            writer.writeheader()
            writer.writerows(report_data)
            return output.getvalue(), None, 200

        return report_data, None, 200

    @staticmethod
    def get_expense_report(user_id, farm_id=None, crop_id=None, category=None, start_date=None, end_date=None, format_type='json'):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if farm_id:
            farm_ids = [f for f in farm_ids if f == int(farm_id)]

        if not farm_ids:
            return [] if format_type == 'json' else "", None, 200

        crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
        if crop_id:
            crop_ids = [c for c in crop_ids if c == int(crop_id)]

        if not crop_ids:
            return [] if format_type == 'json' else "", None, 200

        query = Expense.query.filter(Expense.crop_id.in_(crop_ids))

        if category:
            query = query.filter(Expense.category == category)

        s_date = parse_date(start_date)
        if s_date:
            query = query.filter(Expense.expense_date >= s_date)

        e_date = parse_date(end_date)
        if e_date:
            query = query.filter(Expense.expense_date <= e_date)

        expenses = query.order_by(Expense.expense_date.desc()).all()
        report_data = [exp.to_dict() for exp in expenses]

        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=[
                'id', 'expense_date', 'farm_name', 'crop_name', 'category', 'description', 'amount', 'vendor', 'payment_method'
            ])
            writer.writeheader()
            for exp in report_data:
                writer.writerow({
                    'id': exp['id'],
                    'expense_date': exp['expense_date'],
                    'farm_name': exp['farm_name'],
                    'crop_name': exp['crop_name'],
                    'category': exp['category'],
                    'description': exp['description'] or '',
                    'amount': exp['amount'],
                    'vendor': exp['vendor'] or '',
                    'payment_method': exp['payment_method']
                })
            return output.getvalue(), None, 200

        return report_data, None, 200

    @staticmethod
    def get_income_report(user_id, farm_id=None, crop_id=None, start_date=None, end_date=None, format_type='json'):
        user_farms = Farm.query.filter_by(user_id=user_id).all()
        farm_ids = [f.id for f in user_farms]
        if farm_id:
            farm_ids = [f for f in farm_ids if f == int(farm_id)]

        if not farm_ids:
            return [] if format_type == 'json' else "", None, 200

        crop_ids = [c.id for c in Crop.query.filter(Crop.farm_id.in_(farm_ids)).all()]
        if crop_id:
            crop_ids = [c for c in crop_ids if c == int(crop_id)]

        if not crop_ids:
            return [] if format_type == 'json' else "", None, 200

        query = Income.query.filter(Income.crop_id.in_(crop_ids))

        s_date = parse_date(start_date)
        if s_date:
            query = query.filter(Income.sale_date >= s_date)

        e_date = parse_date(end_date)
        if e_date:
            query = query.filter(Income.sale_date <= e_date)

        incomes = query.order_by(Income.sale_date.desc()).all()
        report_data = [inc.to_dict() for inc in incomes]

        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=[
                'id', 'sale_date', 'farm_name', 'crop_name', 'buyer_name', 'quantity', 'unit', 'price_per_unit', 'total_amount', 'payment_status'
            ])
            writer.writeheader()
            for inc in report_data:
                writer.writerow({
                    'id': inc['id'],
                    'sale_date': inc['sale_date'],
                    'farm_name': inc['farm_name'],
                    'crop_name': inc['crop_name'],
                    'buyer_name': inc['buyer_name'] or '',
                    'quantity': inc['quantity'],
                    'unit': inc['unit'] or '',
                    'price_per_unit': inc['price_per_unit'],
                    'total_amount': inc['total_amount'],
                    'payment_status': inc['payment_status']
                })
            return output.getvalue(), None, 200

        return report_data, None, 200

    @staticmethod
    def get_farm_performance_report(user_id, format_type='json'):
        farms = Farm.query.filter_by(user_id=user_id).all()
        report_data = []

        for farm in farms:
            crop_ids = [c.id for c in farm.crops.all()]
            tot_exp = 0.0
            tot_inc = 0.0

            if crop_ids:
                tot_exp = float(db.session.query(func.coalesce(func.sum(Expense.amount), 0)).filter(Expense.crop_id.in_(crop_ids)).scalar())
                tot_inc = float(db.session.query(func.coalesce(func.sum(Income.total_amount), 0)).filter(Income.crop_id.in_(crop_ids)).scalar())

            profit = tot_inc - tot_exp
            roi = round(((tot_inc - tot_exp) / tot_exp * 100), 2) if tot_exp > 0 else (100.0 if tot_inc > 0 else 0.0)

            report_data.append({
                'farm_id': farm.id,
                'farm_name': farm.farm_name,
                'location': farm.location or '',
                'total_area': float(farm.total_area) if farm.total_area else 0.0,
                'crop_count': len(crop_ids),
                'total_expense': round(tot_exp, 2),
                'total_income': round(tot_inc, 2),
                'profit': round(profit, 2),
                'roi': roi
            })

        if format_type == 'csv':
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=[
                'farm_id', 'farm_name', 'location', 'total_area', 'crop_count', 'total_expense', 'total_income', 'profit', 'roi'
            ])
            writer.writeheader()
            writer.writerows(report_data)
            return output.getvalue(), None, 200

        return report_data, None, 200
