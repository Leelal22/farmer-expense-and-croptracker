import React, { useEffect, useState } from 'react';
import { expenseService } from '../services/expenseService';
import { cropService } from '../services/cropService';
import ExpenseTable from '../components/ExpenseTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
import { FaPlus, FaFilter, FaMoneyBillWave } from 'react-icons/fa';

const EXPENSE_CATEGORIES = [
  'Seeds', 'Fertilizer', 'Pesticide', 'Labour', 'Irrigation',
  'Electricity', 'Fuel', 'Machinery', 'Equipment', 'Transportation',
  'Maintenance', 'Land Preparation', 'Harvesting', 'Storage', 'Other'
];

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [filterCrop, setFilterCrop] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVendor, setFilterVendor] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    crop_id: '',
    category: 'Seeds',
    description: '',
    amount: '',
    quantity: '',
    unit: 'bags',
    vendor: '',
    payment_method: 'Cash',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_number: '',
    notes: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchExpensesAndCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const cropsRes = await cropService.getCrops();
      if (cropsRes.success) setCrops(cropsRes.data);

      const params = {};
      if (filterCrop) params.crop_id = filterCrop;
      if (filterCategory) params.category = filterCategory;
      if (filterVendor) params.vendor = filterVendor;

      const expRes = await expenseService.getExpenses(params);
      if (expRes.success) {
        setExpenses(Array.isArray(expRes.data) ? expRes.data : expRes.data.items || []);
      }
    } catch (err) {
      setError('Failed to fetch expenses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpensesAndCrops();
  }, [filterCrop, filterCategory, filterVendor]);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormData({
      crop_id: crops.length > 0 ? crops[0].id : '',
      category: 'Seeds',
      description: '',
      amount: '',
      quantity: '',
      unit: 'bags',
      vendor: '',
      payment_method: 'UPI',
      expense_date: new Date().toISOString().split('T')[0],
      receipt_number: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (expense) => {
    setEditingExpense(expense);
    setFormData({
      crop_id: expense.crop_id,
      category: expense.category,
      description: expense.description || '',
      amount: expense.amount,
      quantity: expense.quantity || '',
      unit: expense.unit || 'bags',
      vendor: expense.vendor || '',
      payment_method: expense.payment_method || 'Cash',
      expense_date: expense.expense_date || '',
      receipt_number: expense.receipt_number || '',
      notes: expense.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Expense amount must be greater than zero.');
      return;
    }

    try {
      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, formData);
        setToastMsg('Expense updated successfully.');
      } else {
        await expenseService.createExpense(formData);
        setToastMsg('Expense recorded successfully.');
      }
      setIsModalOpen(false);
      fetchExpensesAndCrops();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await expenseService.deleteExpense(deleteId);
      setToastMsg('Expense deleted successfully.');
      setDeleteId(null);
      fetchExpensesAndCrops();
    } catch (err) {
      alert('Failed to delete expense.');
    }
  };

  const totalExpenseSum = expenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  if (loading) return <LoadingSpinner text="Loading expense logs..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchExpensesAndCrops} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Expense Tracking
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Record seeds, fertilizers, labour, pesticides & machinery expenses
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" disabled={crops.length === 0}>
          <FaPlus /> Add New Expense
        </button>
      </div>

      {/* Summary Banner & Filters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--danger-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Filtered Expenses
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--danger-color)', margin: '0.25rem 0' }}>
            ₹{totalExpenseSum.toLocaleString()}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{expenses.length} Records Found</span>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <FaFilter /> Filter By:
          </div>
          <select className="form-select" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>{c.crop_name} ({c.farm_name})</option>
            ))}
          </select>
          <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ width: '160px' }}>
            <option value="">All Categories</option>
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <input
            type="text"
            className="form-input"
            placeholder="Search vendor..."
            value={filterVendor}
            onChange={(e) => setFilterVendor(e.target.value)}
            style={{ width: '160px' }}
          />
        </div>
      </div>

      <ExpenseTable
        expenses={expenses}
        onEdit={handleOpenEditModal}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record Farming Expense'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Crop *</label>
            <select
              className="form-select"
              value={formData.crop_id}
              onChange={(e) => setFormData({ ...formData, crop_id: e.target.value })}
              required
            >
              {crops.map((c) => (
                <option key={c.id} value={c.id}>{c.crop_name} - {c.farm_name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expense Category *</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="e.g. 8500"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. DAP 10 bags purchased for sowing"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="10"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <input
                type="text"
                className="form-input"
                placeholder="bags / kg / liters"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Vendor Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="ABC Fertilizers"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Expense Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingExpense ? 'Update Expense' : 'Save Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Expense Record?"
        message="Are you sure you want to delete this expense entry?"
      />
    </div>
  );
};

export default Expenses;
