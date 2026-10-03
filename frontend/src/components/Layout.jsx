import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const { user } = useAuth();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 1024;
    }
    return false;
  });

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // CRITICAL FIX: Automatically close sidebar whenever any page/route changes!
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, sidebarOpen]);

  const handleClose = () => {
    setSidebarOpen(false);
  };

  const handleToggle = () => {
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <Sidebar mobileOpen={sidebarOpen} onClose={handleClose} />
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button
              type="button"
              className={`menu-toggle ${sidebarOpen ? 'is-active' : ''}`}
              onClick={handleToggle}
              aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
              title={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              <span className="menu-toggle-arrow">{sidebarOpen ? '‹' : '›'}</span>
              <span className="menu-toggle-text">Menu</span>
            </button>
            <Link to="/dashboard" className="topbar-brand-link">
              <span className="topbar-brand-icon">₹</span>
              <span className="topbar-title">Expense Tracker</span>
            </Link>
          </div>

          <div className="topbar-right">
            <Link to="/expenses/add" className="topbar-quick-add-btn" title="Add a new expense">
              <span className="btn-icon">➕</span>
              <span className="btn-text">Add Expense</span>
            </Link>

            {user && (
              <Link to="/profile" className="topbar-user-badge" title="View Profile">
                <div className="topbar-avatar">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="topbar-user-text">
                  <span className="user-greeting">Hi,</span>
                  <span className="user-firstname">{user.name.split(' ')[0]}</span>
                </div>
              </Link>
            )}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
