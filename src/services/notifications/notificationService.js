// Notification Service Layer Adapter
// Manages alert listings, read states, unread counts, and automatic generation from activity triggers.

import { supabase } from '../../lib/supabaseClient';

// --------------------------------------------------
// AUTOMATIC DATABASE-DRIVEN NOTIFICATION GENERATOR
// --------------------------------------------------
export const createNotificationsForActivity = async (activity) => {
  const { action, task_id, user_id, metadata } = activity;
  const meta = metadata || {};
  const notifications = [];

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('title, assigned_to, created_by')
      .eq('id', task_id)
      .single();

    if (error || !task) return;

    const addNotify = (targetUserId, type, title, message) => {
      if (!targetUserId) return;
      notifications.push({
        user_id: targetUserId,
        type,
        title,
        message,
        related_task_id: task_id,
        related_activity_id: activity.id,
        is_read: false
      });
    };

    switch (action) {
      case 'task_assigned':
        addNotify(
          task.assigned_to,
          'task_assigned',
          'New Task Assigned',
          `You were assigned to "${task.title}".`
        );
        break;

      case 'status_changed':
        if (meta.newStatus === 'ready_for_review') {
          addNotify(
            task.created_by,
            'review_requested',
            'Review Requested',
            `Task "${task.title}" is ready for review.`
          );
        } else if (meta.newStatus === 'working' && meta.previousStatus === 'reviewing') {
          addNotify(
            task.assigned_to,
            'changes_requested',
            'Changes Requested',
            `Changes were requested on "${task.title}".`
          );
        } else if (meta.newStatus === 'approved') {
          addNotify(
            task.assigned_to,
            'approved',
            'Task Approved',
            `"${task.title}" has been approved.`
          );
        } else if (meta.newStatus === 'published') {
          addNotify(
            task.assigned_to,
            'published',
            'Task Published',
            `"${task.title}" has been published.`
          );
        } else if (meta.newStatus === 'completed') {
          addNotify(task.assigned_to, 'completed', 'Task Completed', `"${task.title}" is marked as completed.`);
          addNotify(task.created_by, 'completed', 'Task Completed', `"${task.title}" is marked as completed.`);
        }
        break;

      case 'comment_added':
        const notifyTarget = user_id === task.assigned_to ? task.created_by : task.assigned_to;
        addNotify(
          notifyTarget,
          'comment_added',
          'New Comment Added',
          `New comment on "${task.title}": "${meta.commentSnippet || ''}"`
        );
        break;

      case 'file_uploaded':
        addNotify(
          task.created_by,
          'file_uploaded',
          'Deliverable Uploaded',
          `A file was uploaded for "${task.title}".`
        );
        break;

      default:
        break;
    }

    if (notifications.length > 0) {
      await supabase.from('notifications').insert(notifications);
    }
  } catch (err) {
    console.warn('Failed to generate real notifications from activity trigger', err);
  }
};

// --------------------------------------------------
// SUPABASE SERVICE IMPLEMENTATION
// --------------------------------------------------
export const NotificationService = {
  getNotifications: async (userId, filters = {}) => {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (filters.isRead !== undefined) {
      query = query.eq('is_read', filters.isRead);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  markAsRead: async (id) => {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  markAllAsRead: async (userId) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (error) throw error;
    return true;
  },

  getUnreadCount: async (userId) => {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  }
};

export default NotificationService;
