import React from 'react';
import styles from './AnalyticsSkeleton.module.scss';

const AnalyticsSkeleton = () => {
  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={styles.cardPulse}>
            <div className={styles.labelPulse} />
            <div className={styles.valuePulse} />
            <div className={styles.subPulse} />
          </div>
        ))}
      </div>
      
      <div className={styles.panelPulse}>
        <div className={styles.titlePulse} />
        <div className={styles.linePulse} />
        <div className={styles.linePulse} />
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
