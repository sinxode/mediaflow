import React, { useState } from 'react';
import { Calendar, Clock, Edit3, Trash2, ArrowLeft, Share2, Check } from 'lucide-react';
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

const StatusBadge = ({ status, approvalsCount = 0 }) => {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  const isReviewing = status.toLowerCase() === 'reviewing';
  return (
    <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
      {status} {isReviewing && approvalsCount > 0 ? `(${approvalsCount}/2)` : ''}
    </span>
  );
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

const TaskHeader = ({ task, approvalsCount = 0, onBack, onEdit, onDelete }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#/tasks?id=${task.id}`;
    
    const formattedPriority = task.priority 
      ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1) 
      : 'Medium';

    const copyText = `*Task:* ${task.title}
*Category:* ${task.category || 'Other'}
*Priority:* ${formattedPriority}
*Deadline:* ${task.deadline || 'No deadline'}
*Status:* ${task.status}
*Link:* ${shareUrl}`;

    navigator.clipboard.writeText(copyText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        console.error('Failed to copy task link', err);
      });
  };

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
            <StatusBadge status={task.status} approvalsCount={approvalsCount} />
          </div>
          <h1 className={styles.title}>{task.title}</h1>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant={copied ? 'success' : 'secondary'}
            size="sm"
            leftIcon={copied ? <Check size={14} /> : <Share2 size={14} />}
            onClick={handleCopyLink}
          >
            {copied ? 'Link Copied!' : 'Copy Share Link'}
          </Button>
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
