import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import TaskHeader from './components/TaskHeader';
import TaskInfoCard from './components/TaskInfoCard';
import CommentThread from './components/CommentThread';
import WorkflowActions from './components/WorkflowActions';
import TaskSidebar from './components/TaskSidebar';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import ActivityTimeline from '../../components/Activity/ActivityTimeline';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { TaskService } from '../../services/tasks/taskService';
import { getStatusActions } from '../../services/workflow/workflowService';
import { parseTaskMetadata } from '../../utils/workflowMeta';
import { useRealtimeTask } from '../../hooks/useRealtime';
import { useAuth } from '../../auth/hooks/useAuth';
import { pageVariants, fadeUpVariants } from '../../utils/animations';
import { useNavigate } from 'react-router-dom';
import styles from './TaskDetails.module.scss';

const TaskDetails = ({ task, taskId, onBack }) => {
  const navigate = useNavigate();
  const { role, user } = useAuth(); // Connect directly to real authenticated role and profile
  const [commentsCount, setCommentsCount] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  const [currentTask, setCurrentTask] = useState(task);
  const [loading, setLoading] = useState(!task);

  const loadTaskDetails = async (showSkeleton = true) => {
    const idToFetch = taskId || task?.id;
    if (idToFetch) {
      try {
        if (showSkeleton) setLoading(true);
        const detail = await TaskService.getTaskById(idToFetch);
        setCurrentTask((prev) => {
          // Check deep equality to avoid resetting React renders
          if (JSON.stringify(prev) === JSON.stringify(detail)) return prev;
          return detail;
        });
      } catch (err) {
        console.error('Failed to load task details', err);
      } finally {
        if (showSkeleton) setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadTaskDetails(true);

    // heart-beat polling fallback to keep status and actions in-sync every 2.5s
    const interval = setInterval(() => {
      loadTaskDetails(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [taskId, task?.id]);

  const handleRealtimeUpdate = useCallback((payload) => {
    if (payload.eventType === 'UPDATE') {
      setCurrentTask((prev) => ({
        ...prev,
        ...payload.new
      }));
    }
  }, []);

  // Hook live task updates listener
  useRealtimeTask(currentTask?.id, handleRealtimeUpdate);

  const handleWorkflowAction = async (targetStatus) => {
    if (!currentTask?.id) return;
    
    if (!navigator.onLine) {
      alert('Network Offline: Please reconnect to the internet to perform status updates.');
      return;
    }
    
    try {
      setLoading(true);
      const payload = { status: targetStatus };
      if (targetStatus === 'assigned') {
        payload.assigned_to = user?.id;
      }
      const updated = await TaskService.updateTask(currentTask.id, payload);
      setCurrentTask(updated);
    } catch (err) {
      console.error('Failed to update status', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!currentTask?.id) return;
    try {
      setLoading(true);
      await TaskService.deleteTask(currentTask.id);
      onBack();
    } catch (err) {
      console.error('Failed to delete task', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (currentTask?.id) {
      navigate('/tasks/create', { state: { editTaskId: currentTask.id } });
    }
  };

  if (!currentTask) {
    return (
      <div style={{ padding: '24px' }}>
        <LoadingSkeleton count={3} height={100} />
      </div>
    );
  }

  const meta = parseTaskMetadata(currentTask.description);

  // Format task for sub-components
  const normalizedTask = {
    ...currentTask,
    description: meta.cleanDescription,
    status: currentTask.status.charAt(0).toUpperCase() + currentTask.status.slice(1).replace(/_/g, ' '),
    assignedUser: currentTask.assignee?.name || 'Unassigned',
    createdBy: currentTask.creator?.name || 'Workspace Manager'
  };

  // Generate dynamic actions based on workflow config & deliverable presence
  const isAssignee = currentTask.assigned_to === user?.id;
  const isCreator = currentTask.created_by === user?.id;
  const isUnassigned = !currentTask.assigned_to;
  
  const dynamicActions = getStatusActions(
    currentTask.status,
    role,
    !!currentTask.file_url,
    isAssignee,
    isUnassigned,
    meta.requiresReview,
    meta.requiresPublishing,
    meta.requiresDeliverable
  );

  // Allow creator or assignee to force complete task directly if not already finished
  const canForceComplete = (isCreator || isAssignee) && 
                           currentTask.status !== 'completed' && 
                           currentTask.status !== 'published';

  if (canForceComplete) {
    if (!dynamicActions.some(action => action.id === 'force-complete')) {
      dynamicActions.push({
        id: 'force-complete',
        label: 'Force Complete Task',
        targetStatus: 'completed',
        variant: 'success',
        enabled: true
      });
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.detailsContainer}
    >
      {loading && <div className={styles.loadingBar} />}
      {/* Task Header Section */}
      <TaskHeader
        task={normalizedTask}
        onBack={onBack}
        onEdit={handleEditClick}
        onDelete={() => setIsDeleteModalOpen(true)}
      />

      {/* Two-Column Responsive Workspace */}
      <div className={styles.workspaceGrid}>
        {/* Main Workspace Column */}
        <div className={styles.mainWorkspace}>
          {/* Section 2: Instructions & File previews */}
          <motion.div variants={fadeUpVariants} className={styles.cardWrapper}>
            <TaskInfoCard
              taskId={currentTask.id}
              description={normalizedTask.description}
              fileUrl={currentTask.file_url}
              fileMeta={{
                name: currentTask.file_name,
                size: currentTask.file_size,
                uploaded_at: currentTask.file_uploaded_at
              }}
              role={role}
              isAssignee={isAssignee}
              onFileUpdated={(newUrl, meta) => {
                setCurrentTask((prev) => ({
                  ...prev,
                  file_url: newUrl,
                  file_name: meta.name,
                  file_size: meta.size,
                  file_uploaded_at: meta.uploaded_at
                }));
              }}
            />
          </motion.div>

          {/* Section 4: Workflow Actions Panel */}
          <motion.div variants={fadeUpVariants} className={styles.cardWrapper}>
            <WorkflowActions
              actions={dynamicActions}
              onActionClick={handleWorkflowAction}
              currentStatus={currentTask.status}
            />
          </motion.div>

          {/* Section 3: Comment System Thread */}
          <motion.div variants={fadeUpVariants} className={styles.cardWrapper}>
            <CommentThread
              taskId={currentTask.id}
              onCountChange={setCommentsCount}
            />
          </motion.div>
        </div>

        {/* Sticky Context Sidebar Column */}
        <div className={styles.sidebarColumn}>
          <TaskSidebar task={normalizedTask} commentsCount={commentsCount} />
          <ActivityTimeline taskId={currentTask.id} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Task Deletion"
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', width: '100%' }}>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteTask}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Are you sure you want to delete this task? This action cannot be undone and will permanently remove this task and all its comments.
        </p>
      </Modal>
    </motion.div>
  );
};

export default TaskDetails;
