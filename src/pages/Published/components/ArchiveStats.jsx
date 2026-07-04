import React from 'react';
import { Clock, Calendar, Award, Package } from 'lucide-react';
import styles from './ArchiveStats.module.scss';

const ArchiveStats = ({ stats }) => {
  const items = [
    { label: 'Published Today', value: stats.publishedToday, icon: <Clock /> },
    { label: 'Published This Week', value: stats.publishedThisWeek, icon: <Calendar /> },
    { label: 'Published This Month', value: stats.publishedThisMonth, icon: <Award /> },
    { label: 'Total Archived', value: stats.totalArchive, icon: <Package /> }
  ];

  return (
    <div className={styles.statsRow}>
      {items.map((item) => (
        <div key={item.label} className={styles.statCard}>
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

export default ArchiveStats;
