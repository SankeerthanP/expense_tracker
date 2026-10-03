import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/expenses/add', label: 'Add Expense', icon: '➕' },
  { to: '/expenses', label: 'Expense History', icon: '📜' },
  { to: '/profile', label: 'Profile', icon: '👤' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { user, logout } = useAuth();

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && mobileOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onClose]);

  const handleCloseClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  // Automatically close sidebar whenever ANY nav item / brand link / logout is clicked
  const handleNavClick = () => {
    onClose();
  };

  return (
    <>
      <div
        className={`sidebar-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={handleCloseClick}
        aria-hidden="true"
      />
      <aside
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        style={!mobileOpen ? { transform: 'translateX(-100%)', visibility: 'hidden', pointerEvents: 'none' } : undefined}
      >
        <div className="sidebar-header">
          <Link
            to="/dashboard"
            className="sidebar-brand"
            onClick={handleNavClick}
            onTouchEnd={handleNavClick}
            title="Go to Dashboard"
          >
            <span className="brand-icon">₹</span>
            <div>
              <h2>Expense Tracker</h2>
              <p>Personal Finance</p>
            </div>
          </Link>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={handleCloseClick}
            onTouchEnd={handleCloseClick}
            aria-label="Close navigation"
            title="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={handleNavClick}
              onTouchEnd={handleNavClick}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <Link
              to="/profile"
              className="sidebar-user-info"
              onClick={handleNavClick}
              onTouchEnd={handleNavClick}
              title="View your profile"
            >
              <div className="sidebar-user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="sidebar-user-meta">
                <span className="sidebar-user-name">{user.name}</span>
                <span className="sidebar-user-email">{user.email}</span>
              </div>
            </Link>
          )}

          <button
            type="button"
            className="logout-btn"
            onClick={() => {
              handleNavClick();
              logout();
            }}
          >
            <span aria-hidden="true">🚪</span> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
