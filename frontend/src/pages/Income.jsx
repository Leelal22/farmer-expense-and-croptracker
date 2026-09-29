import React, { useEffect, useState } from 'react';
import { incomeService } from '../services/incomeService';
import { cropService } from '../services/cropService';
import IncomeTable from '../components/IncomeTable';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
import { FaPlus, FaCoins, FaFilter } from 'react-icons/fa';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [filterCrop, setFilterCrop] = useState('');
  const [filterBuyer, setFilterBuyer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    crop_id: '',
    buyer_name: '',
    quantity: '',
    unit: 'quintals',
    price_per_unit: '',
    sale_date: new Date().toISOString().split('T')[0],
    payment_status: 'Paid',
    payment_method: 'Bank Transfer',
    notes: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchIncomesAndCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const cropsRes = await cropService.getCrops();
      if (cropsRes.success) setCrops(cropsRes.data);

      const params = {};
      if (filterCrop) params.crop_id = filterCrop;
      if (filterBuyer) params.buyer = filterBuyer;
      if (filterStatus) params.payment_status = filterStatus;

      const incRes = await incomeService.getIncomes(params);
      if (incRes.success) setIncomes(incRes.data);
    } catch (err) {
      setError('Failed to fetch income sales records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomesAndCrops();
  }, [filterCrop, filterBuyer, filterStatus]);

  const handleOpenAddModal = () => {
    setEditingIncome(null);
    setFormData({
      crop_id: crops.length > 0 ? crops[0].id : '',
      buyer_name: '',
      quantity: '',
      unit: 'quintals',
      price_per_unit: '',
      sale_date: new Date().toISOString().split('T')[0],
      payment_status: 'Paid',
      payment_method: 'Bank Transfer',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (income) => {
    setEditingIncome(income);
    setFormData({
      crop_id: income.crop_id,
      buyer_name: income.buyer_name || '',
      quantity: income.quantity,
      unit: income.unit || 'quintals',
      price_per_unit: income.price_per_unit,
      sale_date: income.sale_date || '',
      payment_status: income.payment_status || 'Paid',
      payment_method: income.payment_method || 'Bank Transfer',
      notes: income.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      alert('Quantity must be greater than zero.');
      return;
    }

    try {
      if (editingIncome) {
        await incomeService.updateIncome(editingIncome.id, formData);
        setToastMsg('Income record updated successfully.');
      } else {
        await incomeService.createIncome(formData);
        setToastMsg('Income record created successfully.');
      }
      setIsModalOpen(false);
      fetchIncomesAndCrops();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await incomeService.deleteIncome(deleteId);
      setToastMsg('Income sales record deleted.');
      setDeleteId(null);
      fetchIncomesAndCrops();
    } catch (err) {
      alert('Failed to delete income record.');
    }
  };

  const calculatedTotal = (parseFloat(formData.quantity || 0) * parseFloat(formData.price_per_unit || 0)).toFixed(2);
  const totalIncomeSum = incomes.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);

  if (loading) return <LoadingSpinner text="Loading crop sales logs..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchIncomesAndCrops} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Income & Sales Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Record crop produce sales, buyer receipts & payment status
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" disabled={crops.length === 0}>
          <FaPlus /> Record New Sale
        </button>
      </div>

      {/* Financial Summary & Filter */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ borderLeft: '4px solid var(--success-color)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>
            Total Sales Income
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success-color)', margin: '0.25rem 0' }}>
            ₹{totalIncomeSum.toLocaleString()}
          </h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{incomes.length} Sales Transactions</span>
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
          <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '150px' }}>
            <option value="">All Payment Status</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Partial">Partial</option>
          </select>
          <input
            type="text"
            className="form-input"
            placeholder="Search buyer..."
            value={filterBuyer}
            onChange={(e) => setFilterBuyer(e.target.value)}
            style={{ width: '160px' }}
          />
        </div>
      </div>

      <IncomeTable
        incomes={incomes}
        onEdit={handleOpenEditModal}
        onDelete={(id) => setDeleteId(id)}
      />

      {/* Add / Edit Income Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingIncome ? 'Edit Income Record' : 'Record Crop Produce Sale'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Crop Sold *</label>
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

          <div className="form-group">
            <label className="form-label">Buyer Name / Trader</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Tenali Rice Traders / CCI"
              value={formData.buyer_name}
              onChange={(e) => setFormData({ ...formData, buyer_name: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Quantity Sold *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="25.0"
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
                placeholder="quintals / kg / bags"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Price Per Unit (₹) *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="2200"
                value={formData.price_per_unit}
                onChange={(e) => setFormData({ ...formData, price_per_unit: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{
            background: 'var(--primary-light)',
            padding: '0.75rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--primary-color)', fontWeight: '600' }}>Calculated Total Sales Amount:</span>
            <span style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)' }}>₹{calculatedTotal}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Sale Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.sale_date}
                onChange={(e) => setFormData({ ...formData, sale_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Status</label>
              <select
                className="form-select"
                value={formData.payment_status}
                onChange={(e) => setFormData({ ...formData, payment_status: e.target.value })}
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select
                className="form-select"
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingIncome ? 'Update Record' : 'Record Sale'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Income Record?"
        message="Are you sure you want to delete this sales transaction entry?"
      />
    </div>
  );
};

export default Income;
