import React from 'react';
import { Link } from 'react-router-dom';
import { FaSeedling, FaCalendarAlt, FaChartLine, FaEye, FaEdit, FaTrash } from 'react-icons/fa';

const CropCard = ({ crop, onEdit, onDelete }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'GROWING': return <span className="badge badge-success">Growing</span>;
      case 'PLANNED': return <span className="badge badge-info">Planned</span>;
      case 'HARVEST_READY': return <span className="badge badge-warning">Harvest Ready</span>;
      case 'HARVESTED': return <span className="badge badge-success">Harvested</span>;
      case 'FAILED': return <span className="badge badge-danger">Failed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const isProfitable = (crop.profit || 0) >= 0;

  return (
    <div className="card">
      <div className="card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: 'var(--primary-light)', color: 'var(--primary-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
          }}>
            <FaSeedling />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {crop.crop_name}
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {crop.farm_name} • {crop.crop_variety || 'Standard'}
            </p>
          </div>
        </div>
        {getStatusBadge(crop.status)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', margin: '1rem 0', background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Area:</span>
          <div style={{ fontWeight: '600' }}>{crop.area} {crop.area_unit}</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Season:</span>
          <div style={{ fontWeight: '600' }}>{crop.season || 'N/A'}</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Sowing Date:</span>
          <div style={{ fontWeight: '600' }}>{crop.sowing_date || 'N/A'}</div>
        </div>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Exp. Harvest:</span>
          <div style={{ fontWeight: '600' }}>{crop.expected_harvest_date || 'N/A'}</div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderTop: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Expenses</div>
          <div style={{ fontWeight: '700', color: 'var(--danger-color)' }}>₹{crop.total_expense?.toLocaleString() || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Income</div>
          <div style={{ fontWeight: '700', color: 'var(--success-color)' }}>₹{crop.total_income?.toLocaleString() || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Profit</div>
          <div style={{ fontWeight: '700', color: isProfitable ? 'var(--success-color)' : 'var(--danger-color)' }}>
            ₹{crop.profit?.toLocaleString() || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to={`/crops/${crop.id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
          <FaEye /> Details
        </Link>
        <button onClick={() => onEdit(crop)} className="btn btn-secondary btn-sm">
          <FaEdit />
        </button>
        <button onClick={() => onDelete(crop.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }}>
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

export default CropCard;
