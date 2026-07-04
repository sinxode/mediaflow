import React from 'react';
import { BellOff } from 'lucide-react';
import styles from './NotificationEmptyState.module.scss';

const NotificationEmptyState = () => {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconWrapper}>
        <BellOff className={styles.icon} />
      </div>
      <h4 className={styles.title}>No Notifications</h4>
      <p className={styles.description}>You're all caught up. New workflow logs will appear here.</p>
    </div>
  );
};

export default NotificationEmptyState;
