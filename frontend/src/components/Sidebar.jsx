import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaSeedling,
  FaTree,
  FaMoneyBillWave,
  FaCoins,
  FaTractor,
  FaTasks,
  FaBoxes,
  FaChartBar,
  FaUser,
  FaSignOutAlt
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/farms', label: 'Farms', icon: <FaTree /> },
    { path: '/crops', label: 'Crops', icon: <FaSeedling /> },
    { path: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave /> },
    { path: '/income', label: 'Income Sales', icon: <FaCoins /> },
    { path: '/harvests', label: 'Harvests', icon: <FaTractor /> },
    { path: '/activities', label: 'Activities', icon: <FaTasks /> },
    { path: '/inventory', label: 'Inventory', icon: <FaBoxes /> },
    { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> }
  ];

  return (
    <aside style={{
      width: 'var(--sidebar-width)',
      height: '100vh',
      background: '#ffffff',
      borderRight: '1px solid var(--border-color)',
      position: 'fixed',
      left: 0,
      top: 0,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 110,
      padding: '1.25rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.5rem 1.5rem 0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1rem' }}>
        <span style={{ fontSize: '2rem' }}>🚜</span>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--primary-color)', lineHeight: 1.2 }}>
            FarmTrack
          </h2>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
            Expense & Crop Analytics
          </p>
        </div>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.7rem 0.9rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.9rem',
              fontWeight: isActive ? '700' : '500',
              color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
              background: isActive ? 'var(--primary-light)' : 'transparent',
              transition: 'all 0.15s ease'
            })}
          >
            <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <button
          onClick={logout}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.9rem',
            borderRadius: 'var(--radius-md)',
            color: 'var(--danger-color)',
            background: 'var(--danger-bg)',
            fontWeight: '600',
            fontSize: '0.875rem'
          }}
        >
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
