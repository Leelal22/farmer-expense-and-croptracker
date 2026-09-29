from datetime import datetime
from app.extensions import db

class Farm(db.Model):
    __tablename__ = 'farms'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    farm_name = db.Column(db.String(120), nullable=False)
    location = db.Column(db.String(200), nullable=True)
    village = db.Column(db.String(100), nullable=True)
    district = db.Column(db.String(100), nullable=True)
    state = db.Column(db.String(100), nullable=True)
    total_area = db.Column(db.Numeric(10, 2), nullable=False)
    area_unit = db.Column(db.String(20), default='acres')
    soil_type = db.Column(db.String(50), nullable=True)
    irrigation_type = db.Column(db.String(50), nullable=True)
    ownership_type = db.Column(db.String(50), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    crops = db.relationship('Crop', backref='farm', lazy='dynamic', cascade='all, delete-orphan')
    inventory_items = db.relationship('Inventory', backref='farm', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'farm_name': self.farm_name,
            'location': self.location,
            'village': self.village,
            'district': self.district,
            'state': self.state,
            'total_area': float(self.total_area) if self.total_area is not None else 0.0,
            'area_unit': self.area_unit,
            'soil_type': self.soil_type,
            'irrigation_type': self.irrigation_type,
            'ownership_type': self.ownership_type,
            'notes': self.notes,
            'crop_count': self.crops.count(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
