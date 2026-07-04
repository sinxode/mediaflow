import { useEffect } from 'react';
import { RealtimeService } from '../services/realtime/realtimeService';

export const useRealtimeTask = (taskId, callback) => {
  useEffect(() => {
    if (!taskId || !callback) return;

    const subId = `task-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const unsubscribe = RealtimeService.subscribeToTasks(subId, (payload) => {
      // Filter updates matching this task ID
      const updatedId = payload.new?.id || payload.old?.id;
      if (updatedId === taskId) {
        callback(payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [taskId, callback]);
};

export const useRealtimeTasksList = (callback) => {
  useEffect(() => {
    if (!callback) return;

    const subId = `tasks-list-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const unsubscribe = RealtimeService.subscribeToTasks(subId, (payload) => {
      callback(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [callback]);
};

export const useRealtimeComments = (taskId, callback) => {
  useEffect(() => {
    if (!taskId || !callback) return;

    const subId = `comment-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const unsubscribe = RealtimeService.subscribeToComments(subId, (payload) => {
      const targetId = payload.new?.task_id || payload.old?.task_id;
      if (targetId === taskId) {
        callback(payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [taskId, callback]);
};

export const useRealtimeNotifications = (userId, callback) => {
  useEffect(() => {
    if (!userId || !callback) return;

    const subId = `notify-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const unsubscribe = RealtimeService.subscribeToNotifications(subId, (payload) => {
      const targetId = payload.new?.user_id || payload.old?.user_id;
      if (targetId === userId) {
        callback(payload);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [userId, callback]);
};

export const useRealtimeActivities = (filters = {}, callback) => {
  useEffect(() => {
    if (!callback) return;

    const subId = `activity-sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;

    const unsubscribe = RealtimeService.subscribeToActivities(subId, (payload) => {
      const log = payload.new || payload.old;
      
      // Filter checks
      if (filters.taskId && log.task_id !== filters.taskId) return;
      if (filters.userId && log.user_id !== filters.userId) return;
      
      callback(payload);
    });

    return () => {
      unsubscribe();
    };
  }, [filters.taskId, filters.userId, callback]);
};
