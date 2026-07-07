import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CommentService } from '../../../services/comments/commentService';
import { useAuth } from '../../../auth/hooks/useAuth';
import { useRealtimeComments } from '../../../hooks/useRealtime';
import { supabase } from '../../../lib/supabaseClient';
import CommentItem from './CommentItem';
import CommentComposer from './CommentComposer';
import CommentEmptyState from './CommentEmptyState';
import CommentSkeleton from './CommentSkeleton';
import { ActivityService } from '../../../services/activity/activityService';
import { parseAndTriggerMentions } from '../../../services/notifications/notificationService';
import styles from './CommentThread.module.scss';

const CommentThread = ({ taskId, onCountChange }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadComments = async () => {
    if (!taskId) return;
    try {
      setLoading(true);
      setError('');
      const list = await CommentService.getComments(taskId);
      // Sort latest first (newest at the top)
      const sorted = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setComments(sorted);
    } catch (err) {
      console.error('Failed to retrieve comments', err);
      setError('Could not load discussion feed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();

    // Hybrid sync: background polling fallback every 2.5 seconds
    const interval = setInterval(async () => {
      if (!taskId) return;
      try {
        const list = await CommentService.getComments(taskId);
        const sorted = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setComments((prev) => {
          // Check if there are differences before updating state to prevent unnecessary re-renders
          if (JSON.stringify(prev) === JSON.stringify(sorted)) return prev;
          return sorted;
        });
      } catch (err) {
        console.error('Failed to poll comments', err);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [taskId]);

  // Hook live comments listener
  useRealtimeComments(taskId, (payload) => {
    if (payload.eventType === 'INSERT') {
      const fetchAuthorAndPrepend = async () => {
        try {
          const { data: userProfile } = await supabase
            .from('users')
            .select('name, role, avatar_url')
            .eq('id', payload.new.user_id)
            .single();
          
          const completeComment = {
            ...payload.new,
            author: userProfile || { name: 'User', role: 'Viewer' }
          };

          setComments((prev) => {
            if (prev.some((c) => c.id === completeComment.id)) return prev;
            return [completeComment, ...prev];
          });
        } catch (err) {
          console.error('Failed to resolve comment author profile', err);
          // Fallback prepending
          setComments((prev) => {
            if (prev.some((c) => c.id === payload.new.id)) return prev;
            return [payload.new, ...prev];
          });
        }
      };
      fetchAuthorAndPrepend();
    } else if (payload.eventType === 'UPDATE') {
      setComments((prev) =>
        prev.map((c) => (c.id === payload.new.id ? { ...c, ...payload.new } : c))
      );
    } else if (payload.eventType === 'DELETE') {
      setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
    }
  });

  // Notify parent component about comments count changes for sidebar accuracy
  useEffect(() => {
    if (onCountChange) {
      onCountChange(comments.length);
    }
  }, [comments.length, onCountChange]);

  const handleAddComment = async (messageText) => {
    if (!user || !taskId) return;
    
    if (!navigator.onLine) {
      alert('Network Offline: Please reconnect to the internet to post comments.');
      return;
    }
    
    try {
      setActionLoading(true);
      setError('');
      
      const payload = {
        task_id: taskId,
        user_id: user.id,
        message: messageText
      };

      const newComment = await CommentService.createComment(payload);
      
      // Optimistic UI update (prepend new comment on top)
      setComments((prev) => {
        if (prev.some((c) => c.id === newComment.id)) return prev;
        return [newComment, ...prev];
      });

      // Log the activity to trigger notifications!
      try {
        const { data: task } = await supabase
          .from('tasks')
          .select('title')
          .eq('id', taskId)
          .single();
        
        await ActivityService.logActivity(
          'comment_added',
          taskId,
          user.id,
          { 
            taskTitle: task?.title || 'Task', 
            commentSnippet: messageText.slice(0, 60) + (messageText.length > 60 ? '...' : '') 
          }
        );

        // Also check if user typed mentions in the comment and dispatch mention alerts!
        await parseAndTriggerMentions({
          text: messageText,
          senderId: user.id,
          itemType: 'comment',
          itemId: newComment.id,
          taskTitle: task?.title || 'Task',
          relatedTaskId: taskId
        });
      } catch (activityErr) {
        console.warn('Failed to log comment activity or parse mentions', activityErr);
      }
    } catch (err) {
      console.error('Failed to post comment', err);
      setError('Could not post comment. Try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateComment = async (commentId, newMessage) => {
    try {
      setError('');
      const updated = await CommentService.updateComment(commentId, newMessage);
      
      // Optimistic update
      setComments((prev) =>
        prev.map((c) => (c.id === commentId ? updated : c))
      );
    } catch (err) {
      console.error('Failed to update comment', err);
      setError('Could not update comment.');
      throw err;
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      setError('');
      await CommentService.deleteComment(commentId);
      
      // Optimistic delete
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
      setError('Could not delete comment.');
      throw err;
    }
  };

  return (
    <div className={styles.threadContainer}>
      <h3 className={styles.sectionTitle}>Discussion Thread</h3>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {/* Composer Input Area moved above the feed list */}
      <CommentComposer
        currentUser={user}
        onAddComment={handleAddComment}
        loading={actionLoading}
      />

      {/* Message Feed list styled below the composer */}
      <div className={styles.feed} style={{ marginTop: '20px' }}>
        {loading ? (
          <>
            <CommentSkeleton />
            <CommentSkeleton />
          </>
        ) : comments.length > 0 ? (
          <AnimatePresence initial={false}>
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                currentUser={user}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))}
          </AnimatePresence>
        ) : (
          <CommentEmptyState />
        )}
      </div>
    </div>
  );
};

export default CommentThread;
