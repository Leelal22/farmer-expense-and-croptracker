import React from 'react';
import { FaCalendarAlt, FaCheckCircle, FaExclamationTriangle, FaEdit, FaTrash } from 'react-icons/fa';

const ActivityCard = ({ activity, onStatusToggle, onEdit, onDelete }) => {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'HIGH': return <span className="badge badge-danger">High Priority</span>;
      case 'MEDIUM': return <span className="badge badge-warning">Medium</span>;
      case 'LOW': return <span className="badge badge-info">Low</span>;
      default: return <span className="badge">{priority}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED': return <span className="badge badge-success">Completed</span>;
      case 'OVERDUE': return <span className="badge badge-danger">Overdue</span>;
      case 'PENDING': return <span className="badge badge-warning">Pending</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  const isCompleted = activity.status === 'COMPLETED';

  return (
    <div className="card" style={{
      opacity: isCompleted ? 0.8 : 1,
      borderLeft: activity.status === 'OVERDUE' ? '4px solid var(--danger-color)' : '1px solid var(--border-color)'
    }}>
      <div className="card-header">
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: '700', textDecoration: isCompleted ? 'line-through' : 'none' }}>
            {activity.title}
          </h4>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Crop: {activity.crop_name} • {activity.farm_name}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {getPriorityBadge(activity.priority)}
          {getStatusBadge(activity.status)}
        </div>
      </div>

      {activity.description && (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: '0.5rem 0 1rem 0' }}>
          {activity.description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <FaCalendarAlt /> Scheduled: {activity.activity_date}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => onStatusToggle(activity, isCompleted ? 'PENDING' : 'COMPLETED')}
            className={`btn ${isCompleted ? 'btn-secondary' : 'btn-primary'} btn-sm`}
          >
            <FaCheckCircle /> {isCompleted ? 'Mark Pending' : 'Complete'}
          </button>
          <button onClick={() => onEdit(activity)} className="btn btn-secondary btn-sm">
            <FaEdit />
          </button>
          <button onClick={() => onDelete(activity.id)} className="btn btn-secondary btn-sm" style={{ color: 'var(--danger-color)' }}>
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
