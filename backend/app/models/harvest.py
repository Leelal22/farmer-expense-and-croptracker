from datetime import datetime
from app.extensions import db

class Harvest(db.Model):
    __tablename__ = 'harvests'

    id = db.Column(db.Integer, primary_key=True)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id', ondelete='CASCADE'), nullable=False, index=True)
    harvest_date = db.Column(db.Date, nullable=False)
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=True)
    quality = db.Column(db.String(50), nullable=True)
    selling_price = db.Column(db.Numeric(12, 2), nullable=True)
    total_income = db.Column(db.Numeric(12, 2), nullable=True)
    storage_location = db.Column(db.String(100), nullable=True)
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
            'harvest_date': self.harvest_date.isoformat() if self.harvest_date else None,
            'quantity': float(self.quantity) if self.quantity is not None else 0.0,
            'unit': self.unit,
            'quality': self.quality,
            'selling_price': float(self.selling_price) if self.selling_price is not None else None,
            'total_income': float(self.total_income) if self.total_income is not None else None,
            'storage_location': self.storage_location,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
