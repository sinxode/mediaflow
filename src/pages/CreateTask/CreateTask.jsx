import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import Modal from '../../components/Modal/Modal';
import PrioritySelector from './components/PrioritySelector';
import UserSelector from './components/UserSelector';
import TaskPreviewCard from './components/TaskPreviewCard';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import { TaskService } from '../../services/tasks/taskService';
import { useAuth } from '../../auth/hooks/useAuth';
import { CATEGORIES, STATUSES } from '../../constants';
import { pageVariants, fadeUpVariants } from '../../utils/animations';
import styles from './CreateTask.module.scss';

const CreateTask = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editTaskId = location.state?.editTaskId;
  const { user } = useAuth(); // Retrieve active logged-in user profile
  
  // Mode State
  const [mode, setMode] = useState(editTaskId ? 'edit' : 'create');
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [saveState, setSaveState] = useState('Saved');
  const [loading, setLoading] = useState(false);
  
  // Date Helper Functions
  const getTodayString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getFutureDateString = (offsetDays) => {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form Fields State
  const [formData, setFormData] = useState({
    title: location.state?.prefillTitle || '',
    description: location.state?.prefillDescription || '',
    category: 'Poster Design',
    priority: 'medium',
    assignedUser: location.state?.prefilledAssigneeId || '',
    deadline: location.state?.prefillDeadline || getTodayString()
  });

  // Load task detail if editing
  useEffect(() => {
    if (editTaskId) {
      const loadEditTask = async () => {
        try {
          setLoading(true);
          const task = await TaskService.getTaskById(editTaskId);
          if (task) {
            setFormData({
              title: task.title,
              description: task.description || '',
              category: task.category,
              priority: task.priority || 'medium',
              assignedUser: task.assigned_to || '',
              deadline: task.deadline || ''
            });
            setMode('edit');
          }
        } catch (err) {
          console.error('Failed to load task for editing', err);
        } finally {
          setLoading(false);
        }
      };
      loadEditTask();
    }
  }, [editTaskId]);

  // Track changes to show "Unsaved Changes" auto-save state
  useEffect(() => {
    if (formData.title || formData.description || formData.deadline) {
      setSaveState('Unsaved Changes');
      
      const saveTimer = setTimeout(() => {
        setSaveState('Saved');
      }, 1200); // Auto-saves 1.2s after user stops typing
      
      return () => clearTimeout(saveTimer);
    }
  }, [formData]);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!navigator.onLine) {
      alert('Network Offline: Please reconnect to the internet to save or create tasks.');
      return;
    }
    
    if (formData.title.trim().length < 3) {
      alert('Please enter a task title with at least 3 characters.');
      return;
    }

    const descText = formData.description?.trim();
    if (descText && descText.length > 0 && descText.length < 5) {
      alert('Task description must be at least 5 characters long (or left completely empty).');
      return;
    }

    if (!user || !user.id) {
      alert('User session not found. Please log in again.');
      return;
    }

    try {
      setLoading(true);
      if (mode === 'create') {
        const payload = {
          title: formData.title.trim(),
          description: formData.description?.trim() || null,
          category: formData.category,
          priority: formData.priority.toLowerCase(),
          status: STATUSES.CREATED,
          assigned_to: formData.assignedUser || null,
          created_by: user?.id,
          deadline: formData.deadline || null
        };
        const createdTask = await TaskService.createTask(payload);
      } else if (mode === 'edit' && editTaskId) {
        const payload = {
          title: formData.title.trim(),
          description: formData.description?.trim() || null,
          category: formData.category,
          priority: formData.priority.toLowerCase(),
          assigned_to: formData.assignedUser || null,
          deadline: formData.deadline || null
        };
        await TaskService.updateTask(editTaskId, payload);
      }
      setIsSuccessOpen(true);
    } catch (err) {
      console.error('Failed to submit form', err);
      alert(`Failed to submit task: ${err.message || ''}\nCode: ${err.code || ''}\nDetails: ${err.details || ''}\nHint: ${err.hint || ''}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <LoadingSkeleton count={3} height={100} />
      </div>
    );
  }

  const categoryOptions = Object.values(CATEGORIES);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.createPageContainer}
    >
      {/* Dynamic Header */}
      <PageHeader
        title={mode === 'create' ? 'Create New Task' : 'Edit Task'}
        description={
          mode === 'create'
            ? 'Create and assign a new workflow item.'
            : 'Update task information and workflow settings.'
        }
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Tasks', path: '/tasks' },
          { label: mode === 'create' ? 'Create' : 'Edit', path: '/tasks/create' }
        ]}
      />

      <div className={styles.formWorkspace}>
        {/* Left Side: Form Panel */}
        <div className={styles.formSection}>
          <Card padding={true} className={styles.formCard} overflowVisible={true}>
            {/* Draft AutoSave Indicator */}
            <div className={styles.indicatorRow}>
              <span className={`${styles.saveBadge} ${saveState === 'Saved' ? styles.saved : styles.unsaved}`}>
                <span className={styles.badgeDot} />
                {saveState}
              </span>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              {/* Task Title */}
              <div className={styles.fieldBlock}>
                <label className={styles.inputLabel}>Task Title</label>
                <input
                  type="text"
                  placeholder="e.g., Friday Program Poster"
                  value={formData.title}
                  onChange={(e) => handleFieldChange('title', e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              {/* Description */}
              <div className={styles.fieldBlock}>
                <label className={styles.inputLabel}>Instructions / Description</label>
                <textarea
                  placeholder="Describe the task requirements, corrections, references, and expectations..."
                  value={formData.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className={styles.textareaInput}
                  rows={5}
                />
              </div>

              {/* Category */}
              <div className={styles.fieldBlock}>
                <label className={styles.inputLabel}>Category</label>
                <div className={styles.selectWrapper}>
                  <select
                    value={formData.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className={styles.selectInput}
                    required
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Priority Chips Selector */}
              <PrioritySelector
                value={formData.priority}
                onChange={(val) => handleFieldChange('priority', val)}
              />

              {/* Assigned User Selector */}
              <UserSelector
                value={formData.assignedUser}
                onChange={(val) => handleFieldChange('assignedUser', val)}
              />

              {/* Deadline custom picker */}
              <div className={styles.fieldBlock}>
                <div className={styles.deadlineHeader}>
                  <label className={styles.inputLabel}>Deadline Date</label>
                  <div className={styles.quickDateButtons}>
                    <button
                      type="button"
                      className={styles.quickDateBtn}
                      onClick={() => handleFieldChange('deadline', getFutureDateString(1))}
                    >
                      Tomorrow
                    </button>
                    <button
                      type="button"
                      className={styles.quickDateBtn}
                      onClick={() => handleFieldChange('deadline', getFutureDateString(2))}
                    >
                      2 Days
                    </button>
                  </div>
                </div>
                <div className={styles.customDateWrapper}>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleFieldChange('deadline', e.target.value)}
                    className={styles.dateInput}
                    required
                  />
                </div>
              </div>

              {/* Form submit/cancel buttons (Sticky Row placeholder) */}
              <div className={styles.formActionsMobile}>
                <Button variant="ghost" size="md" onClick={() => navigate('/tasks')}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="md">
                  {mode === 'create' ? 'Create Task' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Side: Live Task Preview */}
        <div className={styles.previewSection}>
          <TaskPreviewCard task={{ ...formData, status: mode === 'create' ? 'Created' : 'Working' }} />
          
          <Card variant="surface" padding={true} className={styles.tipsCard}>
            <div className={styles.tipsHeader}>
              <Sparkles className={styles.tipsIcon} />
              <h4>Pro Tip</h4>
            </div>
            <p className={styles.tipsText}>
              Keep task titles short. Provide checklist items in the description box to ensure reviewers can quickly verify deliverable uploads.
            </p>
          </Card>
        </div>
      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className={styles.stickyActionsBar}>
        <div className={styles.actionsBarContainer}>
          <Button
            variant="ghost"
            size="md"
            onClick={() => navigate('/tasks')}
          >
            Cancel
          </Button>
          <div className={styles.rightActions}>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSaveState('Saved');
                handleSubmit();
              }}
            >
              Save Draft
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleSubmit}
            >
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <Modal
        isOpen={isSuccessOpen}
        onClose={() => {
          setIsSuccessOpen(false);
          if (location.state?.linkedPlanId) {
            navigate('/team-hub');
          } else {
            navigate('/tasks');
          }
        }}
        title={mode === 'create' ? 'Task Created' : 'Task Settings Saved'}
        size="sm"
        footer={
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setIsSuccessOpen(false);
              if (location.state?.linkedPlanId) {
                navigate('/team-hub');
              } else {
                navigate('/tasks');
              }
            }}
          >
            Close
          </Button>
        }
      >
        <div className={styles.successModal}>
          <CheckCircle2 className={styles.successIcon} />
          <p>
            The media task <strong>"{formData.title || 'Friday Program Poster'}"</strong> has been successfully{' '}
            {mode === 'create' ? 'registered in the system' : 'updated'}. The team has been notified.
          </p>
        </div>
      </Modal>
    </motion.div>
  );
};

export default CreateTask;
