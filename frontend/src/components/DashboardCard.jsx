import React from 'react';

const DashboardCard = ({ title, value, icon, color = '#2e7d32', subtitle, trend }) => {
  return (
    <div className="card" style={{ borderLeft: `4px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
            {title}
          </p>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.25rem 0', color: 'var(--text-main)' }}>
            {value}
          </h3>
          {subtitle && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: `${color}15`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: color,
          fontSize: '1.4rem'
        }}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;
