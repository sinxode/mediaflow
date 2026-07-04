import React from 'react';
import styles from './FileSkeleton.module.scss';

const FileSkeleton = () => {
  return (
    <div className={styles.skeletonContainer}>
      <div className={styles.previewPulse} />
      <div className={styles.metaCol}>
        <div className={styles.titlePulse} />
        <div className={styles.subPulse} />
      </div>
    </div>
  );
};

export default FileSkeleton;
