import React from 'react';
import { MessageSquare } from 'lucide-react';
import styles from './CommentEmptyState.module.scss';

const CommentEmptyState = () => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.iconWrapper}>
        <MessageSquare className={styles.icon} />
      </div>
      <h4 className={styles.title}>No Comments Yet</h4>
      <p className={styles.description}>Start the discussion for this workflow task below.</p>
    </div>
  );
};

export default CommentEmptyState;
