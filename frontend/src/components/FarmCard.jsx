import React from 'react';
import { FaTree, FaMapMarkerAlt, FaGlobeAsia, FaEdit, FaTrash } from 'react-icons/fa';

const FarmCard = ({ farm, onEdit, onDelete }) => {
  const isProfitable = (farm.profit || 0) >= 0;

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: 'var(--primary-light)', color: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem'
          }}>
            <FaTree />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {farm.farm_name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <FaMapMarkerAlt style={{ fontSize: '0.75rem', marginRight: '4px' }} />
              {farm.village ? `${farm.village}, ${farm.district}` : farm.location || 'Location N/A'}
            </p>
          </div>
        </div>
        <span className="badge badge-info">{farm.ownership_type || 'Owned'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Total Area:</span>
          <div style={{ fontWeight: '700' }}>{farm.total_area} {farm.area_unit}</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Soil Type:</span>
          <div style={{ fontWeight: '600' }}>{farm.soil_type || 'N/A'}</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Irrigation:</span>
          <div style={{ fontWeight: '600' }}>{farm.irrigation_type || 'N/A'}</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Crops:</span>
          <div style={{ fontWeight: '600' }}>{farm.crop_count || 0} Crops</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expenses</div>
          <div style={{ fontWeight: '700', color: 'var(--danger-color)' }}>₹{farm.total_expenses?.toLocaleString() || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income</div>
          <div style={{ fontWeight: '700', color: 'var(--success-color)' }}>₹{farm.total_income?.toLocaleString() || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profit</div>
          <div style={{ fontWeight: '700', color: isProfitable ? 'var(--success-color)' : 'var(--danger-color)' }}>
            ₹{farm.profit?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onEdit(farm)} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          <FaEdit /> Edit Farm
        </button>
        <button onClick={() => onDelete(farm.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default FarmCard;
