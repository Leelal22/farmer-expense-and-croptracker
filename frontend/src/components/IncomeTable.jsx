import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const IncomeTable = ({ incomes, onEdit, onDelete }) => {
  if (!incomes || incomes.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No crop sale income records found.
      </div>
    );
  }

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return <span className="badge badge-success">Paid</span>;
      case 'Pending': return <span className="badge badge-danger">Pending</span>;
      case 'Partial': return <span className="badge badge-warning">Partial</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Crop / Farm</th>
            <th>Buyer</th>
            <th>Quantity Sold</th>
            <th>Price / Unit</th>
            <th>Total Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {incomes.map((income) => (
            <tr key={income.id}>
              <td style={{ fontWeight: '600' }}>{income.sale_date}</td>
              <td>
                <div style={{ fontWeight: '600' }}>{income.crop_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{income.farm_name}</div>
              </td>
              <td>{income.buyer_name || '—'}</td>
              <td>{income.quantity} {income.unit || 'units'}</td>
              <td>₹{income.price_per_unit?.toLocaleString()}</td>
              <td style={{ fontWeight: '700', color: 'var(--success-color)' }}>
                ₹{income.total_amount?.toLocaleString()}
              </td>
              <td>{getPaymentStatusBadge(income.payment_status)}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => onEdit(income)} className="btn btn-secondary btn-sm" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => onDelete(income.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }} title="Delete">
                    <FaTrash />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default IncomeTable;
