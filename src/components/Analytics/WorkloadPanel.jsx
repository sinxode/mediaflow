import React from 'react';
import Card from '../Card/Card';
import styles from './WorkloadPanel.module.scss';

const WorkloadPanel = ({ workload = [] }) => {
  return (
    <Card className={styles.panelCard}>
      <h3 className={styles.title}>Team Workload Distribution</h3>
      <p className={styles.subtitle}>Identify active deliverables load and resource allocations.</p>

      <div className={styles.workloadList}>
        {workload.map((user) => {
          const totalActive = user.active + user.review;
          // Set a relative percentage fill for visual load comparisons
          const loadPercent = Math.min((totalActive / 8) * 100, 100);

          return (
            <div key={user.name} className={styles.userRow}>
              <div className={styles.metaRow}>
                <span className={styles.userName}>{user.name}</span>
                <span className={styles.statsText}>
                  {user.active} Active • {user.review} Review • {user.completed} Completed
                </span>
              </div>
              
              <div className={styles.loadTrack}>
                <div
                  className={`${styles.loadFill} ${loadPercent > 70 ? styles.highLoad : ''}`}
                  style={{ width: `${loadPercent}%` }}
                />
              </div>

              {/* Task titles instead of IDs */}
              {user.tasks && user.tasks.length > 0 && (
                <div className={styles.userTasksList}>
                  {user.tasks.map((t) => (
                    <span key={t.id} className={styles.taskTag}>
                      {t.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default WorkloadPanel;
