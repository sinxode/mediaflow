import React from 'react';
import { ClipboardList, PlayCircle, Eye, CheckCircle } from 'lucide-react';
import styles from './TaskStats.module.scss';

const TaskStats = ({ stats }) => {
  const statItems = [
    { label: 'All Tasks', value: stats.all, icon: <ClipboardList />, type: 'all' },
    { label: 'Active', value: stats.active, icon: <PlayCircle />, type: 'active' },
    { label: 'Reviewing', value: stats.reviewing, icon: <Eye />, type: 'reviewing' },
    { label: 'Completed', value: stats.completed, icon: <CheckCircle />, type: 'completed' },
  ];

  return (
    <div className={styles.statsRow}>
      {statItems.map((item) => (
        <div key={item.label} className={`${styles.statCard} ${styles[item.type]}`}>
          <div className={styles.info}>
            <span className={styles.label}>{item.label}</span>
            <span className={styles.value}>{item.value}</span>
          </div>
          <div className={styles.iconWrapper}>{item.icon}</div>
        </div>
      ))}
    </div>
  );
};

export default TaskStats;
