import React from 'react';
import styles from './CommentSkeleton.module.scss';

const CommentSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.avatarPulse} />
      <div className={styles.contentCol}>
        <div className={styles.metaRow}>
          <div className={styles.namePulse} />
          <div className={styles.badgePulse} />
          <div className={styles.timePulse} />
        </div>
        <div className={styles.linePulse} />
        <div className={`${styles.linePulse} ${styles.short}`} />
      </div>
    </div>
  );
};

export default CommentSkeleton;
