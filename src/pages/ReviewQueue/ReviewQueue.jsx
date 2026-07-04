import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert, Sparkles, ClipboardList } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import ReviewMetrics from './components/ReviewMetrics';
import ReviewTabs from './components/ReviewTabs';
import ReviewCard from './components/ReviewCard';
import ReviewActivityFeed from './components/ReviewActivityFeed';
import ReviewSkeleton from './components/ReviewSkeleton';
import TaskDetails from '../TaskDetails/TaskDetails';
import { TaskService } from '../../services/tasks/taskService';
import { ActivityService } from '../../services/activity/activityService';
import { CommentService } from '../../services/comments/commentService';
import { useRealtimeTasksList } from '../../hooks/useRealtime';
import { STATUSES } from '../../constants';
import {
  pageVariants,
  containerVariants,
  fadeUpVariants
} from '../../utils/animations';
import { useSearchParams } from 'react-router-dom';
import styles from './ReviewQueue.module.scss';

const ReviewQueue = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdParam = searchParams.get('id');

  const [tasks, setTasks] = useState([]);
  const selectedTask = tasks.find((t) => t.id === taskIdParam) || null;
  const [stats, setStats] = useState({
    readyReview: 0,
    changesRequested: 0,
    approved: 0,
    readyPublish: 0
  });

  const [productivity, setProductivity] = useState({
    approvedToday: 0,
    publishedToday: 0,
    avgReviewTime: '1.2 Hours'
  });
  const [activities, setActivities] = useState([]);

  // UI Filters
  const [activeTab, setActiveTab] = useState('ready-for-review');
  const [isLoading, setIsLoading] = useState(true);

  const loadQueueData = async () => {
    try {
      setIsLoading(true);
      const list = await TaskService.getTasks();
      const commentCounts = await CommentService.getCommentsCounts();
      
      // Filter and map database fields dynamically
      const queueList = list
        .filter((t) =>
          [STATUSES.READY_FOR_REVIEW, STATUSES.WORKING, STATUSES.APPROVED, STATUSES.PUBLISHED, STATUSES.COMPLETED].includes(t.status)
        )
        .map((t) => ({
          ...t,
          creatorName: t.creator?.name || 'Workspace Manager',
          submittedTime: t.file_uploaded_at 
            ? new Date(t.file_uploaded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) 
            : new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
          commentsCount: commentCounts[t.id] || 0,
          lastActivity: 'Recently'
        }));

      setTasks(queueList);

      // Load real activity logs
      const allLogs = await ActivityService.getActivityLogs({});
      const mappedLogs = allLogs
        .filter((log) => ['status_changed', 'task_assigned', 'task_created'].includes(log.action))
        .map((log) => {
          const actionText = log.action === 'status_changed' 
            ? `updated status to ${log.details?.newStatus || 'active'}`
            : log.action === 'task_assigned' 
              ? 'assigned' 
              : 'created';
          return {
            id: log.id,
            user: log.userName || 'System',
            action: actionText,
            target: log.details?.taskTitle ? `"${log.details.taskTitle}"` : 'Task',
            time: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
          };
        })
        .slice(0, 5);
      setActivities(mappedLogs);
    } catch (err) {
      console.error('Failed to load review queue tasks', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load released tasks from database
  useEffect(() => {
    loadQueueData();

    // Background polling fallback every 4 seconds
    const interval = setInterval(async () => {
      try {
        const list = await TaskService.getTasks();
        const commentCounts = await CommentService.getCommentsCounts();
        const queueList = list
          .filter((t) =>
            [STATUSES.READY_FOR_REVIEW, STATUSES.WORKING, STATUSES.APPROVED, STATUSES.PUBLISHED, STATUSES.COMPLETED].includes(t.status)
          )
          .map((t) => ({
            ...t,
            creatorName: t.creator?.name || 'Workspace Manager',
            submittedTime: t.file_uploaded_at 
              ? new Date(t.file_uploaded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) 
              : new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            commentsCount: commentCounts[t.id] || 0,
            lastActivity: 'Recently'
          }));

        setTasks((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(queueList)) return prev;
          return queueList;
        });

        const allLogs = await ActivityService.getActivityLogs({});
        const mappedLogs = allLogs
          .filter((log) => ['status_changed', 'task_assigned', 'task_created'].includes(log.action))
          .map((log) => {
            const actionText = log.action === 'status_changed' 
              ? `updated status to ${log.details?.newStatus || 'active'}`
              : log.action === 'task_assigned' 
                ? 'assigned' 
                : 'created';
            return {
              id: log.id,
              user: log.userName || 'System',
              action: actionText,
              target: log.details?.taskTitle ? `"${log.details.taskTitle}"` : 'Task',
              time: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
            };
          })
          .slice(0, 5);
        
        setActivities((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(mappedLogs)) return prev;
          return mappedLogs;
        });
      } catch (err) {
        console.error('Failed to poll review queue data', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [activeTab]);

  const handleRealtimeQueueUpdate = useCallback(() => {
    const refreshQueue = async () => {
      try {
        const list = await TaskService.getTasks();
        const queueList = list
          .filter((t) =>
            [STATUSES.READY_FOR_REVIEW, STATUSES.WORKING, STATUSES.APPROVED, STATUSES.PUBLISHED, STATUSES.COMPLETED].includes(t.status)
          )
          .map((t) => ({
            ...t,
            creatorName: t.creator?.name || 'Workspace Manager',
            submittedTime: t.file_uploaded_at 
              ? new Date(t.file_uploaded_at).toLocaleDateString([], { month: 'short', day: 'numeric' }) 
              : new Date(t.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
            commentsCount: 0,
            lastActivity: 'Recently'
          }));

        setTasks(queueList);
      } catch (err) {
        console.error('Failed to refresh review queue in real-time', err);
      }
    };
    refreshQueue();
  }, []);

  useRealtimeTasksList(handleRealtimeQueueUpdate);

  // Recalculate metrics on state changes
  useEffect(() => {
    const readyReviewCount = tasks.filter((t) => t.status === STATUSES.READY_FOR_REVIEW).length;
    const changesCount = tasks.filter((t) => t.status === STATUSES.WORKING).length;
    const approvedCount = tasks.filter((t) => t.status === STATUSES.APPROVED).length;
    const readyPublishCount = tasks.filter((t) => t.status === STATUSES.PUBLISHED).length;

    setStats({
      readyReview: readyReviewCount,
      changesRequested: changesCount,
      approved: approvedCount,
      readyPublish: readyPublishCount
    });
  }, [tasks]);

  const handleCardClick = (task) => {
    setSearchParams({ id: task.id });
  };

  // Status transitions triggered from quick actions
  const handleQuickAction = async (taskId, actionType) => {
    let nextStatus = '';
    let activityText = '';
    
    if (actionType === 'changes') {
      nextStatus = STATUSES.WORKING;
      activityText = 'requested changes on';
    } else if (actionType === 'approve') {
      nextStatus = STATUSES.APPROVED;
      activityText = 'approved task';
      setProductivity((prev) => ({ ...prev, approvedToday: prev.approvedToday + 1 }));
    } else if (actionType === 'publish') {
      nextStatus = STATUSES.PUBLISHED;
      activityText = 'marked as ready to publish';
    } else if (actionType === 'complete') {
      nextStatus = STATUSES.COMPLETED;
      activityText = 'completed task';
      setProductivity((prev) => ({ ...prev, publishedToday: prev.publishedToday + 1 }));
    }

    if (nextStatus) {
      try {
        await TaskService.updateTask(taskId, { status: nextStatus });
        
        // Reload list to sync stats and view updates
        await loadQueueData();

        // Append log to recent activity feed
        const targetTask = tasks.find((t) => t.id === taskId);
        const newLog = {
          id: `r-act-${Date.now()}`,
          user: 'Ameen', // Current reviewer
          action: activityText,
          target: `"${targetTask?.title}"`,
          time: 'Just now'
        };
        setActivities((prev) => [newLog, ...prev]);
      } catch (err) {
        console.error('Failed to execute workflow change', err);
      }
    }
  };

  // Filter tasks based on selected Segmented Tab
  const getFilteredTasks = () => {
    const tabStatusMap = {
      'ready-for-review': STATUSES.READY_FOR_REVIEW,
      'changes-requested': STATUSES.WORKING,
      'approved': STATUSES.APPROVED,
      'ready-to-publish': STATUSES.PUBLISHED,
      'completed': STATUSES.COMPLETED
    };
    const targetStatus = tabStatusMap[activeTab];
    return tasks.filter((task) => task.status === targetStatus);
  };

  const currentTabTasks = getFilteredTasks();

  // If task details modal/view is active, render it inline
  if (selectedTask) {
    return (
      <TaskDetails
        taskId={selectedTask.id}
        onBack={() => {
          setSearchParams({});
          loadQueueData(); // refresh list upon returning
        }}
      />
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.reviewPage}
    >
      {/* Page Header */}
      <PageHeader
        title="Review Queue"
        description="Manage submitted work, approvals, publishing, and completion."
      />

      {/* Summary Stats Metrics Cards Row */}
      <div className={styles.metricsSection}>
        <ReviewMetrics stats={stats} />
      </div>

      {/* Operations Segmented Tabs */}
      <div className={styles.tabsSection}>
        <ReviewTabs activeTab={activeTab} onChangeTab={setActiveTab} />
      </div>

      {/* Main Grid: Left Review Queue, Right Activity Log */}
      <div className={styles.workspaceGrid}>
        {/* Left Side: Queue Cards */}
        <div className={styles.queueColumn}>
          {isLoading ? (
            <ReviewSkeleton count={3} />
          ) : currentTabTasks.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className={styles.queueList}
            >
              {currentTabTasks.map((task) => (
                <motion.div key={task.id} variants={fadeUpVariants}>
                  <ReviewCard
                    task={task}
                    onAction={handleQuickAction}
                    onOpenTask={handleCardClick}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmptyState
                title="Queue Clear"
                description={`No items currently under "${activeTab.replace('-', ' ')}" filter status.`}
                icon={<ClipboardList />}
                action={
                  <Button variant="secondary" onClick={() => loadQueueData()}>
                    Refresh Queue
                  </Button>
                }
              />
            </motion.div>
          )}
        </div>

        {/* Right Side: Activity timeline log / Insights */}
        <div className={styles.sidebarColumn}>
          <ReviewActivityFeed activities={activities} metrics={productivity} />
        </div>
      </div>
    </motion.div>
  );
};

export default ReviewQueue;
