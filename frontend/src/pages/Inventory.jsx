import React, { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { farmService } from '../services/farmService';
import InventoryTable from '../components/InventoryTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
import { FaPlus, FaBoxes, FaExclamationTriangle, FaFilter } from 'react-icons/fa';

const INVENTORY_CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Tools', 'Equipment', 'Other'];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [filterFarm, setFilterFarm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    farm_id: '',
    item_name: '',
    category: 'Fertilizers',
    quantity: '',
    unit: 'bags',
    minimum_stock: '5',
    purchase_price: '',
    supplier: '',
    purchase_date: '',
    expiry_date: '',
    notes: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchInventoryAndFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const farmsRes = await farmService.getFarms();
      if (farmsRes.success) setFarms(farmsRes.data);

      const params = {};
      if (filterFarm) params.farm_id = filterFarm;
      if (filterCategory) params.category = filterCategory;
      if (filterStatus) params.stock_status = filterStatus;

      const invRes = await inventoryService.getInventory(params);
      if (invRes.success) setItems(invRes.data);
    } catch (err) {
      setError('Failed to fetch farm inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryAndFarms();
  }, [filterFarm, filterCategory, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      farm_id: farms.length > 0 ? farms[0].id : '',
      item_name: '',
      category: 'Fertilizers',
      quantity: '',
      unit: 'bags',
      minimum_stock: '5',
      purchase_price: '',
      supplier: '',
      purchase_date: new Date().toISOString().split('T')[0],
      expiry_date: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      farm_id: item.farm_id,
      item_name: item.item_name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit || 'bags',
      minimum_stock: item.minimum_stock,
      purchase_price: item.purchase_price || '',
      supplier: item.supplier || '',
      purchase_date: item.purchase_date || '',
      expiry_date: item.expiry_date || '',
      notes: item.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_name) {
      alert('Item name is required.');
      return;
    }

    try {
      if (editingItem) {
        await inventoryService.updateInventoryItem(editingItem.id, formData);
        setToastMsg('Inventory item updated successfully.');
      } else {
        await inventoryService.createInventoryItem(formData);
        setToastMsg('Inventory item added successfully.');
      }
      setIsModalOpen(false);
      fetchInventoryAndFarms();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await inventoryService.deleteInventoryItem(deleteId);
      setToastMsg('Inventory item deleted.');
      setDeleteId(null);
      fetchInventoryAndFarms();
    } catch (err) {
      alert('Failed to delete inventory item.');
    }
  };

  // Alert Counts
  const lowStockCount = items.filter(i => i.stock_status === 'LOW_STOCK').length;
  const outOfStockCount = items.filter(i => i.stock_status === 'OUT_OF_STOCK').length;
  const expiredCount = items.filter(i => i.stock_status === 'EXPIRED').length;

  if (loading) return <LoadingSpinner text="Loading farm inventory..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchInventoryAndFarms} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Agricultural Material Inventory
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track seeds, fertilizers, pesticides, tools & minimum stock thresholds
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" disabled={farms.length === 0}>
          <FaPlus /> Add Inventory Item
        </button>
      </div>

      {/* Stock Alerts Overview Cards */}
      <div className="dashboard-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--info-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Items
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', margin: '0.25rem 0' }}>{items.length}</h3>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--warning-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Low Stock Alerts
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--warning-color)', margin: '0.25rem 0' }}>{lowStockCount}</h3>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Out of Stock
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--danger-color)', margin: '0.25rem 0' }}>{outOfStockCount}</h3>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Expired Stock
          </span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--danger-color)', margin: '0.25rem 0' }}>{expiredCount}</h3>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <FaFilter /> Filter By:
          </div>
          <select className="form-select" value={filterFarm} onChange={(e) => setFilterFarm(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>
          <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: '160px' }}>
            <option value="">All Categories</option>
            {INVENTORY_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Stock Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out of Stock</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </div>
      </div>

      <InventoryTable
        items={items}
        onEdit={handleOpenEditModal}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Add / Edit Inventory Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Inventory Item' : 'Add Material to Inventory'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Farm Location *</label>
            <select
              className="form-select"
              value={formData.farm_id}
              onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
              required
            >
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.farm_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Item Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Urea Fertilizer / Seeds"
                value={formData.item_name}
                onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {INVENTORY_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Current Quantity *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-input"
                placeholder="bags / bottles / units"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Min Stock Threshold</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="5"
                value={formData.minimum_stock}
                onChange={(e) => setFormData({ ...formData, minimum_stock: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Supplier Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Guntur Agri Depot"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Purchase Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.purchase_date}
                onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expiry_date}
                onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingItem ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Inventory Item?"
        message="Are you sure you want to remove this item from inventory?"
      />
    </div>
  );
};

export default Inventory;
