import React from 'react';
import styles from './NotificationSkeleton.module.scss';

const NotificationSkeleton = () => {
  return (
    <div className={styles.skeletonItem}>
      <div className={styles.avatarPulse} />
      <div className={styles.contentCol}>
        <div className={styles.titlePulse} />
        <div className={styles.descPulse} />
        <div className={styles.timePulse} />
      </div>
    </div>
  );
};

export default NotificationSkeleton;
