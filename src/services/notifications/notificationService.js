// Notification Service Layer Adapter
// Manages alert listings, read/archived states, user preferences, and automatic notifications generation.

import { supabase } from '../../lib/supabaseClient';

const STORAGE_KEYS = {
  NOTIFICATIONS: 'mediaflow_notifications',
  PREFS: 'mediaflow_notification_preferences'
};

let useFallback = false;

// Mock Seed Data for Notifications
const SEED_NOTIFICATIONS = [
  {
    id: 'notify-1',
    user_id: 'user-muhammad',
    type: 'task_assigned',
    category: 'action_required',
    title: 'New Task Assigned',
    message: 'You were assigned to "Friday Program Poster".',
    related_task_id: 'task-1',
    is_read: false,
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: 'notify-2',
    user_id: 'user-muhammad',
    type: 'review_requested',
    category: 'action_required',
    title: 'Review Requested',
    message: 'Sinan requested review for "Weekly Quran Circle Flyer".',
    related_task_id: 'task-2',
    is_read: false,
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  },
  {
    id: 'notify-3',
    user_id: 'user-muhammad',
    type: 'approved',
    category: 'workflow_update',
    title: 'Task Approved',
    message: '"Hadith Slides Set" has been approved.',
    related_task_id: 'task-3',
    is_read: true,
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
  },
  {
    id: 'notify-4',
    user_id: 'user-muhammad',
    type: 'new_idea',
    category: 'team_hub',
    title: 'New Idea Pitched',
    message: 'Sinan pitched a new concept: "Dawah Street Video Series".',
    is_read: false,
    is_archived: false,
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() // 5 hours ago
  }
];

const DEFAULT_PREFS = {
  push_enabled: true,
  email_enabled: false,
  mentions: true,
  review_requests: true,
  assignments: true,
  approvals: true,
  publishing_updates: true,
  team_hub_updates: true
};

// Helper custom notification factory
export const createCustomNotification = async ({
  userId,
  type,
  category,
  title,
  message,
  relatedTaskId = null,
  metadata = {}
}) => {
  try {
    const prefs = await NotificationService.getPreferences(userId);
    
    // Preference checks
    if (type === 'task_assigned' && !prefs.assignments) return null;
    if (type === 'review_requested' && !prefs.review_requests) return null;
    if (type === 'changes_requested' && !prefs.review_requests) return null;
    if (type === 'approved' && !prefs.approvals) return null;
    if (type === 'published' && !prefs.publishing_updates) return null;
    if (type === 'completed' && !prefs.publishing_updates) return null;
    if (type === 'mention' && !prefs.mentions) return null;
    if (category === 'team_hub' && !prefs.team_hub_updates) return null;

    const newNotification = {
      user_id: userId,
      type,
      category,
      title,
      message,
      related_task_id: relatedTaskId,
      is_read: false,
      is_archived: false,
      metadata,
      created_at: new Date().toISOString()
    };

    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      const saved = { ...newNotification, id: `notify-${Date.now()}` };
      list.unshift(saved);
      NotificationService.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
      
      // Trigger push simulation if enabled
      if (prefs.push_enabled && (category === 'mention' || category === 'action_required')) {
        import('./PushNotificationManager').then(({ PushNotificationManager }) => {
          PushNotificationManager.showSimulatedBanner(saved);
        });
      }
      
      window.dispatchEvent(new Event('notifications_updated'));
      return saved;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotification])
        .select()
        .single();
      if (error) throw error;
      
      if (prefs.push_enabled && (category === 'mention' || category === 'action_required')) {
        import('./PushNotificationManager').then(({ PushNotificationManager }) => {
          PushNotificationManager.showSimulatedBanner(data);
        });
      }
      
      window.dispatchEvent(new Event('notifications_updated'));
      return data;
    } catch (err) {
      console.warn('Supabase notification insert failed, falling back to LocalStorage', err);
      useFallback = true;
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      const saved = { ...newNotification, id: `notify-${Date.now()}` };
      list.unshift(saved);
      NotificationService.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
      
      if (prefs.push_enabled && (category === 'mention' || category === 'action_required')) {
        import('./PushNotificationManager').then(({ PushNotificationManager }) => {
          PushNotificationManager.showSimulatedBanner(saved);
        });
      }

      window.dispatchEvent(new Event('notifications_updated'));
      return saved;
    }
  } catch (err) {
    console.error('Failed to create custom notification', err);
  }
};

// Parses text for @Username patterns and dispatches custom mention notifications
export const parseAndTriggerMentions = async ({
  text,
  senderId,
  itemType, // 'task' | 'comment' | 'idea' | 'plan' | 'discussion'
  itemId,
  taskTitle = null,
  relatedTaskId = null
}) => {
  if (!text) return [];

  // Regex to extract @Username tokens (including standard spaced full names)
  const regex = /@([A-Za-z0-9_.-]+(?:\s[A-Za-z0-9_.-]+)?)/g;
  let match;
  const mentions = new Set();

  while ((match = regex.exec(text)) !== null) {
    const rawName = match[1].trim();
    if (rawName) {
      mentions.add(rawName.toLowerCase());
    }
  }

  if (mentions.size === 0) return [];

  try {
    const { data: users } = await supabase
      .from('users')
      .select('id, name')
      .order('name');

    const list = users || [];
    const triggered = [];

    for (const username of mentions) {
      const matchedUser = list.find((u) => 
        u.name.toLowerCase() === username || 
        u.name.toLowerCase().startsWith(username)
      );

      if (matchedUser && matchedUser.id !== senderId) {
        const senderName = list.find((u) => u.id === senderId)?.name || 'Someone';
        const contextTitle = taskTitle || 'Team Hub';
        
        const notify = await createCustomNotification({
          userId: matchedUser.id,
          type: 'mention',
          category: 'mention',
          title: '💬 Mentioned',
          message: `${senderName} mentioned you in "${contextTitle}".`,
          relatedTaskId,
          metadata: {
            item_type: itemType,
            item_id: itemId,
            sender_id: senderId
          }
        });
        
        if (notify) {
          triggered.push(matchedUser.id);
        }
      }
    }
    return triggered;
  } catch (err) {
    console.warn('Failed to parse or trigger mention notifications', err);
    return [];
  }
};

// Upgrade existing activity logger notification generator
export const createNotificationsForActivity = async (activity) => {
  const { action, task_id, user_id, metadata } = activity;
  const meta = metadata || {};

  try {
    const { data: task, error } = await supabase
      .from('tasks')
      .select('title, assigned_to, created_by')
      .eq('id', task_id)
      .single();

    if (error || !task) return;

    switch (action) {
      case 'task_assigned':
        await createCustomNotification({
          userId: task.assigned_to,
          type: 'task_assigned',
          category: 'action_required',
          title: 'New Task Assigned',
          message: `You were assigned to "${task.title}".`,
          relatedTaskId: task_id,
          metadata: { item_type: 'task', item_id: task_id }
        });
        break;

      case 'status_changed':
        if (meta.newStatus === 'ready_for_review') {
          await createCustomNotification({
            userId: task.created_by,
            type: 'review_requested',
            category: 'action_required',
            title: 'Review Requested',
            message: `Task "${task.title}" is ready for review.`,
            relatedTaskId: task_id,
            metadata: { item_type: 'task', item_id: task_id }
          });
        } else if (meta.newStatus === 'working' && meta.previousStatus === 'reviewing') {
          await createCustomNotification({
            userId: task.assigned_to,
            type: 'changes_requested',
            category: 'action_required',
            title: 'Changes Requested',
            message: `Changes were requested on "${task.title}".`,
            relatedTaskId: task_id,
            metadata: { item_type: 'task', item_id: task_id }
          });
        } else if (meta.newStatus === 'approved') {
          await createCustomNotification({
            userId: task.assigned_to,
            type: 'approved',
            category: 'workflow_update',
            title: 'Task Approved',
            message: `"${task.title}" has been approved.`,
            relatedTaskId: task_id,
            metadata: { item_type: 'task', item_id: task_id }
          });
        } else if (meta.newStatus === 'published') {
          await createCustomNotification({
            userId: task.assigned_to,
            type: 'published',
            category: 'workflow_update',
            title: 'Task Published',
            message: `"${task.title}" has been published.`,
            relatedTaskId: task_id,
            metadata: { item_type: 'task', item_id: task_id }
          });
        } else if (meta.newStatus === 'completed') {
          await Promise.all([
            createCustomNotification({
              userId: task.assigned_to,
              type: 'completed',
              category: 'workflow_update',
              title: 'Task Completed',
              message: `"${task.title}" is marked as completed.`,
              relatedTaskId: task_id,
              metadata: { item_type: 'task', item_id: task_id }
            }),
            createCustomNotification({
              userId: task.created_by,
              type: 'completed',
              category: 'workflow_update',
              title: 'Task Completed',
              message: `"${task.title}" is marked as completed.`,
              relatedTaskId: task_id,
              metadata: { item_type: 'task', item_id: task_id }
            })
          ]);
        }
        break;

      case 'comment_added':
        const notifyTarget = user_id === task.assigned_to ? task.created_by : task.assigned_to;
        // Only trigger if not a self-comment
        if (notifyTarget && notifyTarget !== user_id) {
          await createCustomNotification({
            userId: notifyTarget,
            type: 'comment_added',
            category: 'workflow_update',
            title: 'New Comment Added',
            message: `New comment on "${task.title}": "${meta.commentSnippet || ''}"`,
            relatedTaskId: task_id,
            metadata: { item_type: 'task', item_id: task_id }
          });
        }
        break;

      case 'file_uploaded':
        await createCustomNotification({
          userId: task.created_by,
          type: 'file_uploaded',
          category: 'workflow_update',
          title: 'Deliverable Uploaded',
          message: `A file was uploaded for "${task.title}".`,
          relatedTaskId: task_id,
          metadata: { item_type: 'task', item_id: task_id }
        });
        break;

      default:
        break;
    }
  } catch (err) {
    console.warn('Failed to generate categorized notifications from activity trigger', err);
  }
};

// --------------------------------------------------
// UPGRADED SERVICE IMPLEMENTATION
// --------------------------------------------------
export const NotificationService = {
  getLocal: (key) => {
    try {
      const v = localStorage.getItem(key);
      if (!v) {
        if (key === STORAGE_KEYS.NOTIFICATIONS) {
          localStorage.setItem(key, JSON.stringify(SEED_NOTIFICATIONS));
          return SEED_NOTIFICATIONS;
        }
        if (key === STORAGE_KEYS.PREFS) {
          localStorage.setItem(key, JSON.stringify(DEFAULT_PREFS));
          return DEFAULT_PREFS;
        }
        return [];
      }
      return JSON.parse(v);
    } catch {
      return [];
    }
  },

  setLocal: (key, val) => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  },

  getNotifications: async (userId, filters = {}) => {
    if (useFallback) {
      let list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      
      // Filter out archived notifications unless specifically asking for archived
      if (filters.category === 'archived') {
        list = list.filter(n => n.is_archived);
      } else {
        list = list.filter(n => !n.is_archived);
        if (filters.category) {
          list = list.filter(n => n.category === filters.category);
        }
      }

      if (filters.isRead !== undefined) {
        list = list.filter(n => n.is_read === filters.isRead);
      }
      
      if (filters.search) {
        const term = filters.search.toLowerCase();
        list = list.filter(n => 
          n.title.toLowerCase().includes(term) || 
          n.message.toLowerCase().includes(term)
        );
      }

      return list;
    }

    try {
      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters.category === 'archived') {
        query = query.eq('is_archived', true);
      } else {
        query = query.eq('is_archived', false);
        if (filters.category) {
          query = query.eq('category', filters.category);
        }
      }

      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,message.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase query failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.getNotifications(userId, filters);
    }
  },

  markAsRead: async (id) => {
    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      const item = list.find(n => n.id === id);
      if (item) {
        item.is_read = true;
        item.read_at = new Date().toISOString();
        NotificationService.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
        window.dispatchEvent(new Event('notifications_updated'));
      }
      return item;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      window.dispatchEvent(new Event('notifications_updated'));
      return data;
    } catch (err) {
      console.warn('Supabase mark read failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.markAsRead(id);
    }
  },

  archiveNotification: async (id) => {
    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      const item = list.find(n => n.id === id);
      if (item) {
        item.is_archived = true;
        item.archived_at = new Date().toISOString();
        NotificationService.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
        window.dispatchEvent(new Event('notifications_updated'));
      }
      return item;
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      window.dispatchEvent(new Event('notifications_updated'));
      return data;
    } catch (err) {
      console.warn('Supabase archive failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.archiveNotification(id);
    }
  },

  markAllAsRead: async (userId) => {
    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      list.forEach(n => {
        if (n.user_id === userId) {
          n.is_read = true;
          n.read_at = new Date().toISOString();
        }
      });
      NotificationService.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
      window.dispatchEvent(new Event('notifications_updated'));
      return true;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId);

      if (error) throw error;
      window.dispatchEvent(new Event('notifications_updated'));
      return true;
    } catch (err) {
      console.warn('Supabase mark all read failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.markAllAsRead(userId);
    }
  },

  archiveAllRead: async (userId) => {
    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      list.forEach(n => {
        if (n.user_id === userId && n.is_read) {
          n.is_archived = true;
          n.archived_at = new Date().toISOString();
        }
      });
      NotificationService.setLocal(STORAGE_KEYS.NOTIFICATIONS, list);
      window.dispatchEvent(new Event('notifications_updated'));
      return true;
    }

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_archived: true, archived_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('is_read', true);

      if (error) throw error;
      window.dispatchEvent(new Event('notifications_updated'));
      return true;
    } catch (err) {
      console.warn('Supabase archive all read failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.archiveAllRead(userId);
    }
  },

  getUnreadCount: async (userId) => {
    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      return list.filter(n => n.user_id === userId && !n.is_read && !n.is_archived).length;
    }

    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_archived', false)
        .eq('is_read', false);

      if (error) throw error;
      return count || 0;
    } catch (err) {
      console.warn('Supabase unread count failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.getUnreadCount(userId);
    }
  },

  getUnreadCountByCategory: async (userId) => {
    if (useFallback) {
      const list = NotificationService.getLocal(STORAGE_KEYS.NOTIFICATIONS);
      const unread = list.filter(n => n.user_id === userId && !n.is_read && !n.is_archived);
      return {
        action_required: unread.filter(n => n.category === 'action_required' || n.category === 'mention').length,
        workflow_update: unread.filter(n => n.category === 'workflow_update').length,
        team_hub: unread.filter(n => n.category === 'team_hub').length
      };
    }

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('category, is_read, is_archived')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .eq('is_read', false);

      if (error) throw error;

      const counts = { action_required: 0, workflow_update: 0, team_hub: 0 };
      data.forEach(n => {
        const cat = n.category === 'mention' ? 'action_required' : n.category;
        if (counts[cat] !== undefined) {
          counts[cat]++;
        }
      });
      return counts;
    } catch (err) {
      console.warn('Supabase category count failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.getUnreadCountByCategory(userId);
    }
  },

  // PREFERENCES ADAPTERS
  getPreferences: async (userId) => {
    if (useFallback) {
      const prefs = localStorage.getItem(STORAGE_KEYS.PREFS);
      return prefs ? JSON.parse(prefs) : DEFAULT_PREFS;
    }

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      // If table exists but user has no preferences row, insert default preference row
      if (error && error.code === 'PGRST116') {
        const { data: newPrefs, error: insertError } = await supabase
          .from('notification_preferences')
          .insert([{ user_id: userId, ...DEFAULT_PREFS }])
          .select()
          .single();
        if (insertError) throw insertError;
        return newPrefs;
      }

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase preferences query failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.getPreferences(userId);
    }
  },

  updatePreferences: async (userId, profileData) => {
    if (useFallback) {
      localStorage.setItem(STORAGE_KEYS.PREFS, JSON.stringify(profileData));
      return profileData;
    }

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(profileData)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase preferences update failed, falling back to LocalStorage', err);
      useFallback = true;
      return NotificationService.updatePreferences(userId, profileData);
    }
  }
};

export default NotificationService;
