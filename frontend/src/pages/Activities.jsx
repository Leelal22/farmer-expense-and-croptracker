import React, { useEffect, useState } from 'react';
import { activityService } from '../services/activityService';
import { cropService } from '../services/cropService';
import ActivityCard from '../components/ActivityCard';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Toast from '../components/Toast';
import { FaPlus, FaFilter, FaTasks } from 'react-icons/fa';

const ACTIVITY_TYPES = [
  'Land Preparation', 'Sowing', 'Irrigation', 'Fertilizer Application',
  'Pesticide Spraying', 'Weeding', 'Inspection', 'Machinery Maintenance',
  'Harvesting', 'Transportation', 'Other'
];

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Filters
  const [filterCrop, setFilterCrop] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    crop_id: '',
    title: 'Fertilizer Application',
    description: '',
    activity_date: new Date().toISOString().split('T')[0],
    priority: 'MEDIUM',
    status: 'PENDING'
  });

  const [deleteId, setDeleteId] = useState(null);

  const fetchActivitiesAndCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const cropsRes = await cropService.getCrops();
      if (cropsRes.success) setCrops(cropsRes.data);

      const params = {};
      if (filterCrop) params.crop_id = filterCrop;
      if (filterStatus) params.status = filterStatus;
      if (filterPriority) params.priority = filterPriority;

      const actRes = await activityService.getActivities(params);
      if (actRes.success) setActivities(actRes.data);
    } catch (err) {
      setError('Failed to fetch scheduled activities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivitiesAndCrops();
  }, [filterCrop, filterStatus, filterPriority]);

  const handleOpenAddModal = () => {
    setEditingActivity(null);
    setFormData({
      crop_id: crops.length > 0 ? crops[0].id : '',
      title: 'Fertilizer Application',
      description: '',
      activity_date: new Date().toISOString().split('T')[0],
      priority: 'MEDIUM',
      status: 'PENDING'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (act) => {
    setEditingActivity(act);
    setFormData({
      crop_id: act.crop_id,
      title: act.title,
      description: act.description || '',
      activity_date: act.activity_date || '',
      priority: act.priority || 'MEDIUM',
      status: act.stored_status || act.status || 'PENDING'
    });
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (act, newStatus) => {
    try {
      await activityService.updateActivity(act.id, { status: newStatus });
      setToastMsg(`Activity marked as ${newStatus.toLowerCase()}.`);
      fetchActivitiesAndCrops();
    } catch (err) {
      alert('Failed to update activity status.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title) {
      alert('Activity title is required.');
      return;
    }

    try {
      if (editingActivity) {
        await activityService.updateActivity(editingActivity.id, formData);
        setToastMsg('Activity updated successfully.');
      } else {
        await activityService.createActivity(formData);
        setToastMsg('Activity scheduled successfully.');
      }
      setIsModalOpen(false);
      fetchActivitiesAndCrops();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await activityService.deleteActivity(deleteId);
      setToastMsg('Activity deleted.');
      setDeleteId(null);
      fetchActivitiesAndCrops();
    } catch (err) {
      alert('Failed to delete activity.');
    }
  };

  if (loading) return <LoadingSpinner text="Loading farming activity calendar..." />;
  if (error) return <ErrorMessage message={error} onRetry={fetchActivitiesAndCrops} />;

  return (
    <div>
      <Toast message={toastMsg} type="success" onClose={() => setToastMsg('')} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-main)' }}>
            Farming Activities & Tasks
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Schedule and track land prep, spraying, irrigation & weeding tasks
          </p>
        </div>
        <button onClick={handleOpenAddModal} className="btn btn-primary" disabled={crops.length === 0}>
          <FaPlus /> Schedule Activity
        </button>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>
            <FaFilter /> Filters:
          </div>
          <select className="form-select" value={filterCrop} onChange={(e) => setFilterCrop(e.target.value)} style={{ width: '180px' }}>
            <option value="">All Crops</option>
            {crops.map((c) => (
              <option key={c.id} value={c.id}>{c.crop_name} ({c.farm_name})</option>
            ))}
          </select>
          <select className="form-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '160px' }}>
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="OVERDUE">Overdue</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select className="form-select" value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ width: '150px' }}>
            <option value="">All Priorities</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          title="No scheduled activities"
          description="Schedule irrigation, spraying, and weeding activities to maintain your crop calendar."
          actionText={crops.length > 0 ? "+ Schedule First Activity" : null}
          onAction={crops.length > 0 ? handleOpenAddModal : null}
          icon="📅"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.25rem' }}>
          {activities.map((act) => (
            <ActivityCard
              key={act.id}
              activity={act}
              onStatusToggle={handleStatusToggle}
              onEdit={handleOpenEditModal}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Activity Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingActivity ? 'Edit Activity' : 'Schedule Farming Task'}
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Crop *</label>
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
            <label className="form-label">Task Title / Type *</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Apply Second Dose Nitrogen Fertilizer"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Work Notes</label>
            <textarea
              className="form-textarea"
              rows="3"
              placeholder="Enter task details, labor instructions or pesticide spray ratio..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label className="form-label">Scheduled Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.activity_date}
                onChange={(e) => setFormData({ ...formData, activity_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="form-select"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="PENDING">Pending</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingActivity ? 'Update Task' : 'Schedule Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Activity Task?"
        message="Are you sure you want to delete this scheduled task?"
      />
    </div>
  );
};

export default Activities;
