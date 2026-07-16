import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus, Activity, SlidersHorizontal } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import Card from '../../components/Card/Card';
import TaskStats from './components/TaskStats/TaskStats';
import TaskFilters from './components/TaskFilters/TaskFilters';
import TaskCard from './components/TaskCard/TaskCard';
import LoadingState from './components/LoadingState/LoadingState';
import TaskDetails from '../TaskDetails/TaskDetails';
import { TaskService } from '../../services/tasks/taskService';
import { UserService } from '../../services/users/userService';
import { useAuth } from '../../auth/hooks/useAuth';
import { useRealtimeTasksList } from '../../hooks/useRealtime';
import { STATUSES, PRIORITIES, CATEGORIES } from '../../constants';
import {
  pageVariants,
  containerVariants,
  fadeUpVariants
} from '../../utils/animations';
import styles from './Tasks.module.scss';

const Tasks = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const taskIdParam = searchParams.get('id');
  
  // Tasks state
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [realUsers, setRealUsers] = useState([]);

  const selectedTask = tasks.find((t) => t.id === taskIdParam) || null;

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [onlyMyTasks, setOnlyMyTasks] = useState(false);

  // Quick Add draft states
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState(Object.values(CATEGORIES)[0]);
  const [quickAdding, setQuickAdding] = useState(false);

  const handleQuickAddSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!quickTitle.trim()) return;

    if (!navigator.onLine) {
      alert('Network Offline: Please reconnect to save new tasks.');
      return;
    }

    try {
      setQuickAdding(true);
      
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      const serializedDescription = `\n\n[workflow:review=true;publishing=true;deliverable=true]`;

      const payload = {
        title: quickTitle.trim(),
        description: serializedDescription,
        category: quickCategory,
        priority: 'medium',
        status: STATUSES.CREATED,
        assigned_to: null,
        created_by: user?.id,
        deadline: todayStr
      };

      await TaskService.createTask(payload);
      setQuickTitle('');
      loadTasksData();
    } catch (err) {
      console.error('Quick add failed', err);
      alert('Failed to quick add task: ' + err.message);
    } finally {
      setQuickAdding(false);
    }
  };

  // Fetch tasks data
  const loadTasksData = async () => {
    try {
      setIsLoading(true);
      const list = await TaskService.getTasks();
      const mapped = list.map((t) => ({
        ...t,
        assignedUser: t.assignee?.name || 'Unassigned',
        createdBy: t.creator?.name || 'Workspace Manager'
      }));
      setTasks(mapped);
    } catch (err) {
      console.error('Failed to load tasks list', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load tasks & users on mount
  useEffect(() => {
    loadTasksData();
    const fetchUsers = async () => {
      try {
        const list = await UserService.getAllUsers();
        setRealUsers(list || []);
      } catch (err) {
        console.error('Failed to load filter users', err);
      }
    };
    fetchUsers();

    // Background polling fallback every 4 seconds
    const interval = setInterval(async () => {
      try {
        const list = await TaskService.getTasks();
        const mapped = list.map((t) => ({
          ...t,
          assignedUser: t.assignee?.name || 'Unassigned',
          createdBy: t.creator?.name || 'Workspace Manager'
        }));
        setTasks((prev) => {
          if (JSON.stringify(prev) === JSON.stringify(mapped)) return prev;
          return mapped;
        });
      } catch (err) {
        console.error('Failed to poll tasks list', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleRealtimeTasksUpdate = useCallback(() => {
    const refreshTasks = async () => {
      try {
        const list = await TaskService.getTasks();
        const mapped = list.map((t) => ({
          ...t,
          assignedUser: t.assignee?.name || 'Unassigned',
          createdBy: t.creator?.name || 'Workspace Manager'
        }));
        setTasks(mapped);
      } catch (err) {
        console.error('Failed to refresh tasks list in real-time', err);
      }
    };
    refreshTasks();
  }, []);

  useRealtimeTasksList(handleRealtimeTasksUpdate);
  
  // Filter logic
  useEffect(() => {
    const filtered = tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
        
      const matchesCategory =
        categoryFilter === '' || task.category === categoryFilter;
        
      const matchesStatus =
        statusFilter === '' || task.status.toLowerCase() === statusFilter.toLowerCase();
        
      const matchesPriority =
        priorityFilter === '' || task.priority.toLowerCase() === priorityFilter.toLowerCase();
        
      const matchesUser =
        userFilter === '' || task.assignedUser.toLowerCase().includes(userFilter.toLowerCase());

      const matchesMyTasks =
        !onlyMyTasks ||
        task.assigned_to === user?.id ||
        task.created_by === user?.id;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPriority &&
        matchesUser &&
        matchesMyTasks
      );
    });
    
    const ordered = [...filtered].sort((a, b) => {
      const isAFinished = a.status === 'completed' || a.status === 'published';
      const isBFinished = b.status === 'completed' || b.status === 'published';
      
      if (isAFinished && !isBFinished) return 1;
      if (!isAFinished && isBFinished) return -1;
      return 0;
    });
    
    setFilteredTasks(ordered);
  }, [searchQuery, categoryFilter, statusFilter, priorityFilter, userFilter, onlyMyTasks, tasks, user?.id]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setUserFilter('');
    setOnlyMyTasks(false);
  };

  // Compute dynamic stats
  const totalTasks = tasks.length;
  const activeFlow = tasks.filter((t) => t.status !== STATUSES.COMPLETED && t.status !== STATUSES.PUBLISHED).length;
  const pendingReview = tasks.filter((t) => t.status === STATUSES.READY_FOR_REVIEW || t.status === STATUSES.REVIEWING).length;
  const completedCount = tasks.filter((t) => t.status === STATUSES.COMPLETED).length;

  const stats = {
    all: totalTasks,
    active: activeFlow,
    reviewing: pendingReview,
    completed: completedCount
  };

  // Grouped tasks by status categories
  const activeTasksList = filteredTasks.filter((t) => t.status !== STATUSES.COMPLETED && t.status !== STATUSES.PUBLISHED);
  const completedTasksList = filteredTasks.filter((t) => t.status === STATUSES.COMPLETED || t.status === STATUSES.PUBLISHED);

  // Static options mapping
  const filterCategories = Object.values(CATEGORIES);
  const filterStatuses = Object.values(STATUSES);
  const filterPriorities = Object.values(PRIORITIES);
  const filterUsers = realUsers.map((u) => u.name);

  // If a task is selected, swap lists view with the details panel
  if (selectedTask) {
    return (
      <TaskDetails
        taskId={selectedTask.id}
        onBack={() => {
          setSearchParams({});
          loadTasksData(); // refresh tasks state after back click
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
      className={styles.tasksPageContainer}
    >
      {/* Page Header */}
      <PageHeader
        title="All Tasks"
        description="View and manage all active and completed tasks."
        actions={
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus />}
            onClick={() => navigate('/tasks/create')}
          >
            Create Task
          </Button>
        }
      />

      {/* Quick Overview Stats Row */}
      <div className={styles.statsSection}>
        <TaskStats stats={stats} />
      </div>

      {/* Sticky Filters Section */}
      <TaskFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        categories={filterCategories}
        statuses={filterStatuses}
        priorities={filterPriorities}
        users={filterUsers}
        onlyMyTasks={onlyMyTasks}
        setOnlyMyTasks={setOnlyMyTasks}
        onResetFilters={handleResetFilters}
      />

      {/* Two-Column Layout Grid */}
      <div className={styles.tasksLayoutGrid}>
        {/* Left Column: Tasks List */}
        <div className={styles.listContainer}>
          {isLoading ? (
            <LoadingState count={8} />
          ) : filteredTasks.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="initial"
              animate="animate"
              className={styles.tasksList}
            >
              {activeTasksList.length > 0 && (
                <>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                      Active Tasks
                      <span className={styles.sectionCount}>{activeTasksList.length}</span>
                    </h3>
                  </div>
                  {activeTasksList.map((task) => (
                    <motion.div key={task.id} variants={fadeUpVariants}>
                      <TaskCard
                        task={task}
                        onClick={() => setSearchParams({ id: task.id })}
                      />
                    </motion.div>
                  ))}
                </>
              )}

              {completedTasksList.length > 0 && (
                <>
                  <div className={`${styles.sectionHeader} ${styles.completedSectionHeader}`}>
                    <h3 className={styles.sectionTitle}>
                      Completed & Published
                      <span className={styles.sectionCount}>{completedTasksList.length}</span>
                    </h3>
                  </div>
                  {completedTasksList.map((task) => (
                    <motion.div key={task.id} variants={fadeUpVariants}>
                      <TaskCard
                        task={task}
                        onClick={() => setSearchParams({ id: task.id })}
                      />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <EmptyState
                title="No Tasks Found"
                description="Adjust your filters or create a new task."
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

        {/* Right Column: Sticky Sidebar Widgets */}
        <div className={styles.sidebarColumn}>
          {/* Widget 1: Quick Add Draft Task */}
          <Card padding={true} className={styles.sidebarWidget}>
            <div className={styles.widgetHeader}>
              <Plus size={14} className={styles.widgetIcon} />
              <h4 className={styles.widgetTitle}>Quick Add Draft</h4>
            </div>
            <p className={styles.widgetDesc}>
              Quickly create a task draft with medium priority. Default deadline set to today.
            </p>
            <form onSubmit={handleQuickAddSubmit} className={styles.quickAddForm}>
              <input
                type="text"
                placeholder="Task title (e.g. Logo Design)..."
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className={styles.quickInput}
                disabled={quickAdding}
                required
              />
              <div className={styles.quickSelectWrapper}>
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className={styles.quickSelect}
                  disabled={quickAdding}
                >
                  {Object.values(CATEGORIES).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className={styles.quickSubmitBtn}
                disabled={quickAdding || !quickTitle.trim()}
              >
                {quickAdding ? 'Adding...' : 'Add Draft Task'}
              </Button>
            </form>
          </Card>

          {/* Widget 2: Interactive Workflow Guide */}
          <Card padding={true} className={styles.sidebarWidget}>
            <div className={styles.widgetHeader}>
              <SlidersHorizontal size={14} className={styles.widgetIcon} />
              <h4 className={styles.widgetTitle}>Workflow Step Map</h4>
            </div>
            <p className={styles.widgetDesc}>
              Dynamic transition stages configured based on active workflow settings.
            </p>
            
            <div className={styles.stepMap}>
              <div className={styles.stepItem}>
                <span className={`${styles.stepDot} ${styles.created}`}>1</span>
                <div className={styles.stepInfo}>
                  <h5 className={styles.stepName}>Created</h5>
                  <span className={styles.stepDetail}>Task initialized & ready to accept</span>
                </div>
              </div>
              <div className={styles.stepConnector} />

              <div className={styles.stepItem}>
                <span className={`${styles.stepDot} ${styles.assigned}`}>2</span>
                <div className={styles.stepInfo}>
                  <h5 className={styles.stepName}>Assigned & Working</h5>
                  <span className={styles.stepDetail}>Accepted by assignee; production active</span>
                </div>
              </div>
              <div className={styles.stepConnector} />

              <div className={styles.stepItem}>
                <span className={`${styles.stepDot} ${styles.reviewing}`}>3</span>
                <div className={styles.stepInfo}>
                  <h5 className={styles.stepName}>Review Queue</h5>
                  <span className={styles.stepDetail}>Feedback and file inspection loop</span>
                </div>
              </div>
              <div className={styles.stepConnector} />

              <div className={styles.stepItem}>
                <span className={`${styles.stepDot} ${styles.completed}`}>4</span>
                <div className={styles.stepInfo}>
                  <h5 className={styles.stepName}>Completed</h5>
                  <span className={styles.stepDetail}>Asset finished and task completed</span>
                </div>
              </div>
            </div>
            
            <div className={styles.guideTip}>
              <strong>Bypass Rules:</strong> Bypassing the review/publish settings transitions a task directly from <strong>Working → Completed</strong>.
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Tasks;
