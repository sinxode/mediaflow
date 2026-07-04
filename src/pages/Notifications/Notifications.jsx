import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckSquare } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import NotificationItem from '../../components/Notifications/NotificationItem';
import NotificationSkeleton from '../../components/Notifications/NotificationSkeleton';
import NotificationEmptyState from '../../components/Notifications/NotificationEmptyState';
import { NotificationService } from '../../services/notifications/notificationService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRealtimeNotifications } from '../../hooks/useRealtime';
import { pageVariants, fadeUpVariants } from '../../utils/animations';
import styles from './Notifications.jsx.module.scss';

const Notifications = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'unread' | 'read'

  const loadNotifications = async (showSkeleton = true) => {
    if (!user) return;
    try {
      if (showSkeleton) setLoading(true);
      const filters = {};
      if (activeTab === 'unread') filters.isRead = false;
      if (activeTab === 'read') filters.isRead = true;

      const list = await NotificationService.getNotifications(user.id, filters);
      setAlerts((prev) => {
        if (JSON.stringify(prev) === JSON.stringify(list)) return prev;
        return list;
      });
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);

    // Background heartbeat polling fallback every 4.5 seconds
    const interval = setInterval(() => {
      loadNotifications(false);
    }, 4500);

    return () => clearInterval(interval);
  }, [user?.id, activeTab]);

  // Hook live notifications updates listener
  useRealtimeNotifications(user?.id, (payload) => {
    if (payload.eventType === 'INSERT') {
      setAlerts((prev) => {
        // Prevent duplication
        if (prev.some((n) => n.id === payload.new.id)) return prev;

        // Apply tab filters check
        if (activeTab === 'read' && !payload.new.is_read) return prev;
        if (activeTab === 'unread' && payload.new.is_read) return prev;

        return [payload.new, ...prev];
      });
    }
  });

  const handleMarkRead = async (alertId) => {
    try {
      await NotificationService.markAsRead(alertId);
      if (activeTab === 'unread') {
        setAlerts((prev) => prev.filter((n) => n.id !== alertId));
      } else {
        setAlerts((prev) =>
          prev.map((n) => (n.id === alertId ? { ...n, is_read: true } : n))
        );
      }
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await NotificationService.markAllAsRead(user.id);
      if (activeTab === 'unread') {
        setAlerts([]);
      } else {
        setAlerts((prev) => prev.map((n) => ({ ...n, is_read: true })));
      }
      window.dispatchEvent(new Event('notifications_updated'));
    } catch (err) {
      console.error(err);
    }
  };

  const hasUnread = alerts.some((n) => !n.is_read) || activeTab === 'unread';

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.pageContainer}
    >
      <PageHeader
        title="Notifications"
        description="View and manage all workflow alerts and status changes."
        actions={
          hasUnread && (
            <Button
              variant="secondary"
              size="md"
              leftIcon={<CheckSquare />}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Button>
          )
        }
      />

      <div className={styles.workspace}>
        {/* Navigation Tabs */}
        <div className={styles.tabsRow}>
          {['all', 'unread', 'read'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.active : ''}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications Feed Card */}
        <Card padding={false} className={styles.feedCard}>
          <div className={styles.alertsList}>
            {loading ? (
              <>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
              </>
            ) : alerts.length > 0 ? (
              <AnimatePresence initial={false}>
                {alerts.map((alert) => (
                  <NotificationItem
                    key={alert.id}
                    alert={alert}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </AnimatePresence>
            ) : (
              <NotificationEmptyState />
            )}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};

export default Notifications;
