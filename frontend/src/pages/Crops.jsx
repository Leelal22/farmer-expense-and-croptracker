import React, { useEffect, useState } from 'react';
import { cropService } from '../services/cropService';
import { farmService } from '../services/farmService';
import CropCard from '../components/CropCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaFilter } from 'react-icons/fa';

const Crops = () => {
  const [crops, setCrops] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [selectedFarm, setSelectedFarm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [formData, setFormData] = useState({
    farm_id: '',
    crop_name: 'Rice',
    crop_variety: '',
    season: 'Kharif',
    sowing_date: '',
    expected_harvest_date: '',
    actual_harvest_date: '',
    area: '',
    area_unit: 'acres',
    seed_quantity: '',
    seed_unit: 'kg',
    expected_yield: '',
    yield_unit: 'quintals',
    expected_price: '',
    status: 'PLANNED',
    notes: ''
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchCropsAndFarms = async () => {
    setLoading(true);
    setError(null);
    try {
      const farmsRes = await farmService.getFarms();
      if (farmsRes.success) setFarms(farmsRes.data);

      const params = {};
      if (selectedFarm) params.farm_id = selectedFarm;
      if (selectedStatus) params.status = selectedStatus;
      if (selectedSeason) params.season = selectedSeason;

      const cropsRes = await cropService.getCrops(params);
      if (cropsRes.success) setCrops(cropsRes.data);
    } catch (err) {
      setError('Failed to fetch crops.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCropsAndFarms();
  }, [selectedFarm, selectedStatus, selectedSeason]);

  const handleOpenAddModal = () => {
    setEditingCrop(null);
    setFormData({
      farm_id: farms.length > 0 ? farms[0].id : '',
      crop_name: 'Rice',
      crop_variety: '',
      season: 'Kharif',
      sowing_date: new Date().toISOString().split('T')[0],
      expected_harvest_date: '',
      actual_harvest_date: '',
      area: '',
      area_unit: 'acres',
      seed_quantity: '',
      seed_unit: 'kg',
      expected_yield: '',
      yield_unit: 'quintals',
      expected_price: '',
      status: 'PLANNED',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (crop) => {
    setEditingCrop(crop);
    setFormData({
      farm_id: crop.farm_id,
      crop_name: crop.crop_name,
      crop_variety: crop.crop_variety || '',
      season: crop.season || 'Kharif',
      sowing_date: crop.sowing_date || '',
      expected_harvest_date: crop.expected_harvest_date || '',
      actual_harvest_date: crop.actual_harvest_date || '',
      area: crop.area || '',
      area_unit: crop.area_unit || 'acres',
      seed_quantity: crop.seed_quantity || '',
      seed_unit: crop.seed_unit || 'kg',
      expected_yield: crop.expected_yield || '',
      yield_unit: crop.yield_unit || 'quintals',
      expected_price: crop.expected_price || '',
      status: crop.status || 'PLANNED',
      notes: crop.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCrop) {
        await cropService.updateCrop(editingCrop.id, formData);
        setToastMsg('Crop details updated successfully.');
      } else {
        await cropService.createCrop(formData);
        setToastMsg('New crop created successfully.');
      }
      setIsModalOpen(false);
      fetchCropsAndFarms();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await cropService.deleteCrop(deleteId);
      setToastMsg('Crop deleted successfully.');
      setDeleteId(null);
      fetchCropsAndFarms();
    } catch (err) {
      alert('Failed to delete crop.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading crops..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchCropsAndFarms} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Crop Management
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Track crop cycles, sowing dates, expected yields & crop status
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" disabled={farms.length === 0}>
          <FaPlus /> Add New Crop
        </button>
      </div>

      {/* Filters Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <FaFilter /> Filters:
          </div>
          <select
            className="form-select"
            value={selectedFarm}
            onChange={(e) => setSelectedFarm(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Farms</option>
            {farms.map((f) => (
              <option key={f.id} value={f.id}>{f.farm_name}</option>
            ))}
          </select>

          <select
            className="form-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="GROWING">Growing</option>
            <option value="HARVEST_READY">Harvest Ready</option>
            <option value="HARVESTED">Harvested</option>
            <option value="FAILED">Failed</option>
          </select>

          <select
            className="form-select"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            style={{ width: '160px' }}
          >
            <option value="">All Seasons</option>
            <option value="Kharif">Kharif</option>
            <option value="Rabi">Rabi</option>
            <option value="Zaid">Zaid</option>
          </select>
        </div>
      </div>

      {crops.length === 0 ? (
        <EmptyState
          title="No crops recorded"
          description={farms.length === 0 ? "You need to create a farm first before adding crops." : "No crops match the selected filters."}
          actionText={farms.length > 0 ? "+ Add New Crop" : null}
          onAction={farms.length > 0 ? handleOpenAddModal : null}
          icon="🌱"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {crops.map((crop) => (
            <CropCard
              key={crop.id}
              crop={crop}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Crop Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCrop ? 'Edit Crop Details' : 'Add New Crop'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Select Farm *</label>
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
              <label className="form-label">Crop Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Rice, Chilli, Cotton"
                value={formData.crop_name}
                onChange={(e) => setFormData({ ...formData, crop_name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Crop Variety</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. BPT 5204"
                value={formData.crop_variety}
                onChange={(e) => setFormData({ ...formData, crop_variety: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Season</label>
              <select
                className="form-select"
                value={formData.season}
                onChange={(e) => setFormData({ ...formData, season: e.target.value })}
              >
                <option value="Kharif">Kharif</option>
                <option value="Rabi">Rabi</option>
                <option value="Zaid">Zaid</option>
                <option value="Year-round">Year-round</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PLANNED">Planned</option>
                <option value="GROWING">Growing</option>
                <option value="HARVEST_READY">Harvest Ready</option>
                <option value="HARVESTED">Harvested</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Area (acres)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                placeholder="5.0"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Sowing Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.sowing_date}
                onChange={(e) => setFormData({ ...formData, sowing_date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Expected Harvest Date</label>
              <input
                type="date"
                className="form-input"
                value={formData.expected_harvest_date}
                onChange={(e) => setFormData({ ...formData, expected_harvest_date: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingCrop ? 'Update Crop' : 'Create Crop'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Crop?"
        message="Are you sure you want to delete this crop? All expenses, incomes, and harvest logs belonging to this crop will be deleted."
      />
    </div>
  );
};

export default Crops;
