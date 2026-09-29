import React, { useEffect, useState } from 'react';
import { harvestService } from '../services/harvestService';
import { cropService } from '../services/cropService';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaTractor, FaEdit, FaTrash } from 'react-icons/fa';

const Harvests = () => {
  const [harvests, setHarvests] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHarvest, setEditingHarvest] = useState(null);
  const [formData, setFormData] = useState({
    crop_id: '',
    harvest_date: new Date().toISOString().split('T')[0],
    quantity: '',
    unit: 'quintals',
    quality: 'Grade A',
    selling_price: '',
    storage_location: '',
    notes: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchHarvestsAndCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const cropsRes = await cropService.getCrops();
      if (cropsRes.success) setCrops(cropsRes.data);

      const hRes = await harvestService.getHarvests();
      if (hRes.success) setHarvests(hRes.data);
    } catch (err) {
      setError('Failed to fetch harvest records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHarvestsAndCrops();
  }, []);

  const handleOpenAddModal = () => {
    setEditingHarvest(null);
    setFormData({
      crop_id: crops.length > 0 ? crops[0].id : '',
      harvest_date: new Date().toISOString().split('T')[0],
      quantity: '',
      unit: 'quintals',
      quality: 'Grade A',
      selling_price: '',
      storage_location: 'Farm Warehouse 1',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (harvest) => {
    setEditingHarvest(harvest);
    setFormData({
      crop_id: harvest.crop_id,
      harvest_date: harvest.harvest_date || '',
      quantity: harvest.quantity,
      unit: harvest.unit || 'quintals',
      quality: harvest.quality || 'Grade A',
      selling_price: harvest.selling_price || '',
      storage_location: harvest.storage_location || '',
      notes: harvest.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      alert('Harvest quantity must be greater than zero.');
      return;
    }

    try {
      if (editingHarvest) {
        await harvestService.updateHarvest(editingHarvest.id, formData);
        setToastMsg('Harvest details updated successfully.');
      } else {
        await harvestService.createHarvest(formData);
        setToastMsg('Harvest recorded successfully.');
      }
      setIsModalOpen(false);
      fetchHarvestsAndCrops();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await harvestService.deleteHarvest(deleteId);
      setToastMsg('Harvest record deleted.');
      setDeleteId(null);
      fetchHarvestsAndCrops();
    } catch (err) {
      alert('Failed to delete harvest record.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading harvest logs..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchHarvestsAndCrops} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Harvest Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Record harvest yields, quality grade, storage location & selling rates
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" disabled={crops.length === 0}>
          <FaPlus /> Record Harvest
        </button>
      </div>

      {harvests.length === 0 ? (
        <EmptyState
          title="No harvest records found"
          description="Log harvest produce output and storage details when your crops mature."
          actionText={crops.length > 0 ? "+ Record First Harvest" : null}
          onAction={crops.length > 0 ? handleOpenAddModal : null}
          icon="🌾"
        />
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Harvest Date</th>
                <th>Crop / Farm</th>
                <th>Harvested Quantity</th>
                <th>Quality Grade</th>
                <th>Selling Price / Unit</th>
                <th>Storage Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {harvests.map((harvest) => (
                <tr key={harvest.id}>
                  <td style={{ fontWeight: '600' }}>{harvest.harvest_date}</td>
                  <td>
                    <div style={{ fontWeight: '600' }}>{harvest.crop_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{harvest.farm_name}</div>
                  </td>
                  <td style={{ fontWeight: '700' }}>{harvest.quantity} {harvest.unit || 'quintals'}</td>
                  <td><span className="badge badge-info">{harvest.quality || 'Standard'}</span></td>
                  <td>{harvest.selling_price ? `₹${harvest.selling_price}` : '—'}</td>
                  <td>{harvest.storage_location || 'Warehouse'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleOpenEditModal(harvest)} className="btn btn-secondary btn-sm" title="Edit">
                        <FaEdit />
                      </button>
                      <button onClick={() => setDeleteId(harvest.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }} title="Delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingHarvest ? 'Edit Harvest Entry' : 'Record New Crop Harvest'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Harvested Crop *</label>
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
              <label className="form-label">Harvest Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.harvest_date}
                onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Harvested Quantity *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 25.0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
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
              <label className="form-label">Quality Grade</label>
              <input
                type="text"
                className="form-input"
                placeholder="Grade A / Premium"
                value={formData.quality}
                onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Selling Price / Unit (₹)</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                placeholder="2300"
                value={formData.selling_price}
                onChange={(e) => setFormData({ ...formData, selling_price: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Storage Yard / Warehouse Location</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Farm Warehouse Yard 1"
              value={formData.storage_location}
              onChange={(e) => setFormData({ ...formData, storage_location: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingHarvest ? 'Update Harvest' : 'Save Harvest'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Harvest Record?"
        message="Are you sure you want to delete this harvest record?"
      />
    </div>
  );
};

export default Harvests;
