import React from 'react';
import styles from './ActivitySkeleton.module.scss';

const ActivitySkeleton = () => {
  return (
    <div className={styles.skeletonRow}>
      <div className={styles.avatarPulse} />
      <div className={styles.contentCol}>
        <div className={styles.textPulse} />
        <div className={styles.timePulse} />
      </div>
    </div>
  );
};

export default ActivitySkeleton;
