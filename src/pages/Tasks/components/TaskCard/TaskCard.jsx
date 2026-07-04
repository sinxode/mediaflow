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
import styles from './TaskCard.module.scss';

// Category Icon Mapper
const getCategoryIcon = (category) => {
  const normalized = category.toLowerCase();
  if (normalized.includes('poster')) return <Image />;
  if (normalized.includes('video')) return <Film />;
  if (normalized.includes('thumbnail')) return <Sparkles />;
  if (normalized.includes('social') || normalized.includes('post')) return <Share2 />;
  if (normalized.includes('document') || normalized.includes('docs')) return <FileText />;
  if (normalized.includes('photograph') || normalized.includes('photo')) return <Camera />;
  return <FileText />;
};

// Priority Badge Component
const PriorityBadge = React.memo(({ priority }) => {
  const prio = priority.toLowerCase();
  return (
    <span className={`${styles.priorityBadge} ${styles[prio]}`}>
      {priority}
    </span>
  );
});

// Status Badge Component (with custom colors for all 8 states)
const StatusBadge = React.memo(({ status }) => {
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');
  return (
    <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
      {status}
    </span>
  );
});

const TaskCard = ({ task, onClick }) => {
  const { title, description, category, status, priority, deadline, assignedUser, createdBy } = task;

  return (
    <div
      onClick={onClick}
      className={styles.taskCardRow}
    >
      {/* Left: Category Icon */}
      <div className={styles.iconContainer}>
        {getCategoryIcon(category)}
      </div>

      {/* Middle: Title & Metadata */}
      <div className={styles.mainInfo}>
        <div className={styles.titleWrapper}>
          <h4 className={styles.title}>{title}</h4>
          <span className={styles.descriptionPreview}>{description}</span>
        </div>
        
        {/* Bottom Metadata row */}
        <div className={styles.metadata}>
          <span className={styles.metaItem} title="Assignee">
            <span className={styles.dot} />
            {assignedUser}
          </span>
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaItem} title="Deadline">
            <Calendar className={styles.metaIcon} />
            {deadline}
          </span>
          <span className={styles.metaDivider}>•</span>
          <span className={styles.metaItem} title="Created By">
            <span className={styles.creatorInitial}>C</span>
            {createdBy}
          </span>
        </div>
      </div>

      {/* Right: Badges & Chevron */}
      <div className={styles.actionArea}>
        <div className={styles.badges}>
          <PriorityBadge priority={priority} />
          <StatusBadge status={status} />
        </div>
        <ChevronRight className={styles.chevron} />
      </div>
    </div>
  );
};

export default React.memo(TaskCard);
