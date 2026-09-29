import React from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';

const ExpenseTable = ({ expenses, onEdit, onDelete }) => {
  if (!expenses || expenses.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No expense records found.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Crop</th>
            <th>Category</th>
            <th>Description</th>
            <th>Vendor</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td style={{ fontWeight: '600' }}>{expense.expense_date}</td>
              <td>
                <div style={{ fontWeight: '600' }}>{expense.crop_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{expense.farm_name}</div>
              </td>
              <td><span className="badge badge-info">{expense.category}</span></td>
              <td>{expense.description || '—'}</td>
              <td>{expense.vendor || '—'}</td>
              <td style={{ fontWeight: '700', color: 'var(--danger-color)' }}>
                ₹{expense.amount?.toLocaleString()}
              </td>
              <td>{expense.payment_method || 'Cash'}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => onEdit(expense)} className="btn btn-secondary btn-sm" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => onDelete(expense.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }} title="Delete">
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

export default ExpenseTable;
