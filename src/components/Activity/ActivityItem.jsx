import React from 'react';
import Avatar from '../Avatar/Avatar';
import ActivityRenderer from './ActivityRenderer';
import styles from './ActivityItem.module.scss';

const ActivityItem = ({ log }) => {
  const { userName, action, metadata, created_at } = log;

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

  return (
    <div className={styles.itemRow}>
      <div className={styles.avatarCol}>
        <Avatar name={userName} size="sm" />
      </div>
      
      <div className={styles.contentCol}>
        <p className={styles.text}>
          <strong className={styles.userName}>{userName}</strong>{' '}
          <ActivityRenderer action={action} metadata={metadata} />
        </p>
        <span className={styles.timestamp}>{formatRelativeTime(created_at)}</span>
      </div>
    </div>
  );
};

export default ActivityItem;
