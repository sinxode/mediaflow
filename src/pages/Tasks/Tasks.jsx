import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Plus } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/PageHeader/PageHeader';
import EmptyState from '../../components/EmptyState/EmptyState';
import Button from '../../components/Button/Button';
import TaskStats from './components/TaskStats/TaskStats';
import TaskFilters from './components/TaskFilters/TaskFilters';
import TaskCard from './components/TaskCard/TaskCard';
import LoadingState from './components/LoadingState/LoadingState';
import TaskDetails from '../TaskDetails/TaskDetails';
import { TaskService } from '../../services/tasks/taskService';
import { UserService } from '../../services/users/userService';
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

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesPriority &&
        matchesUser
      );
    });
    
    setFilteredTasks(filtered);
  }, [searchQuery, categoryFilter, statusFilter, priorityFilter, userFilter, tasks]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setCategoryFilter('');
    setStatusFilter('');
    setPriorityFilter('');
    setUserFilter('');
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
        onResetFilters={handleResetFilters}
      />

      {/* List Scaffolding */}
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
            {filteredTasks.map((task) => (
              <motion.div key={task.id} variants={fadeUpVariants}>
                <TaskCard
                  task={task}
                  onClick={() => setSearchParams({ id: task.id })} // Opens Task Details Page
                />
              </motion.div>
            ))}
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
    </motion.div>
  );
};

export default Tasks;
