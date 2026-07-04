import React from 'react';
import { PlusCircle, Eye, CheckCircle2, Globe } from 'lucide-react';
import styles from './ProfileStats.module.scss';

const ProfileStats = ({ stats }) => {
  const items = [
    { label: 'Tasks Created', value: stats.created, icon: <PlusCircle />, type: 'created' },
    { label: 'Tasks Reviewed', value: stats.reviewed, icon: <Eye />, type: 'reviewed' },
    { label: 'Tasks Completed', value: stats.completed, icon: <CheckCircle2 />, type: 'completed' },
    { label: 'Published Items', value: stats.published, icon: <Globe />, type: 'published' }
  ];

  return (
    <div className={styles.statsGrid}>
      {items.map((item) => (
        <div key={item.label} className={`${styles.statCard} ${styles[item.type]}`}>
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

export default ProfileStats;
