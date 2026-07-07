import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { useAuth } from '../../auth/hooks/useAuth';
import styles from './MainLayout.module.scss';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  return (
    <div className={styles.appContainer}>
      {/* Offline Status Warning Bar */}
      {isOffline && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            backgroundColor: '#EA580C',
            color: '#FFFFFF',
            textAlign: 'center',
            padding: '6px 12px',
            fontSize: '11.5px',
            fontWeight: '600',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}
        >
          <span style={{ fontSize: '13px' }}>⚠️</span>
          <span>You are currently offline. Actions and database writes will be blocked until connection is restored.</span>
        </div>
      )}
      {/* Mobile Sidebar Overlay Backdrop */}
      {isSidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Navigation Sidebar (Desktop Panel / Mobile Overlay) */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Panel Content Container */}
      <div className={styles.appMain}>
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className={styles.appContent}>
          <Outlet />
        </main>

        {/* Mobile Navigation Bar */}
        <BottomNav />
      </div>

      {/* Global Logout Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Logout"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        }
      >
        <p>Are you sure you want to log out of MediaFlow? Any unsaved edits might be lost.</p>
      </Modal>
    </div>
  );
};

export default MainLayout;
