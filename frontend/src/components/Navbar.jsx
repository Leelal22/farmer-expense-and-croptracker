import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaSearch, FaBars, FaBell } from 'react-icons/fa';

const Navbar = ({ toggleMobileMenu }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar" style={{
      height: 'var(--header-height)',
      background: '#ffffff',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="mobile-toggle" onClick={toggleMobileMenu} style={{
          background: 'none',
          fontSize: '1.25rem',
          color: 'var(--text-main)',
          display: 'none'
        }}>
          <FaBars />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🚜</span>
          <span style={{ fontWeight: '700', fontSize: '1.15rem', color: 'var(--primary-color)' }}>
            FarmTrack
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <FaBell style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }} />
          <span style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '8px',
            height: '8px',
            background: 'var(--danger-color)',
            borderRadius: '50%'
          }}></span>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: 'none',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)'
            }}
          >
            <FaUserCircle style={{ fontSize: '1.3rem', color: 'var(--primary-color)' }} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>
                {user?.name || 'Farmer User'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {user?.village ? `${user.village}, ${user.district}` : 'Dashboard'}
              </div>
            </div>
          </button>

          {showProfileMenu && (
            <div style={{
              position: 'absolute',
              right: 0,
              top: '110%',
              background: 'white',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              width: '180px',
              zIndex: 200,
              padding: '0.5rem 0'
            }}>
              <Link
                to="/profile"
                onClick={() => setShowProfileMenu(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-main)'
                }}
              >
                <FaUserCircle /> My Profile
              </Link>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0.35rem 0' }} />
              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1rem',
                  fontSize: '0.875rem',
                  color: 'var(--danger-color)',
                  background: 'none',
                  textAlign: 'left'
                }}
              >
                <FaSignOutAlt /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
