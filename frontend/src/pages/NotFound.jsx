import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div style={{ padding: '5rem 2rem', textAlign: 'center' }}>
      <span style={{ fontSize: '4rem' }}>🚜</span>
      <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginTop: '1rem' }}>404 - Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem 0' }}>
        The requested page does not exist or has been moved.
      </p>
      <Link to="/dashboard" className="btn btn-primary">
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
