import React from 'react';
import LoadingSkeleton from '../../../../components/LoadingSkeleton/LoadingSkeleton';
import styles from './LoadingState.module.scss';

const LoadingState = ({ count = 6 }) => {
  return (
    <div className={styles.loadingContainer}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className={styles.skeletonRow}>
          {/* Left: Icon Skeleton */}
          <LoadingSkeleton variant="circle" width="32px" height="32px" className={styles.iconSkeleton} />
          
          {/* Middle: Title & Metadata Skeleton */}
          <div className={styles.infoSkeleton}>
            <LoadingSkeleton variant="title" width="40%" height="14px" className={styles.titleSkeleton} />
            <LoadingSkeleton variant="text" width="60%" height="10px" className={styles.textSkeleton} />
          </div>
          
          {/* Right: Badges Skeleton */}
          <div className={styles.badgesSkeleton}>
            <LoadingSkeleton variant="text" width="50px" height="18px" />
            <LoadingSkeleton variant="text" width="60px" height="18px" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
