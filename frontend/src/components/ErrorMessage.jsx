import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div style={{
      background: 'var(--danger-bg)',
      border: '1px solid var(--danger-color)',
      borderRadius: 'var(--radius-md)',
      padding: '1.25rem',
      color: 'var(--danger-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      margin: '1rem 0'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <FaExclamationTriangle style={{ fontSize: '1.2rem' }} />
        <span style={{ fontWeight: '500', fontSize: '0.9rem' }}>{message || 'An error occurred while loading data.'}</span>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
