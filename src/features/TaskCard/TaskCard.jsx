import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../../components/Card/Card';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Badge from '../../components/Badge/Badge';
import Avatar from '../../components/Avatar/Avatar';
import styles from './TaskCard.module.scss';

const STATUS_PROGRESS = {
  created: 15,
  assigned: 35,
  in_progress: 55,
  ready_for_review: 75,
  reviewing: 85,
  completed: 100,
  published: 100,
};

const TaskCard = ({ task, onClick, className = '' }) => {
  const { title, status, priority, deadline, assignedUser, category, description, creator, assignee } = task;

  const priorityVariants = {
    low: 'secondary',
    medium: 'primary',
    high: 'warning',
    urgent: 'danger',
  };

  const getPriorityLabel = (pri) => {
    if (!pri) return '';
    return pri.charAt(0).toUpperCase() + pri.slice(1);
  };

  const displayAssignee = assignee || assignedUser;
  const displayCreator = creator || task.creator;
  const progressVal = STATUS_PROGRESS[status?.toLowerCase()] || 10;

  return (
    <Card
      hoverable={true}
      onClick={onClick}
      className={`${styles.taskCard} ${className}`}
      padding={false}
    >
      <div className={styles.innerContent}>
        <div className={styles.header}>
          <span className={styles.category}>{category}</span>
          <div className={styles.badges}>
            <Badge variant={priorityVariants[priority.toLowerCase()] || 'secondary'}>
              {getPriorityLabel(priority)}
            </Badge>
            <StatusBadge status={status} />
          </div>
        </div>

        <h4 className={styles.title}>{title}</h4>

        {description && <p className={styles.descriptionSnippet}>{description}</p>}

        <div className={styles.userSection}>
          {displayCreator && (
            <div className={styles.userBadge} title={`Creator: ${displayCreator.name}`}>
              <Avatar src={displayCreator.avatar_url || displayCreator.avatar} name={displayCreator.name} size="xs" />
              <span className={styles.userRoleText}>
                Creator: <strong>{displayCreator.name.split(' ')[0]}</strong>
              </span>
            </div>
          )}
          
          {displayAssignee ? (
            <div className={styles.userBadge} title={`Assignee: ${displayAssignee.name}`}>
              <Avatar src={displayAssignee.avatar_url || displayAssignee.avatar} name={displayAssignee.name} size="xs" />
              <span className={styles.userRoleText}>
                Assignee: <strong>{displayAssignee.name.split(' ')[0]}</strong>
              </span>
            </div>
          ) : (
            <div className={styles.unassignedBadge}>
              <span className={styles.unassignedDot} />
              <span>Unassigned</span>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.deadline}>
            <Calendar />
            <span>Due: {deadline || 'No deadline'}</span>
          </div>
        </div>
      </div>

      {/* Modern Status Progress Indicator Track */}
      <div className={styles.progressTrack}>
        <div 
          className={`${styles.progressBar} ${styles[status?.toLowerCase()] || ''}`}
          style={{ width: `${progressVal}%` }}
        />
      </div>
    </Card>
  );
};

export default React.memo(TaskCard);
