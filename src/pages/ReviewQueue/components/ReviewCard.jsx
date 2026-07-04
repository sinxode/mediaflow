import React from 'react';
import {
  MessageSquare,
  Activity,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Globe,
  Check,
  ChevronRight,
  User,
  ArrowRight
} from 'lucide-react';
import Button from '../../../components/Button/Button';
import styles from './ReviewCard.module.scss';

const PriorityBadge = ({ priority }) => {
  const prio = priority.toLowerCase();
  return <span className={`${styles.priorityBadge} ${styles[prio]}`}>{priority}</span>;
};

const StatusBadge = ({ status }) => {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return <span className={`${styles.statusBadge} ${styles[statusClass]}`}>{status}</span>;
};

const ReviewCard = ({ task, onAction, onOpenTask }) => {
  const {
    title,
    category,
    creatorName,
    submittedTime,
    status,
    priority,
    deadline,
    commentsCount,
    lastActivity
  } = task;

  const isHighPriority = priority.toLowerCase() === 'high' || priority.toLowerCase() === 'urgent';

  // Renders role-specific buttons on each card matching their operation step
  const renderActionButtons = () => {
    const normStatus = status.toLowerCase();
    
    if (normStatus === 'ready for review' || normStatus === 'reviewing') {
      return (
        <>
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<AlertTriangle />}
            onClick={() => onAction(task.id, 'changes')}
            className={styles.requestBtn}
          >
            Request Changes
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<CheckCircle />}
            onClick={() => onAction(task.id, 'approve')}
            className={styles.approveBtn}
          >
            Approve Asset
          </Button>
        </>
      );
    }
    
    if (normStatus === 'approved') {
      return (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Globe />}
          onClick={() => onAction(task.id, 'publish')}
          className={styles.publishBtn}
        >
          Mark Published
        </Button>
      );
    }
    
    if (normStatus === 'ready to publish') {
      return (
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Check />}
          onClick={() => onAction(task.id, 'complete')}
          className={styles.completeBtn}
        >
          Complete Task
        </Button>
      );
    }
    
    return null; // Completed or default
  };

  return (
    <div className={`${styles.reviewCard} ${isHighPriority ? styles.highPriority : ''}`}>
      {/* Subtle indicator bar for High priority items */}
      {isHighPriority && <div className={styles.priorityIndicator} />}

      <div className={styles.cardHeader}>
        <div className={styles.titleInfo}>
          <span className={styles.category}>{category}</span>
          <h4 className={styles.title}>{title}</h4>
          <span className={styles.submitter}>
            Submitted by <strong>{creatorName}</strong> • {submittedTime}
          </span>
        </div>
        <div className={styles.headerBadges}>
          <PriorityBadge priority={priority} />
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Stats and metadata details */}
      <div className={styles.metaRow}>
        <span className={styles.metaItem}>
          <Calendar className={styles.metaIcon} />
          <span>Deadline: {deadline}</span>
        </span>
        <span className={styles.metaDivider}>•</span>
        <span className={styles.metaItem}>
          <MessageSquare className={styles.metaIcon} />
          <span>{commentsCount} comments</span>
        </span>
        <span className={styles.metaDivider}>•</span>
        <span className={styles.metaItem}>
          <Activity className={styles.metaIcon} />
          <span>Active: {lastActivity}</span>
        </span>
      </div>

      {/* Action panel footer */}
      <div className={styles.actionsFooter}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenTask(task)}
          className={styles.openBtn}
          rightIcon={<ChevronRight />}
        >
          Open Task
        </Button>
        
        <div className={styles.quickActions}>
          {renderActionButtons()}
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;
