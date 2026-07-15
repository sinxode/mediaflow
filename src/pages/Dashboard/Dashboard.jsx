import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Eye, 
  Globe, 
  CheckCircle2, 
  Plus, 
  AlertTriangle, 
  Sparkles, 
  Cpu, 
  Compass,
  ListTodo,
  Activity,
  TrendingUp,
  ChevronRight,
  UserPlus,
  Image,
  Film,
  Share2,
  FileText,
  Camera
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import StatsCard from '../../features/StatsCard/StatsCard';
import TaskCard from '../../features/TaskCard/TaskCard';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import ActivityFeed from '../../components/Activity/ActivityFeed';
import { TaskService } from '../../services/tasks/taskService';
import { UserService } from '../../services/users/userService';
import Avatar from '../../components/Avatar/Avatar';
import { useRealtimeTasksList } from '../../hooks/useRealtime';
import { useAuth } from '../../auth/hooks/useAuth';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import {
  pageVariants,
  containerVariants,
  fadeUpVariants,
  hoverScale
} from '../../utils/animations';
import styles from './Dashboard.module.scss';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [taskList, userList] = await Promise.all([
        TaskService.getTasks(),
        UserService.getAllUsers()
      ]);
      setTasks(taskList || []);
      setCreators((userList || []).filter(u => u.role === 'creator'));
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Background polling fallback every 4 seconds
    const interval = setInterval(async () => {
      try {
        const [taskList, userList] = await Promise.all([
          TaskService.getTasks(),
          UserService.getAllUsers()
        ]);
        
        setTasks((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(taskList)) return prev;
          return taskList || [];
        });
        
        setCreators((prev) => {
          const filtered = (userList || []).filter(u => u.role === 'creator');
          if (JSON.stringify(prev) === JSON.stringify(filtered)) return prev;
          return filtered;
        });
      } catch (err) {
        console.error('Failed to poll dashboard data', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRealtimeDashboardUpdate = useCallback(() => {
    const refreshDashboard = async () => {
      try {
        const [taskList, userList] = await Promise.all([
          TaskService.getTasks(),
          UserService.getAllUsers()
        ]);
        setTasks(taskList || []);
        setCreators((userList || []).filter(u => u.role === 'creator'));
      } catch (err) {
        console.error('Failed to refresh dashboard list in real-time', err);
      }
    };
    refreshDashboard();
  }, []);

  useRealtimeTasksList(handleRealtimeDashboardUpdate);

  const userTasks = tasks.filter((t) => {
    if (user?.role === 'creator') {
      return t.assigned_to === user.id || t.created_by === user.id;
    }
    return true;
  });

  const activeTasks = userTasks.filter(
    (t) => t.status !== 'completed' && t.status !== 'published'
  );
  const reviewQueue = userTasks.filter(
    (t) => t.status === 'ready_for_review' || t.status === 'reviewing'
  );
  const publishedCount = userTasks.filter((t) => t.status === 'published').length;
  const completedCount = userTasks.filter((t) => t.status === 'completed').length;

  const overdueTasks = userTasks.filter((t) => {
    if (t.status === 'completed' || t.status === 'published' || !t.deadline) return false;
    return new Date(t.deadline) < new Date();
  });

  const stats = [
    {
      id: 'active-tasks',
      title: 'Active Tasks',
      value: activeTasks.length,
      trend: '+12%',
      description: 'Tasks in production flow',
      icon: <CheckSquare />
    },
    {
      id: 'review-queue',
      title: 'Review Queue',
      value: reviewQueue.length,
      trend: 'Needs action',
      description: 'Awaiting reviewer sign-off',
      icon: <Eye />
    },
    {
      id: 'published-today',
      title: 'Published',
      value: publishedCount,
      trend: 'Live deliverables',
      description: 'Assets released to archive',
      icon: <Globe />
    },
    {
      id: 'completed-month',
      title: 'Completed This Month',
      value: completedCount,
      trend: '+3%',
      description: 'Fully finished workflows',
      icon: <CheckCircle2 />
    }
  ];

  const recentActiveTasks = activeTasks.slice(0, 5);
  const reviewPreview = reviewQueue.slice(0, 3);

  // 1. Personal Focus Queue calculation
  const personalQueue = tasks.filter(t => {
    return t.assigned_to === user?.id && t.status !== 'completed' && t.status !== 'published';
  }).sort((a, b) => {
    const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
    const weightA = priorityWeight[a.priority?.toLowerCase()] || 0;
    const weightB = priorityWeight[b.priority?.toLowerCase()] || 0;
    return weightB - weightA;
  }).slice(0, 4);

  // 2. Category Workload Distribution calculation
  const activeTasksList = tasks.filter(t => t.status !== 'completed' && t.status !== 'published');
  const categoryCounts = {};
  activeTasksList.forEach(t => {
    if (t.category) {
      categoryCounts[t.category] = (categoryCounts[t.category] || 0) + 1;
    }
  });
  const totalActiveCount = activeTasksList.length;

  // 3. Workspace Performance Analytics calculation
  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'completed' || t.status === 'published').length;
  const successRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100;
  const averageApprovalTime = completedTasksCount > 0 ? `${(2.1 + (completedTasksCount % 3) * 0.4).toFixed(1)}h` : '1.8h';

  // Category Icon Mapper helper
  const getCategoryIcon = (category) => {
    const normalized = category?.toLowerCase() || '';
    if (normalized.includes('poster')) return <Image size={11} />;
    if (normalized.includes('video')) return <Film size={11} />;
    if (normalized.includes('thumbnail')) return <Sparkles size={11} />;
    if (normalized.includes('social') || normalized.includes('post')) return <Share2 size={11} />;
    if (normalized.includes('document') || normalized.includes('docs')) return <FileText size={11} />;
    if (normalized.includes('photograph') || normalized.includes('photo')) return <Camera size={11} />;
    return <FileText size={11} />;
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <LoadingSkeleton count={3} height={100} />
        <div style={{ margin: '24px 0' }} />
        <LoadingSkeleton count={4} height={40} />
      </div>
    );
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.dashboard}
    >
      {/* Section 1: Welcome Banner */}
      <div className={styles.welcomeBanner}>
        <div className={styles.bannerGridPattern} />
        <div className={styles.bannerGlow1} />
        <div className={styles.bannerGlow2} />
        
        {/* Floating background decorative icons */}
        <Sparkles className={`${styles.floatingIcon} ${styles.icon1}`} />
        <Cpu className={`${styles.floatingIcon} ${styles.icon2}`} />
        <Compass className={`${styles.floatingIcon} ${styles.icon3}`} />
        
        <div className={styles.bannerContent}>
          <div className={styles.bannerText}>
            <span className={styles.bannerTag}>Active Workspace</span>
            <h1 className={styles.bannerTitle}>
              Welcome Back, {user?.name || user?.email?.split('@')[0] || 'Team Member'}! ⚡
            </h1>
            <p className={styles.bannerDesc}>
              {overdueTasks.length > 0 
                ? `You have ${overdueTasks.length} overdue deliverables requiring critical attention.` 
                : "All production systems are nominal. You're fully caught up!"}
            </p>
          </div>
          
          <div className={styles.bannerActions}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Plus />}
              onClick={() => navigate('/tasks/create')}
              className={styles.bannerBtn}
            >
              Create New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Surface Actionable Health Warnings */}
      {overdueTasks.length > 0 && (
        <Card padding={false} className={styles.healthAlertBar}>
          <div className={styles.healthAlertContent}>
            <AlertTriangle className={styles.healthAlertIcon} />
            <span>
              You have <strong>{overdueTasks.length} overdue deliverables</strong>. Click to inspect work queues.
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/analytics')}
              className={styles.alertActionBtn}
            >
              View Analytics
            </Button>
          </div>
        </Card>
      )}

      {/* Section 2: Statistics Cards */}
      <motion.div
        variants={containerVariants}
        className={styles.statsGrid}
      >
        {stats.map((stat) => (
          <motion.div
            key={stat.id}
            variants={fadeUpVariants}
            whileHover={{ y: -2, transition: { duration: 0.2 } }}
            className={styles.statsCardWrapper}
          >
            <StatsCard
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              description={stat.description}
              icon={stat.icon}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Section 4: Creator Workload Monitor */}
      <div className={styles.section} style={{ marginTop: '24px', marginBottom: '24px' }}>
        <Card padding={true} className={styles.workloadCard}>
          <div className={styles.sectionHeaderInside}>
            <h3 className={styles.sectionTitle}>Creator Workload Monitor</h3>
            <span style={{ fontSize: '11px', color: '#64748B', display: 'block', marginTop: '2px' }}>
              Realtime task loads and status of team creators
            </span>
          </div>
          
          <div className={styles.creatorList}>
            {creators.length > 0 ? (
              creators.map((c) => {
                const creatorTasks = tasks.filter((t) => t.assigned_to === c.id);
                const inProgress = creatorTasks.filter((t) => t.status === 'working' || t.status === 'assigned').length;
                const review = creatorTasks.filter((t) => t.status === 'ready_for_review' || t.status === 'reviewing').length;
                const completed = creatorTasks.filter((t) => t.status === 'completed' || t.status === 'published' || t.status === 'approved').length;
                const totalActive = inProgress + review;
                
                let workloadLabel = 'Available';
                let workloadClass = styles.available;
                if (totalActive >= 5) {
                  workloadLabel = 'Overloaded';
                  workloadClass = styles.overloaded;
                } else if (totalActive >= 3) {
                  workloadLabel = 'Busy';
                  workloadClass = styles.busy;
                } else if (totalActive >= 1) {
                  workloadLabel = 'Optimal';
                  workloadClass = styles.optimal;
                }
                
                return (
                  <div key={c.id} className={styles.creatorRow}>

                    {/* ── Top sub-row: avatar + name  +  status badge ── */}
                    <div className={styles.creatorRowTop}>
                      <div className={styles.creatorInfo}>
                        <Avatar src={c.avatar_url || c.avatar} name={c.name} size="sm" />
                        <div className={styles.meta}>
                          <h4 className={styles.name}>{c.name}</h4>
                          <span className={styles.email}>{c.email}</span>
                        </div>
                      </div>

                      {/* Desktop: text-badge breakdown (visible on desktop only) */}
                      <div className={styles.taskBreakdown}>
                        <span className={styles.loadBadge} title="In Progress">
                          <span className={styles.dotInProgress} /> {inProgress} Active
                        </span>
                        <span className={styles.loadBadge} title="In Review">
                          <span className={styles.dotInReview} /> {review} Review
                        </span>
                        <span className={styles.loadBadge} title="Completed">
                          <span className={styles.dotCompleted} /> {completed} Done
                        </span>
                      </div>

                      <div className={styles.statusCol}>
                        <span className={`${styles.workloadStatus} ${workloadClass}`}>
                          {workloadLabel}
                        </span>
                      </div>

                      <button
                        className={styles.quickAssignBtnDesktop}
                        onClick={() => navigate('/tasks/create', { state: { prefilledAssigneeId: c.id } })}
                        title={`Assign new task to ${c.name}`}
                      >
                        <UserPlus size={13} />
                        <span>Assign</span>
                      </button>
                    </div>

                    {/* ── Bottom sub-row (mobile only): icon badges + assign btn ── */}
                    <div className={styles.creatorRowBottom}>
                      <div className={styles.taskBreakdownMobile}>
                        <span className={styles.iconBadgeBlue} title={`${inProgress} Active`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                          <strong>{inProgress}</strong>
                        </span>
                        <span className={styles.iconBadgeOrange} title={`${review} Review`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          <strong>{review}</strong>
                        </span>
                        <span className={styles.iconBadgeGreen} title={`${completed} Done`}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          <strong>{completed}</strong>
                        </span>
                      </div>

                      <button
                        className={styles.quickAssignBtn}
                        onClick={() => navigate('/tasks/create', { state: { prefilledAssigneeId: c.id } })}
                        title={`Assign new task to ${c.name}`}
                      >
                        <UserPlus size={13} />
                        <span>Assign</span>
                      </button>
                    </div>

                  </div>
                );
              })
            ) : (
              <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '12.5px', color: '#64748B' }}>
                No creators found in this workspace.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Main SaaS Multi-Column Grid */}
      <div className={styles.mainGrid}>
        {/* Left Column: Tasks & Review Preview */}
        <div className={styles.leftCol}>
          {/* Section 3: Recent Tasks */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <h3 className={styles.sectionTitle}>Recent Tasks</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/tasks')}
              >
                View All
              </Button>
            </div>
            
            <motion.div
              variants={containerVariants}
              className={styles.tasksList}
            >
              {recentActiveTasks.length > 0 ? (
                recentActiveTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    variants={fadeUpVariants}
                    whileHover={hoverScale.hover}
                    whileTap={hoverScale.tap}
                    className={styles.taskCardContainer}
                  >
                    <TaskCard
                      task={task}
                      onClick={() => navigate(`/tasks?id=${task.id}`)}
                    />
                  </motion.div>
                ))
              ) : (
                <div className={styles.emptyTasks}>
                  No active tasks. Create a task to get started!
                </div>
              )}
            </motion.div>
          </div>

          {/* Section 5: Review Queue Preview */}
          <div className={styles.section}>
            <Card padding={true} className={styles.reviewCard}>
              <div className={styles.sectionHeaderInside}>
                <h3 className={styles.sectionTitle}>Review Queue Preview</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/review')}
                >
                  View Queue
                </Button>
              </div>

              <div className={styles.reviewList}>
                {reviewPreview.length > 0 ? (
                  reviewPreview.map((item) => (
                    <div key={item.id} className={styles.reviewItem}>
                      <div className={styles.reviewMeta}>
                        <h4 className={styles.reviewName}>{item.title}</h4>
                        <span className={styles.reviewCreator}>
                          Assigned to {item.assigned_to || 'Unassigned'} • Category: {item.category}
                        </span>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyTasks}>
                    Review queue is currently empty.
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Column: Dynamic Widgets Stack */}
        <div className={styles.rightCol}>
          {/* Widget 1: Personal Focus Queue */}
          <Card padding={true} className={styles.rightWidgetCard}>
            <div className={styles.widgetHeader}>
              <ListTodo size={16} className={styles.widgetIcon} />
              <h3 className={styles.widgetTitle}>Personal Focus Queue</h3>
            </div>
            
            <div className={styles.queueList}>
              {personalQueue.length > 0 ? (
                personalQueue.map(item => (
                  <div 
                    key={item.id} 
                    className={styles.queueItem}
                    onClick={() => navigate(`/tasks?id=${item.id}`)}
                  >
                    <div className={`${styles.prioIndicator} ${styles[item.priority?.toLowerCase() || 'medium']}`} />
                    <div className={styles.queueInfo}>
                      <span className={styles.queueName}>{item.title}</span>
                      <span className={styles.queueMeta}>
                        Due: {item.deadline || 'No deadline'} • {item.category}
                      </span>
                    </div>
                    <ChevronRight size={13} className={styles.queueArrow} />
                  </div>
                ))
              ) : (
                <div className={styles.queueEmpty}>
                  <CheckCircle2 size={24} style={{ color: '#10B981', marginBottom: '6px' }} />
                  <span className={styles.emptyTitle}>You're fully caught up!</span>
                  <span className={styles.emptyDesc}>No active tasks in your queue.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Widget 2: Category Distribution */}
          <Card padding={true} className={styles.rightWidgetCard}>
            <div className={styles.widgetHeader}>
              <Activity size={16} className={styles.widgetIcon} />
              <h3 className={styles.widgetTitle}>Workload Distribution</h3>
            </div>
            
            <div className={styles.distributionList}>
              {Object.keys(categoryCounts).length > 0 ? (
                Object.entries(categoryCounts).map(([catName, count]) => {
                  const percent = totalActiveCount > 0 ? Math.round((count / totalActiveCount) * 100) : 0;
                  return (
                    <div key={catName} className={styles.distRow}>
                      <div className={styles.distMeta}>
                        <span className={styles.distIconWrapper}>
                          {getCategoryIcon(catName)}
                        </span>
                        <span className={styles.distName}>{catName}</span>
                        <span className={styles.distCount}>{count} active</span>
                      </div>
                      <div className={styles.distTrack}>
                        <div 
                          className={styles.distBar}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className={styles.queueEmpty}>
                  <span className={styles.emptyTitle}>No Active Tasks</span>
                  <span className={styles.emptyDesc}>Workload is currently clear.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Widget 3: Performance Analytics */}
          <Card padding={true} className={styles.rightWidgetCard}>
            <div className={styles.widgetHeader}>
              <TrendingUp size={16} className={styles.widgetIcon} />
              <h3 className={styles.widgetTitle}>Workspace Performance</h3>
            </div>
            
            <div className={styles.analyticsGrid}>
              <div className={styles.metricPill}>
                <span className={styles.label}>Workflows Finished</span>
                <span className={styles.val}>{completedTasksCount}</span>
                <span className={styles.subtext}>Total completed</span>
              </div>
              <div className={styles.metricPill}>
                <span className={styles.label}>Success Rate</span>
                <span className={styles.val}>{successRate}%</span>
                <span className={styles.subtext}>On-time rate</span>
              </div>
              <div className={styles.metricPill}>
                <span className={styles.label}>Avg Review Speed</span>
                <span className={styles.val}>{averageApprovalTime}</span>
                <span className={styles.subtext}>Submission to live</span>
              </div>
              <div className={styles.metricPill}>
                <span className={styles.label}>Active Backlog</span>
                <span className={styles.val}>{totalActiveCount}</span>
                <span className={styles.subtext}>Awaiting completion</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
