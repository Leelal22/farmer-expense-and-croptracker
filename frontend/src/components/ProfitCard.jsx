import React from 'react';
import { FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';

const ProfitCard = ({ cropName, farmName, totalExpense, totalIncome, profit, roi }) => {
  const isProfitable = profit >= 0;

  return (
    <div className="card" style={{
      background: isProfitable ? 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)' : 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)',
      borderLeft: `6px solid ${isProfitable ? 'var(--success-color)' : 'var(--danger-color)'}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>{cropName}</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{farmName}</p>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.4rem 0.85rem',
          borderRadius: '20px',
          fontWeight: '700',
          fontSize: '0.85rem',
          background: isProfitable ? 'var(--success-bg)' : 'var(--danger-bg)',
          color: isProfitable ? 'var(--success-color)' : 'var(--danger-color)'
        }}>
          {isProfitable ? <FaArrowUp /> : <FaArrowDown />} ROI: {roi}%
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', padding: '1rem 0', borderTop: '1px solid var(--border-color)' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Expense</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--danger-color)' }}>₹{totalExpense?.toLocaleString()}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Income</span>
          <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--success-color)' }}>₹{totalIncome?.toLocaleString()}</div>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Net {isProfitable ? 'Profit' : 'Loss'}</span>
          <div style={{ fontSize: '1.2rem', fontWeight: '800', color: isProfitable ? 'var(--success-color)' : 'var(--danger-color)' }}>
            ₹{profit?.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfitCard;
