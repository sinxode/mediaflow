import React from 'react';
import styles from './CommentActions.module.scss';

const CommentActions = ({ onEdit, onDelete }) => {
  return (
    <div className={styles.actionsRow}>
      <button type="button" onClick={onEdit} className={styles.actionBtn}>
        Edit
      </button>
      <span className={styles.separator}>•</span>
      <button type="button" onClick={onDelete} className={styles.actionBtnDelete}>
        Delete
      </button>
    </div>
  );
};

export default CommentActions;
