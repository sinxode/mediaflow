import React from 'react';
import Card from '../../../components/Card/Card';
import Avatar from '../../../components/Avatar/Avatar';
import styles from './TaskSidebar.module.scss';

// Relative time formatting helper
const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch (e) {
    return 'Recently';
  }
};

const TaskSidebar = ({ task, commentsCount = 0 }) => {
  const metaItems = [
    { label: 'Status', value: task.status, type: 'status' },
    { label: 'Priority', value: task.priority, type: 'priority' },
    { label: 'Category', value: task.category, type: 'text' },
    { label: 'Deadline', value: task.deadline, type: 'text' },
    { label: 'Assigned User', value: task.assignedUser, type: 'user' },
    { label: 'Created By', value: task.createdBy, type: 'text' },
    { label: 'Last Updated', value: formatRelativeTime(task.updated_at), type: 'text' },
    { label: 'Comments', value: `${commentsCount} comments`, type: 'text' },
  ];

  return (
    <Card padding={true} className={styles.sidebarCard}>
      <h3 className={styles.sidebarTitle}>Task Parameters</h3>
      
      <div className={styles.metaList}>
        {metaItems.map((item) => (
          <div key={item.label} className={styles.metaRow}>
            <span className={styles.metaLabel}>{item.label}</span>
            <div className={styles.metaValueContainer}>
              {item.type === 'status' ? (
                <span className={`${styles.statusBadge} ${styles[item.value.toLowerCase().replace(/\s+/g, '-')]}`}>
                  {item.value}
                </span>
              ) : item.type === 'priority' ? (
                <span className={`${styles.priorityBadge} ${styles[item.value.toLowerCase()]}`}>
                  {item.value}
                </span>
              ) : item.type === 'user' ? (
                <div className={styles.userValue}>
                  <Avatar name={item.value} size="sm" />
                  <span className={styles.userName}>{item.value}</span>
                </div>
              ) : (
                <span className={styles.metaValue}>{item.value}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default TaskSidebar;
