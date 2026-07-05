import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckSquare,
  Archive,
  Search,
  Bell,
  MessageSquare,
  AlertCircle,
  Eye,
  Sparkles,
  Inbox,
  Trash2,
  Check
} from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import NotificationSkeleton from '../../components/Notifications/NotificationSkeleton';
import NotificationEmptyState from '../../components/Notifications/NotificationEmptyState';
import { NotificationService } from '../../services/notifications/notificationService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRealtimeNotifications } from '../../hooks/useRealtime';
import { DeepLinkHandler } from '../../services/notifications/DeepLinkHandler';
import { pageVariants, fadeUpVariants } from '../../utils/animations';
import styles from './Notifications.jsx.module.scss';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Categorized Tabs: 'action_required' | 'workflow_update' | 'team_hub' | 'archived'
  const [activeTab, setActiveTab] = useState('action_required');
  const [searchQuery, setSearchQuery] = useState('');
  const [counts, setCounts] = useState({ action_required: 0, workflow_update: 0, team_hub: 0 });

  const loadNotifications = async (showSkeleton = true) => {
    if (!user) return;
    try {
      if (showSkeleton) setLoading(true);
      
      const filters = {
        category: activeTab,
        search: searchQuery
      };

      const list = await NotificationService.getNotifications(user.id, filters);
      setAlerts(list || []);
      
      // Also sync category badge counts
      const categoryCounts = await NotificationService.getUnreadCountByCategory(user.id);
      setCounts(categoryCounts);
    } catch (err) {
      console.error('Failed to load notifications list', err);
    } finally {
      if (showSkeleton) setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(true);
  }, [user?.id, activeTab, searchQuery]);

  // Realtime live subscription listener
  useRealtimeNotifications(user?.id, (payload) => {
    if (payload.eventType === 'INSERT') {
      // Sync on insert
      loadNotifications(false);
    } else if (payload.eventType === 'UPDATE') {
      loadNotifications(false);
    }
  });

  const handleMarkRead = async (e, alert) => {
    e.stopPropagation();
    try {
      await NotificationService.markAsRead(alert.id);
      loadNotifications(false);
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleArchive = async (e, alert) => {
    e.stopPropagation();
    try {
      await NotificationService.archiveNotification(alert.id);
      loadNotifications(false);
    } catch (err) {
      console.error('Failed to archive notification', err);
    }
  };

  const handleMarkAllRead = async () => {
    if (!user) return;
    try {
      await NotificationService.markAllAsRead(user.id);
      loadNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleArchiveAllRead = async () => {
    if (!user) return;
    try {
      await NotificationService.archiveAllRead(user.id);
      loadNotifications(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (alert) => {
    try {
      if (!alert.is_read) {
        await NotificationService.markAsRead(alert.id);
      }
      // Route via DeepLinkHandler
      DeepLinkHandler.handleLink(alert.metadata || { item_type: 'task', item_id: alert.related_task_id }, navigate);
    } catch (err) {
      console.error('Failed to process deep link click', err);
    }
  };

  const getIcon = (type, category) => {
    if (category === 'mention') return <MessageSquare size={16} />;
    
    switch (type) {
      case 'task_assigned':
        return <AlertCircle size={16} />;
      case 'review_requested':
        return <Eye size={16} />;
      case 'changes_requested':
        return <AlertCircle size={16} />;
      case 'approved':
        return <CheckSquare size={16} />;
      case 'published':
        return <Sparkles size={16} />;
      case 'new_idea':
      case 'new_plan':
        return <Inbox size={16} />;
      default:
        return <Bell size={16} />;
    }
  };

  const tabItems = [
    { key: 'action_required', label: 'Action Required', count: counts.action_required },
    { key: 'workflow_update', label: 'Updates', count: counts.workflow_update },
    { key: 'team_hub', label: 'Team Hub', count: counts.team_hub },
    { key: 'archived', label: 'Archived', count: 0 }
  ];

  const hasUnread = alerts.some((n) => !n.is_read);
  const hasRead = alerts.some((n) => n.is_read);

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
        description="Stay updated with tasks, mentions, approvals, and team discussions."
      />

      <div className={styles.workspace}>
        {/* Search & Actions Bar */}
        <div className={styles.searchActionsRow}>
          <div className={styles.searchWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className={styles.bulkActions}>
            {activeTab !== 'archived' && hasUnread && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<CheckSquare size={14} />}
                onClick={handleMarkAllRead}
              >
                Mark Category Read
              </Button>
            )}
            {activeTab !== 'archived' && hasRead && (
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Archive size={14} />}
                onClick={handleArchiveAllRead}
              >
                Archive All Read
              </Button>
            )}
          </div>
        </div>

        {/* Navigation Category Tabs */}
        <div className={styles.tabsRow}>
          {tabItems.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`${styles.tabBtn} ${activeTab === tab.key ? styles.active : ''}`}
            >
              {tab.label}
              {tab.count > 0 && <span className={styles.badge}>{tab.count}</span>}
            </button>
          ))}
        </div>

        {/* Alerts Feed */}
        <Card padding={false} className={styles.feedCard}>
          <div className={styles.alertsList}>
            {loading ? (
              <>
                <NotificationSkeleton />
                <NotificationSkeleton />
                <NotificationSkeleton />
              </>
            ) : alerts.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {alerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    variants={fadeUpVariants}
                    layout
                    className={`${styles.alertCard} ${!alert.is_read ? styles.unread : ''} ${styles[alert.category || 'workflow_update']}`}
                    onClick={() => handleNotificationClick(alert)}
                  >
                    <div className={styles.iconWrapper}>
                      {getIcon(alert.type, alert.category)}
                    </div>
                    
                    <div className={styles.content}>
                      <h4 className={styles.title}>{alert.title}</h4>
                      <p className={styles.message}>{alert.message}</p>
                      
                      <div className={styles.meta}>
                        <span className={styles.time}>
                          {new Date(alert.created_at).toLocaleDateString()} at{' '}
                          {new Date(alert.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        
                        <div className={styles.actions}>
                          {!alert.is_read && (
                            <button
                              title="Mark as Read"
                              className={styles.actionBtn}
                              onClick={(e) => handleMarkRead(e, alert)}
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {!alert.is_archived && (
                            <button
                              title="Archive"
                              className={`${styles.actionBtn} ${styles.archive}`}
                              onClick={(e) => handleArchive(e, alert)}
                            >
                              <Archive size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
