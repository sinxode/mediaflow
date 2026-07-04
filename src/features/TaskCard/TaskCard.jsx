import React from 'react';
import { Calendar } from 'lucide-react';
import Card from '../../components/Card/Card';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import Badge from '../../components/Badge/Badge';
import Avatar from '../../components/Avatar/Avatar';
import styles from './TaskCard.module.scss';

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

  return (
    <Card
      hoverable={true}
      onClick={onClick}
      className={`${styles.taskCard} ${className}`}
      padding={false}
    >
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

      <div className={styles.metaInfoRow}>
        {displayCreator && (
          <div className={styles.userMeta}>
            <span className={styles.metaLabel}>Created by</span>
            <div className={styles.userWrapper}>
              <Avatar src={displayCreator.avatar_url || displayCreator.avatar} name={displayCreator.name} size="xs" />
              <span className={styles.userName}>{displayCreator.name}</span>
            </div>
          </div>
        )}
        
        {displayAssignee && (
          <div className={styles.userMeta}>
            <span className={styles.metaLabel}>Assignee</span>
            <div className={styles.userWrapper}>
              <Avatar src={displayAssignee.avatar_url || displayAssignee.avatar} name={displayAssignee.name} size="xs" />
              <span className={styles.userName}>{displayAssignee.name}</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <div className={styles.deadline}>
          <Calendar />
          <span>Due: {deadline}</span>
        </div>
      </div>
    </Card>
  );
};

export default React.memo(TaskCard);
