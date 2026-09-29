import React, { useEffect, useState } from 'react';
import { farmService } from '../services/farmService';
import FarmCard from '../components/FarmCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus } from 'react-icons/fa';

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFarm, setEditingFarm] = useState(null);
  const [formData, setFormData] = useState({
    farm_name: '',
    location: '',
    village: '',
    district: '',
    state: 'Andhra Pradesh',
    total_area: '',
    area_unit: 'acres',
    soil_type: 'Black Soil',
    irrigation_type: 'Borewell',
    ownership_type: 'Owned',
    notes: ''
  });

  // Delete State
  const [deleteId, setDeleteId] = useState(null);

  const fetchFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await farmService.getFarms();
      if (resp.success) {
        setFarms(resp.data);
      }
    } catch (err) {
      setError('Failed to fetch farms.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFarms();
  }, []);

  const handleOpenAddModal = () => {
    setEditingFarm(null);
    setFormData({
      farm_name: '',
      location: '',
      village: '',
      district: '',
      state: 'Andhra Pradesh',
      total_area: '',
      area_unit: 'acres',
      soil_type: 'Black Soil',
      irrigation_type: 'Borewell',
      ownership_type: 'Owned',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (farm) => {
    setEditingFarm(farm);
    setFormData({
      farm_name: farm.farm_name,
      location: farm.location || '',
      village: farm.village || '',
      district: farm.district || '',
      state: farm.state || '',
      total_area: farm.total_area,
      area_unit: farm.area_unit || 'acres',
      soil_type: farm.soil_type || 'Black Soil',
      irrigation_type: farm.irrigation_type || 'Borewell',
      ownership_type: farm.ownership_type || 'Owned',
      notes: farm.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFarm) {
        await farmService.updateFarm(editingFarm.id, formData);
        setToastMsg('Farm updated successfully.');
      } else {
        await farmService.createFarm(formData);
        setToastMsg('Farm created successfully.');
      }
      setIsModalOpen(false);
      fetchFarms();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await farmService.deleteFarm(deleteId);
      setToastMsg('Farm deleted successfully.');
      setDeleteId(null);
      fetchFarms();
    } catch (err) {
      alert('Failed to delete farm.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading your farms..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchFarms} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Farm Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage agricultural land holdings, soil profile & total acreage
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary">
          <FaPlus /> Add New Farm
        </button>
      </div>

      {farms.length === 0 ? (
        <EmptyState
          title="No farms registered yet"
          description="Create your first farm to start tracking crops, expenses, and agricultural production."
          actionText="+ Create First Farm"
          onAction={handleOpenAddModal}
          icon="🚜"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Farm Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFarm ? 'Edit Farm Details' : 'Register New Farm'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Farm Name *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Sri Lakshmi Farm"
              value={formData.farm_name}
              onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Total Area Size *</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="e.g. 8.5"
                value={formData.total_area}
                onChange={(e) => setFormData({ ...formData, total_area: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Area Unit</label>
              <select
                className="form-select"
                value={formData.area_unit}
                onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
              >
                <option value="acres">Acres</option>
                <option value="hectares">Hectares</option>
                <option value="cents">Cents</option>
                <option value="bigha">Bigha</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Soil Type</label>
              <select
                className="form-select"
                value={formData.soil_type}
                onChange={(e) => setFormData({ ...formData, soil_type: e.target.value })}
              >
                <option value="Black Soil">Black Soil</option>
                <option value="Red Soil">Red Soil</option>
                <option value="Alluvial Soil">Alluvial Soil</option>
                <option value="Sandy Soil">Sandy Soil</option>
                <option value="Clay Soil">Clay Soil</option>
                <option value="Loamy Soil">Loamy Soil</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Irrigation Type</label>
              <select
                className="form-select"
                value={formData.irrigation_type}
                onChange={(e) => setFormData({ ...formData, irrigation_type: e.target.value })}
              >
                <option value="Borewell">Borewell</option>
                <option value="Canal">Canal</option>
                <option value="Drip Irrigation">Drip Irrigation</option>
                <option value="Sprinkler">Sprinkler</option>
                <option value="Rainfed">Rainfed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Village</label>
              <input
                type="text"
                className="form-input"
                placeholder="Tenali"
                value={formData.village}
                onChange={(e) => setFormData({ ...formData, village: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">District</label>
              <input
                type="text"
                className="form-input"
                placeholder="Guntur"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                className="form-input"
                placeholder="Andhra Pradesh"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Ownership Type</label>
            <select
              className="form-select"
              value={formData.ownership_type}
              onChange={(e) => setFormData({ ...formData, ownership_type: e.target.value })}
            >
              <option value="Owned">Owned</option>
              <option value="Leased">Leased</option>
              <option value="Tenant">Tenant</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingFarm ? 'Update Farm' : 'Create Farm'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Farm?"
        message="Are you sure you want to delete this farm? All associated crops, expenses, and harvests will be permanently deleted."
      />
    </div>
  );
};

export default Farms;
