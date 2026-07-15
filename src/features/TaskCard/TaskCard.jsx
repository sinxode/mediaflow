import React from 'react';
import {
  Image,
  Film,
  Sparkles,
  Share2,
  FileText,
  Camera,
  ChevronRight,
  Calendar
} from 'lucide-react';
import Avatar from '../../components/Avatar/Avatar';
import styles from './TaskCard.module.scss';

// Category Icon Mapper
const getCategoryIcon = (category) => {
  const normalized = category?.toLowerCase() || '';
  if (normalized.includes('poster')) return <Image />;
  if (normalized.includes('video')) return <Film />;
  if (normalized.includes('thumbnail')) return <Sparkles />;
  if (normalized.includes('social') || normalized.includes('post')) return <Share2 />;
  if (normalized.includes('document') || normalized.includes('docs')) return <FileText />;
  if (normalized.includes('photograph') || normalized.includes('photo')) return <Camera />;
  return <FileText />;
};

const TaskCard = ({ task, onClick, className = '' }) => {
  const { title, description, category, status, priority, deadline, assignedUser, creator, assignee } = task;

  const displayAssignee = assignee || assignedUser;
  const displayCreator = creator || task.creator;

  const prio = priority?.toLowerCase() || 'medium';
  const statusClass = status?.toLowerCase().replace(/\s+/g, '-') || 'created';

  return (
    <div
      onClick={onClick}
      className={`${styles.taskCardRow} ${className}`}
    >
      {/* Left: Category Icon */}
      <div className={styles.iconContainer}>
        {getCategoryIcon(category)}
      </div>

      {/* Middle: Title & Metadata */}
      <div className={styles.mainInfo}>
        <div className={styles.titleWrapper}>
          <h4 className={styles.title}>{title}</h4>
          {description && <span className={styles.descriptionPreview}>{description}</span>}
        </div>
        
        {/* Bottom Metadata row */}
        <div className={styles.metadata}>
          {displayAssignee ? (
            <span className={styles.metaItem} title="Assignee">
              <Avatar src={displayAssignee.avatar_url || displayAssignee.avatar} name={displayAssignee.name} size="xs" />
              <span className={styles.metaText}>{displayAssignee.name}</span>
            </span>
          ) : (
            <span className={styles.metaItem} style={{ fontStyle: 'italic', color: '#94A3B8' }}>
              Unassigned
            </span>
          )}
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaItem} title="Deadline">
            <Calendar className={styles.metaIcon} />
            <span className={styles.metaText}>{deadline || 'No deadline'}</span>
          </span>
          {displayCreator && (
            <>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.metaItem} title="Creator">
                <span className={styles.creatorInitial}>C</span>
                <span className={styles.metaText}>{displayCreator.name}</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Right: Badges & Chevron */}
      <div className={styles.actionArea}>
        <div className={styles.badges}>
          <span className={`${styles.priorityBadge} ${styles[prio]}`}>
            {priority}
          </span>
          <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
            {status}
          </span>
        </div>
        <ChevronRight className={styles.chevron} />
      </div>
    </div>
  );
};

export default React.memo(TaskCard);
