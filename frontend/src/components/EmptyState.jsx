import React from 'react';

const EmptyState = ({ title, description, actionText, onAction, icon = "🚜" }) => {
  return (
    <div style={{
      background: 'white',
      border: '1px dashed var(--border-color)',
      borderRadius: 'var(--radius-lg)',
      padding: '3.5rem 2rem',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      margin: '1.5rem 0'
    }}>
      <div style={{ fontSize: '3rem' }}>{icon}</div>
      <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-main)' }}>{title}</h3>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '400px' }}>
        {description}
      </p>
      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
