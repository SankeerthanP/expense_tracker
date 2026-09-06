import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth > 1024;
    }
    return false;
  });

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
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
            <h1 className="topbar-title">Personal Expense Tracker</h1>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

