from datetime import datetime
from app.extensions import db

class Crop(db.Model):
    __tablename__ = 'crops'

    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    crop_name = db.Column(db.String(100), nullable=False)
    crop_variety = db.Column(db.String(100), nullable=True)
    season = db.Column(db.String(50), nullable=True)
    sowing_date = db.Column(db.Date, nullable=True)
    expected_harvest_date = db.Column(db.Date, nullable=True)
    actual_harvest_date = db.Column(db.Date, nullable=True)
    area = db.Column(db.Numeric(10, 2), nullable=True)
    area_unit = db.Column(db.String(20), default='acres')
    seed_quantity = db.Column(db.Numeric(10, 2), nullable=True)
    seed_unit = db.Column(db.String(20), nullable=True)
    expected_yield = db.Column(db.Numeric(10, 2), nullable=True)
    yield_unit = db.Column(db.String(20), nullable=True)
    expected_price = db.Column(db.Numeric(10, 2), nullable=True)
    status = db.Column(db.String(30), default='PLANNED', index=True) # PLANNED, GROWING, HARVEST_READY, HARVESTED, FAILED
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    expenses = db.relationship('Expense', backref='crop', lazy='dynamic', cascade='all, delete-orphan')
    incomes = db.relationship('Income', backref='crop', lazy='dynamic', cascade='all, delete-orphan')
    harvests = db.relationship('Harvest', backref='crop', lazy='dynamic', cascade='all, delete-orphan')
    activities = db.relationship('Activity', backref='crop', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'farm_name': self.farm.farm_name if self.farm else None,
            'crop_name': self.crop_name,
            'crop_variety': self.crop_variety,
            'season': self.season,
            'sowing_date': self.sowing_date.isoformat() if self.sowing_date else None,
            'expected_harvest_date': self.expected_harvest_date.isoformat() if self.expected_harvest_date else None,
            'actual_harvest_date': self.actual_harvest_date.isoformat() if self.actual_harvest_date else None,
            'area': float(self.area) if self.area is not None else 0.0,
            'area_unit': self.area_unit,
            'seed_quantity': float(self.seed_quantity) if self.seed_quantity is not None else None,
            'seed_unit': self.seed_unit,
            'expected_yield': float(self.expected_yield) if self.expected_yield is not None else None,
            'yield_unit': self.yield_unit,
            'expected_price': float(self.expected_price) if self.expected_price is not None else None,
            'status': self.status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
