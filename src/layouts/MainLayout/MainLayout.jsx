import React, { useState } from 'react';
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
  const { logout } = useAuth();
  const navigate = useNavigate();

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
