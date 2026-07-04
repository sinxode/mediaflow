import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, Eye, ShieldAlert } from 'lucide-react';
import Card from '../Card/Card';
import styles from './WorkflowHealthPanel.module.scss';

const WorkflowHealthPanel = ({ health }) => {
  const navigate = useNavigate();

  const metrics = [
    {
      id: 'waiting-review',
      label: 'Waiting Review',
      value: health.waitingReviewCount || 0,
      color: 'blue',
      icon: <Eye />
    },
    {
      id: 'stuck',
      label: 'Stuck In Progress',
      value: health.stuckCount || 0,
      color: 'yellow',
      icon: <Clock />
    },
    {
      id: 'overdue',
      label: 'Overdue Deliverables',
      value: health.overdueCount || 0,
      color: 'red',
      icon: <AlertCircle />
    },
    {
      id: 'unassigned',
      label: 'Unassigned Tasks',
      value: health.unassignedCount || 0,
      color: 'purple',
      icon: <ShieldAlert />
    }
  ];

  return (
    <Card className={styles.healthCard}>
      <h3 className={styles.title}>Workflow Health & Bottlenecks</h3>
      <p className={styles.subtitle}>Critical pipelines requiring active team remediation.</p>

      {/* Grid of issues counters */}
      <div className={styles.grid}>
        {metrics.map((metric) => (
          <div key={metric.id} className={`${styles.metricCell} ${styles[metric.color]}`}>
            <div className={styles.iconRow}>
              {metric.icon}
              <span className={styles.metricLabel}>{metric.label}</span>
            </div>
            <span className={styles.metricValue}>{metric.value}</span>
          </div>
        ))}
      </div>

      {/* List overdue/stuck items */}
      {health.overdueList && health.overdueList.length > 0 && (
        <div className={styles.itemsSection}>
          <h4 className={styles.sectionTitle}>Overdue Deliverables List</h4>
          <div className={styles.list}>
            {health.overdueList.map((task) => (
              <div
                key={task.id}
                onClick={() => navigate(`/tasks`)}
                className={styles.listItem}
              >
                <span className={styles.taskTitle}>{task.title}</span>
                <span className={styles.taskDue}>Due {task.deadline}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default WorkflowHealthPanel;
