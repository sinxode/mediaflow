import React from 'react';
import styles from './UploadProgress.module.scss';

const UploadProgress = ({ percent }) => {
  const isProcessing = percent >= 100;

  return (
    <div className={styles.progressContainer}>
      <div className={styles.labelRow}>
        <span className={styles.progressLabel}>
          {isProcessing ? 'Processing deliverable file...' : 'Uploading asset to server...'}
        </span>
        <span className={styles.percentText}>{Math.round(percent)}%</span>
      </div>
      
      <div className={styles.progressBarBg}>
        <div
          className={`${styles.progressBarFill} ${isProcessing ? styles.processing : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default UploadProgress;
