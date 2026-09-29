import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt, FaTree, FaSeedling, FaMoneyBillWave,
  FaCoins, FaTractor, FaTasks, FaBoxes, FaChartBar, FaUser, FaTimes
} from 'react-icons/fa';

const MobileNavigation = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { path: '/farms', label: 'Farms', icon: <FaTree /> },
    { path: '/crops', label: 'Crops', icon: <FaSeedling /> },
    { path: '/expenses', label: 'Expenses', icon: <FaMoneyBillWave /> },
    { path: '/income', label: 'Income', icon: <FaCoins /> },
    { path: '/harvests', label: 'Harvests', icon: <FaTractor /> },
    { path: '/activities', label: 'Activities', icon: <FaTasks /> },
    { path: '/inventory', label: 'Inventory', icon: <FaBoxes /> },
    { path: '/reports', label: 'Reports', icon: <FaChartBar /> },
    { path: '/profile', label: 'Profile', icon: <FaUser /> }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.5)',
      zIndex: 1000,
      display: 'flex'
    }}>
      <div style={{
        width: '280px',
        background: 'white',
        height: '100%',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🚜</span>
            <span style={{ fontWeight: '800', color: 'var(--primary-color)' }}>FarmTrack</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', fontSize: '1.2rem' }}>
            <FaTimes />
          </button>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: '8px',
                color: isActive ? 'var(--primary-color)' : 'var(--text-main)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                fontWeight: isActive ? '700' : '500'
              })}
            >
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
