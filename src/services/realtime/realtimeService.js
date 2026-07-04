// Realtime Collaboration Service Layer Adapter
// Coordinates WebSocket channels via Supabase Postgres changes.

import { supabase } from '../../lib/supabaseClient';

// --------------------------------------------------
// CENTRAL EVENT BUS MANAGER
// --------------------------------------------------
class EventBus {
  constructor() {
    this.channels = new Map();
    this.statusListeners = new Set();
    this.connectionStatus = 'connected'; // 'connected' | 'reconnecting' | 'offline'
  }

  subscribe(channelName, subscriptionId, callback) {
    if (!this.channels.has(channelName)) {
      this.channels.set(channelName, new Map());
    }
    this.channels.get(channelName).set(subscriptionId, callback);
    
    // Return unsubscribe callback
    return () => this.unsubscribe(channelName, subscriptionId);
  }

  unsubscribe(channelName, subscriptionId) {
    if (this.channels.has(channelName)) {
      this.channels.get(channelName).delete(subscriptionId);
    }
  }

  broadcast(channelName, eventPayload) {
    if (this.channels.has(channelName)) {
      const listeners = this.channels.get(channelName);
      for (const cb of listeners.values()) {
        try {
          cb(eventPayload);
        } catch (err) {
          console.error(`Error in event callback for channel ${channelName}:`, err);
        }
      }
    }
  }

  subscribeToConnectionStatus(callback) {
    this.statusListeners.add(callback);
    callback(this.connectionStatus);
    return () => this.statusListeners.delete(callback);
  }

  updateConnectionStatus(status) {
    this.connectionStatus = status;
    for (const cb of this.statusListeners) {
      cb(status);
    }
  }
}

export const realtimeBus = new EventBus();

// --------------------------------------------------
// SUPABASE REALTIME SERVICE INITIALIZATION
// --------------------------------------------------
let supabaseChannel = null;

const initSupabaseRealtime = () => {
  if (!supabase || supabaseChannel) return;

  // Track network connectivity states
  window.addEventListener('online', () => realtimeBus.updateConnectionStatus('connected'));
  window.addEventListener('offline', () => realtimeBus.updateConnectionStatus('offline'));

  supabaseChannel = supabase
    .channel('public-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
      realtimeBus.broadcast('tasks', payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
      realtimeBus.broadcast('comments', payload);
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, (payload) => {
      realtimeBus.broadcast('notifications', payload);
      window.dispatchEvent(new Event('notifications_updated'));
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_logs' }, (payload) => {
      realtimeBus.broadcast('activity_logs', payload);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        realtimeBus.updateConnectionStatus('connected');
      } else if (status === 'TIMED_OUT' || status === 'CLOSED') {
        realtimeBus.updateConnectionStatus('reconnecting');
      }
    });
};

// Initialize service listeners on module load
initSupabaseRealtime();

// --------------------------------------------------
// EXPORT COMPATIBLE INTERFACE
// --------------------------------------------------
export const RealtimeService = {
  getConnectionStatus: () => realtimeBus.connectionStatus,
  
  subscribeToTasks: (subId, callback) => {
    return realtimeBus.subscribe('tasks', subId, callback);
  },

  subscribeToComments: (subId, callback) => {
    return realtimeBus.subscribe('comments', subId, callback);
  },

  subscribeToNotifications: (subId, callback) => {
    return realtimeBus.subscribe('notifications', subId, callback);
  },

  subscribeToActivities: (subId, callback) => {
    return realtimeBus.subscribe('activity_logs', subId, callback);
  }
};

export default RealtimeService;
