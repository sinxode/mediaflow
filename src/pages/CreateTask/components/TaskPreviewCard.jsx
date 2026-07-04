import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Image, Film, Sparkles, Share2, FileText, Camera, ChevronRight } from 'lucide-react';
import styles from './TaskPreviewCard.module.scss';

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

const TaskPreviewCard = ({ task }) => {
  const { title, category, priority, assignedUser, deadline, status = 'Created' } = task;

  const displayTitle = title.trim() || 'Friday Program Poster';
  const displayCategory = category || 'Poster Design';
  const displayPriority = priority || 'Medium';
  const displayAssignee = assignedUser || 'Muhammad';
  
  // Format deadline date to something readable e.g., "Jul 5"
  let displayDeadline = 'Jul 5';
  if (deadline) {
    try {
      const dateObj = new Date(deadline);
      if (!isNaN(dateObj.getTime())) {
        displayDeadline = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        displayDeadline = deadline;
      }
    } catch {
      displayDeadline = deadline;
    }
  }

  const priorityClass = displayPriority.toLowerCase();
  const statusClass = status.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={styles.previewContainer}>
      <span className={styles.previewLabel}>Live Card Preview</span>
      
      <div className={styles.previewCardOuter}>
        <div className={styles.taskCardRow}>
          {/* Left: Category Icon */}
          <div className={styles.iconContainer}>
            {getCategoryIcon(displayCategory)}
          </div>

          {/* Middle: Title & Metadata */}
          <div className={styles.mainInfo}>
            <div className={styles.titleWrapper}>
              <h4 className={styles.title}>{displayTitle}</h4>
              <span className={styles.categoryLabel}>{displayCategory}</span>
            </div>
            
            <div className={styles.metadata}>
              <span className={styles.metaItem}>
                <span className={styles.dot} />
                {displayAssignee}
              </span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.metaItem}>
                <Calendar className={styles.metaIcon} />
                {displayDeadline}
              </span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.metaItem}>
                <span className={styles.creatorInitial}>C</span>
                Sinan
              </span>
            </div>
          </div>

          {/* Right: Badges & Chevron */}
          <div className={styles.actionArea}>
            <div className={styles.badges}>
              <span className={`${styles.priorityBadge} ${styles[priorityClass]}`}>
                {displayPriority}
              </span>
              <span className={`${styles.statusBadge} ${styles[statusClass]}`}>
                {status}
              </span>
            </div>
            <ChevronRight className={styles.chevron} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskPreviewCard;
