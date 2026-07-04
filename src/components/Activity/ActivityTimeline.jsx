import React from 'react';
import ActivityFeed from './ActivityFeed';
import styles from './ActivityTimeline.module.scss';

const ActivityTimeline = ({ taskId }) => {
  return (
    <div className={styles.timelineContainer}>
      <h3 className={styles.sidebarTitle}>Task Timeline History</h3>
      <ActivityFeed taskId={taskId} />
    </div>
  );
};

export default ActivityTimeline;
