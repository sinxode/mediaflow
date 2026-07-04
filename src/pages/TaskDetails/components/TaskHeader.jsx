import React from 'react';
import { Calendar, Clock, Edit3, Trash2, ArrowLeft } from 'lucide-react';
import Button from '../../../components/Button/Button';
import styles from './TaskHeader.module.scss';

// Import local badges or render inline
const CategoryBadge = ({ category }) => (
  <span className={styles.categoryBadge}>{category}</span>
);

const PriorityBadge = ({ priority }) => {
  const prio = priority.toLowerCase();
  return <span className={`${styles.priorityBadge} ${styles[prio]}`}>{priority}</span>;
};

const StatusBadge = ({ status }) => {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`${styles.statusBadge} ${styles[statusClass]}`}>{status}</span>;
};

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

const TaskHeader = ({ task, onBack, onEdit, onDelete }) => {
  return (
    <div className={styles.headerContainer}>
      {/* Back button row */}
      <div className={styles.backRow}>
        <Button variant="ghost" size="sm" onClick={onBack} className={styles.backBtn} leftIcon={<ArrowLeft />}>
          Back to list
        </Button>
      </div>

      {/* Main Title Row */}
      <div className={styles.titleRow}>
        <div className={styles.titleInfo}>
          <div className={styles.badges}>
            <CategoryBadge category={task.category} />
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
          <h1 className={styles.title}>{task.title}</h1>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button variant="secondary" size="sm" leftIcon={<Edit3 />} onClick={onEdit}>
            Edit Task
          </Button>
          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 />}
            onClick={onDelete}
            className={styles.deleteBtn}
          >
            Delete Task
          </Button>
        </div>
      </div>

      {/* Metadata Pills Row */}
      <div className={styles.metaRow}>
        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Assignee</span>
          <span className={styles.metaValue}>
            <span className={styles.userDot} />
            {task.assignedUser}
          </span>
        </div>
        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Creator</span>
          <span className={styles.metaValue}>{task.createdBy}</span>
        </div>
        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Deadline</span>
          <span className={styles.metaValue}>
            <Calendar className={styles.metaIcon} />
            {task.deadline}
          </span>
        </div>
        <div className={styles.metaPill}>
          <span className={styles.metaLabel}>Updated</span>
          <span className={styles.metaValue}>
            <Clock className={styles.metaIcon} />
            {formatRelativeTime(task.updated_at)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TaskHeader;
