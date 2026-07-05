import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../Avatar/Avatar';
import { DeepLinkHandler } from '../../services/notifications/DeepLinkHandler';
import styles from './NotificationItem.module.scss';

const NotificationItem = ({ alert, onMarkRead }) => {
  const navigate = useNavigate();
  const { id, title, message, is_read, created_at, related_task_id } = alert;

  const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = Math.abs(now - date);
      
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) return `${diffHours}h ago`;
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    } catch {
      return '';
    }
  };

  const handleItemClick = async () => {
    // Mark as read inline
    if (!is_read && onMarkRead) {
      await onMarkRead(id);
    }
    
    // Redirect via DeepLinkHandler
    DeepLinkHandler.handleLink(
      alert.metadata || { item_type: 'task', item_id: related_task_id },
      navigate
    );
  };

  // Resolve dummy avatar initials based on type
  const getAvatarName = (type) => {
    switch (type) {
      case 'task_assigned':
        return 'System';
      case 'comment_added':
        return 'Muhammad';
      case 'review_requested':
        return 'Reviewer';
      default:
        return 'System';
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`${styles.itemContainer} ${!is_read ? styles.unread : ''}`}
    >
      <div className={styles.avatarCol}>
        <Avatar name={getAvatarName(alert.type)} size="sm" />
        {!is_read && <span className={styles.unreadDot} />}
      </div>
      
      <div className={styles.contentCol}>
        <h5 className={styles.title}>{title}</h5>
        <p className={styles.message}>{message}</p>
        <span className={styles.time}>{formatRelativeTime(created_at)}</span>
      </div>
    </div>
  );
};

export default NotificationItem;
