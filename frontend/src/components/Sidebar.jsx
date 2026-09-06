import { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses/add', label: 'Add Expense' },
  { to: '/expenses', label: 'Expense History' },
  { to: '/profile', label: 'Profile' },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const { logout } = useAuth();

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
          <div className="sidebar-brand">
            <span className="brand-icon">₹</span>
            <div>
              <h2>Expense Tracker</h2>
              <p>Personal Finance</p>
            </div>
          </div>
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
              onClick={() => {
                if (window.innerWidth <= 1024) {
                  onClose();
                }
              }}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button type="button" className="logout-btn" onClick={logout}>
          Logout
        </button>
      </aside>
    </>
  );
}

