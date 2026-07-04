import React, { useState, useEffect } from 'react';
import { ActivityService } from '../../services/activity/activityService';
import { useRealtimeActivities } from '../../hooks/useRealtime';
import ActivityItem from './ActivityItem';
import ActivitySkeleton from './ActivitySkeleton';
import ActivityEmptyState from './ActivityEmptyState';
import styles from './ActivityFeed.module.scss';

const ActivityFeed = ({ taskId, userId, action, limit }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const filters = {};
      if (taskId) filters.taskId = taskId;
      if (userId) filters.userId = userId;
      if (action) filters.action = action;

      let allLogs = await ActivityService.getActivityLogs(filters);
      
      // Filter out chats or comments from timeline
      allLogs = allLogs.filter(log => !log.action.startsWith('comment_'));
      
      if (limit && limit > 0) {
        allLogs = allLogs.slice(0, limit);
      }
      
      setLogs(allLogs);
    } catch (err) {
      console.error('Failed to load activity logs', err);
      setError('Could not retrieve workspace activity logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();

    // Hybrid sync: background heartbeat polling every 4 seconds
    const interval = setInterval(async () => {
      try {
        const filters = {};
        if (taskId) filters.taskId = taskId;
        if (userId) filters.userId = userId;
        if (action) filters.action = action;

        let allLogs = await ActivityService.getActivityLogs(filters);
        
        // Filter out chats or comments from timeline
        allLogs = allLogs.filter(log => !log.action.startsWith('comment_'));
        
        if (limit && limit > 0) {
          allLogs = allLogs.slice(0, limit);
        }

        setLogs((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(allLogs)) return prev;
          return allLogs;
        });
      } catch (err) {
        console.error('Failed to poll activity logs', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [taskId, userId, action, limit]);

  // Hook live activities updates listener
  useRealtimeActivities({ taskId, userId }, (payload) => {
    if (payload.eventType === 'INSERT') {
      // Filter out comment actions
      if (payload.new.action.startsWith('comment_')) return;

      setLogs((prev) => {
        // Avoid duplicate logging checks
        if (prev.some((l) => l.id === payload.new.id)) return prev;

        const resolvedLog = {
          ...payload.new,
          userName: payload.new.user_id === 'u-creator' ? 'Muhammad' : 'Ameen'
        };

        const updated = [resolvedLog, ...prev];
        return limit ? updated.slice(0, limit) : updated;
      });
    }
  });

  return (
    <div className={styles.feedContainer}>
      {error && <div className={styles.errorAlert}>{error}</div>}

      <div className={styles.logsList}>
        {loading ? (
          <>
            <ActivitySkeleton />
            <ActivitySkeleton />
            <ActivitySkeleton />
          </>
        ) : logs.length > 0 ? (
          logs.map((log) => (
            <ActivityItem key={log.id} log={log} />
          ))
        ) : (
          <ActivityEmptyState />
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;
