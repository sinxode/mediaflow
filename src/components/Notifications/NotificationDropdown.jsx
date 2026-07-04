import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckSquare } from 'lucide-react';
import { NotificationService } from '../../services/notifications/notificationService';
import { useAuth } from '../../auth/hooks/useAuth';
import NotificationItem from './NotificationItem';
import NotificationSkeleton from './NotificationSkeleton';
import NotificationEmptyState from './NotificationEmptyState';
import styles from './NotificationDropdown.module.scss';

const NotificationDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const list = await NotificationService.getNotifications(user.id);
      // Grab top 5 most recent
      setAlerts(list.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user?.id]);

  const handleMarkRead = async (alertId) => {
    try {
      await NotificationService.markAsRead(alertId);
      setAlerts((prev) =>
        prev.map((n) => (n.id === alertId ? { ...n, is_read: true } : n))
      );
      // Custom event to sync counts on the header bell!
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await NotificationService.markAllAsRead(user.id);
      setAlerts((prev) => prev.map((n) => ({ ...n, is_read: true })));
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAll = () => {
    if (onClose) onClose();
    navigate('/notifications');
  };

  return (
    <div className={styles.dropdownCard}>
      <div className={styles.header}>
        <span className={styles.title}>Notifications</span>
        {alerts.some((n) => !n.is_read) && (
          <button onClick={handleMarkAllRead} className={styles.markReadBtn}>
            <CheckSquare className={styles.btnIcon} />
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.scrollList}>
        {loading ? (
          <>
            <NotificationSkeleton />
            <NotificationSkeleton />
          </>
        ) : alerts.length > 0 ? (
          alerts.map((alert) => (
            <NotificationItem
              key={alert.id}
              alert={alert}
              onMarkRead={handleMarkRead}
            />
          ))
        ) : (
          <NotificationEmptyState />
        )}
      </div>

      <button onClick={handleViewAll} className={styles.footerLink}>
        <Eye className={styles.btnIcon} />
        View all notifications
      </button>
    </div>
  );
};

export default NotificationDropdown;
