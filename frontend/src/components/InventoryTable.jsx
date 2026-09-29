import React from 'react';
import { FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';

const InventoryTable = ({ items, onEdit, onDelete }) => {
  if (!items || items.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        No inventory items found.
      </div>
    );
  }

  const getStockStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE': return <span className="badge badge-success">Available</span>;
      case 'LOW_STOCK': return <span className="badge badge-warning">Low Stock</span>;
      case 'OUT_OF_STOCK': return <span className="badge badge-danger">Out of Stock</span>;
      case 'EXPIRED': return <span className="badge badge-danger">Expired</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Category</th>
            <th>Quantity in Stock</th>
            <th>Min Stock Threshold</th>
            <th>Supplier</th>
            <th>Expiry Date</th>
            <th>Stock Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div style={{ fontWeight: '700' }}>{item.item_name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.farm_name}</div>
              </td>
              <td><span className="badge badge-info">{item.category}</span></td>
              <td style={{ fontWeight: '700' }}>
                {item.quantity} {item.unit || ''}
              </td>
              <td>{item.minimum_stock} {item.unit || ''}</td>
              <td>{item.supplier || '—'}</td>
              <td>{item.expiry_date || 'N/A'}</td>
              <td>{getStockStatusBadge(item.stock_status)}</td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => onEdit(item)} className="btn btn-secondary btn-sm" title="Edit">
                    <FaEdit />
                  </button>
                  <button onClick={() => onDelete(item.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }} title="Delete">
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

export default InventoryTable;
