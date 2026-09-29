from datetime import datetime, date
from app.extensions import db

class Inventory(db.Model):
    __tablename__ = 'inventory'

    id = db.Column(db.Integer, primary_key=True)
    farm_id = db.Column(db.Integer, db.ForeignKey('farms.id', ondelete='CASCADE'), nullable=False, index=True)
    item_name = db.Column(db.String(120), nullable=False)
    category = db.Column(db.String(50), nullable=False) # Seeds, Fertilizers, Pesticides, Tools, Equipment, Other
    quantity = db.Column(db.Numeric(10, 2), nullable=False)
    unit = db.Column(db.String(20), nullable=True)
    minimum_stock = db.Column(db.Numeric(10, 2), default=0)
    purchase_price = db.Column(db.Numeric(12, 2), nullable=True)
    supplier = db.Column(db.String(100), nullable=True)
    purchase_date = db.Column(db.Date, nullable=True)
    expiry_date = db.Column(db.Date, nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    @property
    def stock_status(self):
        """Dynamic stock status logic according to business rules."""
        qty = float(self.quantity) if self.quantity is not None else 0.0
        min_qty = float(self.minimum_stock) if self.minimum_stock is not None else 0.0

        if self.expiry_date and self.expiry_date < date.today():
            return 'EXPIRED'
        if qty == 0:
            return 'OUT_OF_STOCK'
        if qty <= min_qty:
            return 'LOW_STOCK'
        return 'AVAILABLE'

    def to_dict(self):
        return {
            'id': self.id,
            'farm_id': self.farm_id,
            'farm_name': self.farm.farm_name if self.farm else None,
            'item_name': self.item_name,
            'category': self.category,
            'quantity': float(self.quantity) if self.quantity is not None else 0.0,
            'unit': self.unit,
            'minimum_stock': float(self.minimum_stock) if self.minimum_stock is not None else 0.0,
            'purchase_price': float(self.purchase_price) if self.purchase_price is not None else None,
            'supplier': self.supplier,
            'purchase_date': self.purchase_date.isoformat() if self.purchase_date else None,
            'expiry_date': self.expiry_date.isoformat() if self.expiry_date else None,
            'stock_status': self.stock_status,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
