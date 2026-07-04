// Activity Service Layer Adapter
// Tracks audit timelines and logs workflow activities using Supabase endpoints.

import { supabase } from '../../lib/supabaseClient';
import { createNotificationsForActivity } from '../notifications/notificationService';

// --------------------------------------------------
// 1. DYNAMIC METADATA RENDER ENGINE
// --------------------------------------------------
export const renderActivityText = (action, metadata) => {
  const meta = metadata || {};
  switch (action) {
    case 'task_created':
      return `created the task "${meta.taskTitle || 'New Task'}"`;
    case 'task_updated':
      return `updated task details for "${meta.taskTitle}"`;
    case 'task_assigned':
      return `assigned task "${meta.taskTitle}" to ${meta.newAssignee || 'Unassigned'}`;
    case 'status_changed':
      return `changed status of "${meta.taskTitle}" to "${meta.newStatus?.replace(/_/g, ' ')}"`;
    case 'comment_added':
      return `commented on "${meta.taskTitle}": "${meta.commentSnippet || ''}"`;
    case 'comment_edited':
      return `edited a comment on "${meta.taskTitle}"`;
    case 'comment_deleted':
      return `deleted a comment on "${meta.taskTitle}"`;
    case 'file_uploaded':
      return `uploaded file "${meta.fileName}" to task "${meta.taskTitle}"`;
    case 'file_replaced':
      return `replaced deliverable file with "${meta.fileName}" on task "${meta.taskTitle}"`;
    case 'approved':
      return `approved deliverable for "${meta.taskTitle}"`;
    case 'changes_requested':
      return `requested changes on "${meta.taskTitle}"`;
    case 'published':
      return `published deliverable for "${meta.taskTitle}"`;
    case 'completed':
      return `completed task "${meta.taskTitle}"`;
    case 'user_logged_in':
      return `logged into MediaFlow`;
    case 'user_logged_out':
      return `logged out of MediaFlow`;
    default:
      return `performed action ${action}`;
  }
};

// --------------------------------------------------
// 2. SUPABASE SERVICE IMPLEMENTATION
// --------------------------------------------------
export const ActivityService = {
  getActivityLogs: async (filters = {}) => {
    let query = supabase
      .from('activity_logs')
      .select('*, author:users(name, avatar_url)')
      .order('created_at', { ascending: false });

    if (filters.taskId) {
      query = query.eq('task_id', filters.taskId);
    }
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters.action) {
      query = query.eq('action', filters.action);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data.map((log) => ({
      ...log,
      userName: log.author?.name || 'User'
    }));
  },

  logActivity: async (action, taskId, userId, metadata) => {
    const payload = {
      action,
      task_id: taskId,
      user_id: userId,
      metadata
    };

    const { data, error } = await supabase
      .from('activity_logs')
      .insert([payload])
      .select()
      .single();

    if (error) throw error;

    // Automatic Notification Trigger
    try {
      await createNotificationsForActivity(data);
    } catch (err) {
      console.warn('Failed to trigger notifications for log', err);
    }
    
    return data;
  }
};

export default ActivityService;
