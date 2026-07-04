import React from 'react';
import styles from './ArchiveSkeleton.module.scss';

const ArchiveSkeleton = ({ count = 3 }) => {
  const items = Array.from({ length: count });

  return (
    <div className={styles.skeletonList}>
      {items.map((_, index) => (
        <div key={index} className={styles.skeletonCard}>
          <div className={styles.thumbnailPlaceholderShimmer} />
          
          <div className={styles.mainInfo}>
            <div className={`${styles.shimmer} ${styles.category}`} />
            <div className={`${styles.shimmer} ${styles.title}`} />
            
            <div className={styles.metaGrid}>
              <div className={`${styles.shimmer} ${styles.metaItem}`} />
              <div className={`${styles.shimmer} ${styles.metaItem}`} />
              <div className={`${styles.shimmer} ${styles.metaItem}`} />
              <div className={`${styles.shimmer} ${styles.metaItem}`} />
            </div>

            <div className={styles.footer}>
              <div className={styles.pills}>
                <div className={`${styles.shimmer} ${styles.badge}`} />
                <div className={`${styles.shimmer} ${styles.badge}`} />
              </div>
              <div className={`${styles.shimmer} ${styles.btn}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArchiveSkeleton;
