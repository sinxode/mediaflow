import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, ShieldAlert, Sparkles, ClipboardList } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import ArchiveStats from './components/ArchiveStats';
import ArchiveFilters from './components/ArchiveFilters';
import ArchiveCard from './components/ArchiveCard';
import ArchiveActivityFeed from './components/ArchiveActivityFeed';
import ArchiveSkeleton from './components/ArchiveSkeleton';
import TaskDetails from '../TaskDetails/TaskDetails';
import { TaskService } from '../../services/tasks/taskService';
import { ActivityService } from '../../services/activity/activityService';
import { CommentService } from '../../services/comments/commentService';
import { useRealtimeTasksList } from '../../hooks/useRealtime';
import { useSearchParams } from 'react-router-dom';
import {
  pageVariants,
  containerVariants,
  fadeUpVariants
} from '../../utils/animations';
import styles from './Published.module.scss';

const getGroupForDate = (dateString) => {
  if (!dateString) return 'Older';
  const date = new Date(dateString);
  const now = new Date();
  
  // Calculate difference in days
  const diffTime = Math.abs(now.setHours(0,0,0,0) - date.setHours(0,0,0,0));
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays <= 7) return 'This Week';
  if (diffDays <= 30) return 'This Month';
  return 'Older';
};

const Published = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdParam = searchParams.get('id');

  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const selectedTask = tasks.find((t) => t.id === taskIdParam) || null;

  const loadArchiveData = async (showSkeleton = true) => {
    try {
      if (showSkeleton) setIsLoading(true);
      const list = await TaskService.getTasks();
      const commentCounts = await CommentService.getCommentsCounts();
      
      // Only published or completed tasks appear in the archive list
      const releasedTasks = list
        .filter((t) => t.status === 'published' || t.status === 'completed')
        .map((task) => ({
          ...task,
          publishedBy: task.assignee?.name || 'Workspace Editor',
          creator: task.creator?.name || 'Workspace Manager',
          completedDate: task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'N/A',
          publishedDate: task.created_at ? new Date(task.created_at).toLocaleDateString() : 'N/A',
          commentsCount: commentCounts[task.id] || 0,
          group: getGroupForDate(task.updated_at)
        }));
        
      setTasks(releasedTasks);

      // Fetch real activities
      const allLogs = await ActivityService.getActivityLogs({});
      const publishedLogs = allLogs
        .filter((log) => log.action === 'status_changed' && (log.details?.newStatus === 'published' || log.details?.newStatus === 'completed'))
        .map((log) => {
          const actionText = log.details?.newStatus === 'published' ? 'published deliverable' : 'moved status to completed on';
          return {
            id: log.id,
            user: log.userName || 'System',
            action: actionText,
            target: log.details?.taskTitle ? `"${log.details.taskTitle}"` : 'Task Item',
            time: new Date(log.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })
          };
        })
        .slice(0, 5);
      setActivities(publishedLogs);
    } catch (err) {
      console.error('Failed to load archive files list', err);
    } finally {
      if (showSkeleton) setIsLoading(false);
    }
  };

  // Load released tasks from database on mount
  useEffect(() => {
    loadArchiveData(true);

    // Background polling fallback every 4 seconds
    const interval = setInterval(async () => {
      loadArchiveData(false);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRealtimeArchiveUpdate = useCallback(() => {
    loadArchiveData(false);
  }, []);

  useRealtimeTasksList(handleRealtimeArchiveUpdate);

  // Filter effect
  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory =
        categoryFilter === '' || task.category === categoryFilter;
        
      const matchesUser =
        userFilter === '' ||
        task.publishedBy.toLowerCase().includes(userFilter.toLowerCase()) ||
        task.creator.toLowerCase().includes(userFilter.toLowerCase());
        
      const matchesStatus =
        statusFilter === '' || task.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesCategory && matchesUser && matchesStatus;
    });

    setFilteredTasks(filtered);
  }, [searchQuery, categoryFilter, userFilter, statusFilter, tasks]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setUserFilter('');
    setStatusFilter('');
  };

  const handleOpenTask = (task) => {
    setSearchParams({ id: task.id });
  };

  // Group filtered tasks by timeline categories
  const timelineGroups = ['Today', 'Yesterday', 'This Week', 'This Month', 'Older'];
  
  // Computes Stats dynamically
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const publishedToday = tasks.filter(
    (t) => (t.status === 'published' || t.status === 'completed') && new Date(t.updated_at || t.created_at) >= startOfToday
  ).length;

  const publishedThisWeek = tasks.filter(
    (t) => (t.status === 'published' || t.status === 'completed') && new Date(t.updated_at || t.created_at) >= startOfWeek
  ).length;

  const publishedThisMonth = tasks.filter(
    (t) => (t.status === 'published' || t.status === 'completed') && new Date(t.updated_at || t.created_at) >= startOfMonth
  ).length;

  const totalArchived = tasks.length;

  const stats = {
    publishedToday,
    publishedThisWeek,
    publishedThisMonth,
    totalArchive: totalArchived
  };

  // Calculate Archive Insights dynamically
  const creators = tasks.map((t) => t.creator?.name || t.creatorName).filter(Boolean);
  const creatorCounts = {};
  creators.forEach((c) => { creatorCounts[c] = (creatorCounts[c] || 0) + 1; });
  const activeCreator = Object.keys(creatorCounts).reduce((a, b) => creatorCounts[a] > creatorCounts[b] ? a : b, 'N/A');

  const reviewers = tasks.map((t) => t.assignee?.name || t.publishedBy).filter(Boolean);
  const reviewerCounts = {};
  reviewers.forEach((r) => { reviewerCounts[r] = (reviewerCounts[r] || 0) + 1; });
  const activeReviewer = Object.keys(reviewerCounts).reduce((a, b) => reviewerCounts[a] > reviewerCounts[b] ? a : b, 'N/A');

  const categoriesList = tasks.map((t) => t.category).filter(Boolean);
  const categoryCounts = {};
  categoriesList.forEach((cat) => { categoryCounts[cat] = (categoryCounts[cat] || 0) + 1; });
  const topCategory = Object.keys(categoryCounts).reduce((a, b) => categoryCounts[a] > categoryCounts[b] ? a : b, 'N/A');

  const insights = {
    activeCreator,
    activeReviewer,
    topCategory,
    avgTime: '2.4 Days'
  };

  const categories = [
    'Poster Design',
    'Video Editing',
    'Thumbnail Design',
    'Photography',
    'Documentation',
    'Social Media Post'
  ];

  // If task details modal/view is active, render it inline
  if (selectedTask) {
    return (
      <TaskDetails
        taskId={selectedTask.id}
        onBack={() => setSearchParams({})}
      />
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.archivePage}
    >
      {/* Page Header */}
      <PageHeader
        title="Published & Archive"
        description="View completed and published workflow items."
      />

      {/* Overview stats */}
      <div className={styles.statsSection}>
        <ArchiveStats stats={stats} />
      </div>

      {/* Advanced search and dropdown chips */}
      <div className={styles.filtersSection}>
        <ArchiveFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          userFilter={userFilter}
          setUserFilter={setUserFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          categories={categories}
        />
      </div>

      {/* Two column grid layout */}
      <div className={styles.workspaceGrid}>
        {/* Left Column: Timeline feed */}
        <div className={styles.timelineColumn}>
          {isLoading ? (
            <ArchiveSkeleton count={3} />
          ) : filteredTasks.length > 0 ? (
            <div className={styles.timelineSectionsList}>
              {timelineGroups.map((group) => {
                const groupTasks = filteredTasks.filter((t) => t.group === group);
                if (groupTasks.length === 0) return null;
                
                return (
                  <div key={group} className={styles.timelineGroup}>
                    <h3 className={styles.groupHeader}>
                      <span className={styles.line} />
                      <span className={styles.groupText}>{group}</span>
                      <span className={styles.line} />
                    </h3>
                    <motion.div
                      variants={containerVariants}
                      initial="initial"
                      animate="animate"
                      className={styles.cardsList}
                    >
                      {groupTasks.map((task) => (
                        <motion.div key={task.id} variants={fadeUpVariants}>
                          <ArchiveCard task={task} onOpenTask={handleOpenTask} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </div>
                );
              })}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <EmptyState
                title="No Released Content Found"
                description="Adjust your search and filter criteria or reset filters."
                icon={<ClipboardList />}
                action={
                  <Button variant="secondary" onClick={handleResetFilters}>
                    Clear Filters
                  </Button>
                }
              />
            </motion.div>
          )}
        </div>

        {/* Right Column: Releases timeline and insights */}
        <div className={styles.sidebarColumn}>
          <ArchiveActivityFeed activities={activities} insights={insights} />
        </div>
      </div>
    </motion.div>
  );
};

export default Published;
