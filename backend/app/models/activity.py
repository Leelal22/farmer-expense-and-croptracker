from datetime import datetime, date
from app.extensions import db

class Activity(db.Model):
    __tablename__ = 'activities'

    id = db.Column(db.Integer, primary_key=True)
    crop_id = db.Column(db.Integer, db.ForeignKey('crops.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=True)
    activity_date = db.Column(db.Date, nullable=False, index=True)
    priority = db.Column(db.String(20), default='MEDIUM') # LOW, MEDIUM, HIGH
    status = db.Column(db.String(20), default='PENDING') # PENDING, COMPLETED, OVERDUE
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def current_status(self):
        """Dynamically evaluate OVERDUE if status is PENDING and activity_date is in the past."""
        if self.status == 'PENDING' and self.activity_date and self.activity_date < date.today():
            return 'OVERDUE'
        return self.status

    def to_dict(self):
        return {
            'id': self.id,
            'crop_id': self.crop_id,
            'crop_name': self.crop.crop_name if self.crop else None,
            'farm_id': self.crop.farm_id if self.crop else None,
            'farm_name': self.crop.farm.farm_name if (self.crop and self.crop.farm) else None,
            'title': self.title,
            'description': self.description,
            'activity_date': self.activity_date.isoformat() if self.activity_date else None,
            'priority': self.priority,
            'status': self.current_status,
            'stored_status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
