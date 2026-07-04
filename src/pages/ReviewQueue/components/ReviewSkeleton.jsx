import React from 'react';
import styles from './ReviewSkeleton.module.scss';

const ReviewSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });

  return (
    <div className={styles.skeletonList}>
      {items.map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.header}>
            <div className={styles.infoCol}>
              <div className={`${styles.shimmer} ${styles.category}`} />
              <div className={`${styles.shimmer} ${styles.title}`} />
              <div className={`${styles.shimmer} ${styles.subtitle}`} />
            </div>
            <div className={styles.badgesCol}>
              <div className={`${styles.shimmer} ${styles.badge}`} />
              <div className={`${styles.shimmer} ${styles.badge}`} />
            </div>
          </div>
          <div className={`${styles.shimmer} ${styles.meta}`} />
          <div className={styles.footer}>
            <div className={`${styles.shimmer} ${styles.btn}`} />
            <div className={styles.actions}>
              <div className={`${styles.shimmer} ${styles.btnLarge}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReviewSkeleton;
