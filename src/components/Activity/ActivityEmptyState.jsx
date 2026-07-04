import React from 'react';
import { History } from 'lucide-react';
import styles from './ActivityEmptyState.module.scss';

const ActivityEmptyState = () => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <History className={styles.icon} />
      </div>
      <h4 className={styles.title}>No Activities Found</h4>
      <p className={styles.description}>No logs are registered under the current filter selection.</p>
    </div>
  );
};

export default ActivityEmptyState;
