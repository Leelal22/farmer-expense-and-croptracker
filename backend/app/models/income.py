from datetime import datetime
from app.extensions import db

class Income(db.Model):
    __tablename__ = 'incomes'

    id = db.Column(db.Integer, primary_key=True)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id', ondelete='CASCADE'), nullable=False, index=True)
    buyer_name = db.Column(db.String(100), nullable=True)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=True)
    price_per_unit = db.Column(db.Numeric(12, 2), nullable=False)
    total_amount = db.Column(db.Numeric(12, 2), nullable=False)
    sale_date = db.Column(db.Date, nullable=False, index=True)
    payment_status = db.Column(db.String(20), default='Paid') # Pending, Partial, Paid
    payment_method = db.Column(db.String(30), default='Cash')
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
            'buyer_name': self.buyer_name,
            'quantity': float(self.quantity) if self.quantity is not None else 0.0,
            'unit': self.unit,
            'price_per_unit': float(self.price_per_unit) if self.price_per_unit is not None else 0.0,
            'total_amount': float(self.total_amount) if self.total_amount is not None else 0.0,
            'sale_date': self.sale_date.isoformat() if self.sale_date else None,
            'payment_status': self.payment_status,
            'payment_method': self.payment_method,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
