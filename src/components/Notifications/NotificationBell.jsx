import React, { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import { NotificationService } from '../../services/notifications/notificationService';
import { useAuth } from '../../auth/hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';
import styles from './NotificationBell.module.scss';

const NotificationBell = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef(null);

  const loadUnreadCount = async () => {
    if (!user) return;
    try {
      const count = await NotificationService.getUnreadCount(user.id);
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUnreadCount();

    // Background heartbeat polling every 4 seconds to sync notifications badge
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 4000);

    // Hook listeners for dynamic mutations
    const handleUpdate = () => {
      loadUnreadCount();
    };
    window.addEventListener('notifications_updated', handleUpdate);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('notifications_updated', handleUpdate);
    };
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bellRef.current && !bellRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const displayCount = unreadCount > 99 ? '99+' : unreadCount;

  return (
    <div ref={bellRef} className={styles.bellContainer}>
      <button
        onClick={handleToggle}
        className={`${styles.bellBtn} ${isOpen ? styles.active : ''}`}
        aria-label="Toggle notifications center"
      >
        <Bell className={styles.bellIcon} />
        {unreadCount > 0 && (
          <span className={styles.badge}>{displayCount}</span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default NotificationBell;
