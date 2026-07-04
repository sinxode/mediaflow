import React from 'react';
import { Eye, AlertTriangle, CheckCircle2, Globe } from 'lucide-react';
import styles from './ReviewMetrics.module.scss';

const ReviewMetrics = ({ stats }) => {
  const items = [
    { label: 'Ready For Review', value: stats.readyReview, icon: <Eye />, type: 'review' },
    { label: 'Changes Requested', value: stats.changesRequested, icon: <AlertTriangle />, type: 'changes' },
    { label: 'Approved', value: stats.approved, icon: <CheckCircle2 />, type: 'approved' },
    { label: 'Ready To Publish', value: stats.readyPublish, icon: <Globe />, type: 'publish' }
  ];

  return (
    <div className={styles.metricsRow}>
      {items.map((item) => (
        <div key={item.label} className={`${styles.metricCard} ${styles[item.type]}`}>
          <div className={styles.info}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
          <div className={styles.iconContainer}>{item.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default ReviewMetrics;
