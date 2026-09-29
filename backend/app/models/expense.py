from datetime import datetime
from app.extensions import db

class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id', ondelete='CASCADE'), nullable=False, index=True)
    category = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.String(255), nullable=True)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=True)
    unit = db.Column(db.String(20), nullable=True)
    vendor = db.Column(db.String(100), nullable=True)
    payment_method = db.Column(db.String(30), default='Cash')
    expense_date = db.Column(db.Date, nullable=False, index=True)
    receipt_number = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'crop_id': self.crop_id,
            'crop_name': self.crop.crop_name if self.crop else None,
            'farm_id': self.crop.farm_id if self.crop else None,
            'farm_name': self.crop.farm.farm_name if (self.crop and self.crop.farm) else None,
            'category': self.category,
            'description': self.description,
            'amount': float(self.amount) if self.amount is not None else 0.0,
            'quantity': float(self.quantity) if self.quantity is not None else None,
            'unit': self.unit,
            'vendor': self.vendor,
            'payment_method': self.payment_method,
            'expense_date': self.expense_date.isoformat() if self.expense_date else None,
            'receipt_number': self.receipt_number,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
