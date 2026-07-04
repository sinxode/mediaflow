import React from 'react';
import {
  MessageSquare,
  Calendar,
  User,
  ArrowUpRight,
  ChevronRight,
  Image,
  Film,
  Sparkles,
  Share2,
  FileText,
  Camera
} from 'lucide-react';
import Button from '../../../components/Button/Button';
import styles from './ArchiveCard.module.scss';

const getCategoryIcon = (category) => {
  const normalized = (category || '').toLowerCase();
  if (normalized.includes('poster')) return <Image />;
  if (normalized.includes('video')) return <Film />;
  if (normalized.includes('thumbnail')) return <Sparkles />;
  if (normalized.includes('social') || normalized.includes('post')) return <Share2 />;
  if (normalized.includes('document') || normalized.includes('docs')) return <FileText />;
  if (normalized.includes('photograph') || normalized.includes('photo')) return <Camera />;
  return <FileText />;
};

const PriorityBadge = ({ priority }) => {
  const prio = priority.toLowerCase();
  return <span className={`${styles.priorityBadge} ${styles[prio]}`}>{priority}</span>;
};

const ArchiveBadge = ({ status }) => {
  const statusClass = status.toLowerCase();
  return <span className={`${styles.archiveBadge} ${styles[statusClass]}`}>{status}</span>;
};

const ArchiveCard = ({ task, onOpenTask }) => {
  const {
    title,
    category,
    publishedBy,
    creator,
    completedDate,
    publishedDate,
    priority,
    status,
    commentsCount
  } = task;

  return (
    <div className={styles.archiveCard}>
      {/* Left: Interactive Media Thumbnail Placeholder */}
      <div className={styles.thumbnailArea}>
        <div className={styles.categoryIcon}>{getCategoryIcon(category)}</div>
        <span className={styles.formatText}>DELIVERED</span>
      </div>

      {/* Middle: Title, Contributors & Dates Grid */}
      <div className={styles.mainInfo}>
        <div className={styles.headerRow}>
          <span className={styles.category}>{category}</span>
          <h4 className={styles.title}>{title}</h4>
        </div>

        <div className={styles.metaGrid}>
          <div className={styles.metaColumn}>
            <span className={styles.metaLabel}>Published By</span>
            <span className={styles.metaValue}>{publishedBy}</span>
          </div>
          <div className={styles.metaColumn}>
            <span className={styles.metaLabel}>Created By</span>
            <span className={styles.metaValue}>{creator}</span>
          </div>
          <div className={styles.metaColumn}>
            <span className={styles.metaLabel}>Completed</span>
            <span className={styles.metaValue}>{completedDate}</span>
          </div>
          <div className={styles.metaColumn}>
            <span className={styles.metaLabel}>Published</span>
            <span className={styles.metaValue}>{publishedDate}</span>
          </div>
        </div>

        {/* Foot Stats row */}
        <div className={styles.footerRow}>
          <div className={styles.pillsRow}>
            <PriorityBadge priority={priority} />
            <ArchiveBadge status={status} />
            <span className={styles.commentsItem}>
              <MessageSquare className={styles.commentsIcon} />
              <span>{commentsCount} comments</span>
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenTask(task)}
            className={styles.viewDetailsBtn}
            rightIcon={<ChevronRight />}
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveCard;
