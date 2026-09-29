import React from 'react';
import Modal from './Modal';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = "Confirm Delete", message = "Are you sure you want to delete this item? This action cannot be undone." }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'var(--danger-bg)', color: 'var(--danger-color)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', margin: '0 auto 1rem auto'
        }}>
          <FaExclamationTriangle />
        </div>
        <p style={{ color: 'var(--text-main)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button onClick={onClose} className="btn btn-secondary" style={{ flex: 1 }}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn btn-danger" style={{ flex: 1 }}>
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
