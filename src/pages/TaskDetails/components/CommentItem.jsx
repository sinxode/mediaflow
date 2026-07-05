import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from '../../../components/Avatar/Avatar';
import RoleBadge from './RoleBadge';
import MentionRenderer from '../../../components/Mentions/MentionRenderer';
import CommentActions from './CommentActions';
import CommentEditor from './CommentEditor';
import styles from './CommentItem.module.scss';

const CommentItem = ({ comment, currentUser, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if current user is the owner of this comment
  const isOwner = currentUser && (
    comment.user_id === currentUser.id ||
    comment.author?.name?.toLowerCase() === currentUser.name?.toLowerCase()
  );

  const handleSaveEdit = async (newMessage) => {
    try {
      setLoading(true);
      await onUpdate(comment.id, newMessage);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = async () => {
    try {
      setLoading(true);
      await onDelete(comment.id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isEdited = comment.edited || (comment.updated_at && comment.created_at && comment.updated_at !== comment.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={styles.commentItem}
    >
      <div className={styles.avatarCol}>
        <Avatar name={comment.author?.name || 'User'} size="sm" className={styles.avatar} />
      </div>
      
      <div className={styles.contentCol}>
        <div className={styles.header}>
          <span className={styles.userName}>{comment.author?.name || 'User'}</span>
          <RoleBadge role={comment.author?.role} />
          <span className={styles.time}>{formatTime(comment.created_at)}</span>
          {isEdited && <span className={styles.editedTag}>(edited)</span>}
        </div>

        {isEditing ? (
          <CommentEditor
            initialMessage={comment.message}
            onSave={handleSaveEdit}
            onCancel={() => setIsEditing(false)}
            loading={loading}
          />
        ) : (
          <>
            <p className={styles.message}><MentionRenderer text={comment.message} /></p>
            
            {isOwner && !loading && (
              <div className={styles.actionsContainer}>
                {isConfirmingDelete ? (
                  <div className={styles.confirmDeleteRow}>
                    <span className={styles.confirmText}>Delete this message?</span>
                    <button type="button" onClick={handleDeleteClick} className={styles.confirmBtn}>
                      Yes
                    </button>
                    <button type="button" onClick={() => setIsConfirmingDelete(false)} className={styles.cancelBtn}>
                      Cancel
                    </button>
                  </div>
                ) : (
                  <CommentActions
                    onEdit={() => setIsEditing(true)}
                    onDelete={() => setIsConfirmingDelete(true)}
                  />
                )}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default CommentItem;
