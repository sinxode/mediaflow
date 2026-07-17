import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, Search, RefreshCw, Play, Pause, Trash2, Copy, History, 
  Calendar, CheckCircle, AlertOctagon, User, Tag
} from 'lucide-react';
import PageHeader from '../../components/PageHeader/PageHeader';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import LoadingSkeleton from '../../components/LoadingSkeleton/LoadingSkeleton';
import WorkflowModal from './WorkflowModal';
import HistoryModal from './HistoryModal';
import WorkflowsDashboardWidget from './WorkflowsDashboardWidget';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { pageVariants, containerVariants, fadeUpVariants } from '../../utils/animations';
import { WorkflowScheduler } from '../../services/workflows/workflowScheduler';
import styles from './RecurringWorkflows.module.scss';

const RecurringWorkflows = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [, setSearchParams] = useSearchParams();

  // Workflows states
  const [workflows, setWorkflows] = useState([]);
  const [historyCount, setHistoryCount] = useState({ success: 0, failed: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Trigger loading list
  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('recurring_workflows')
        .select('*, assignee:users!assigned_to(name)');
        
      if (error) throw error;
      setWorkflows(data || []);

      // Load history count for current month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0,0,0,0);
      
      const { data: histLogs } = await supabase
        .from('workflow_history')
        .select('status')
        .gte('generation_date', startOfMonth.toISOString());
        
      if (histLogs) {
        const stats = histLogs.reduce((acc, log) => {
          if (log.status === 'success') acc.success++;
          if (log.status === 'failed') acc.failed++;
          return acc;
        }, { success: 0, failed: 0 });
        setHistoryCount(stats);
      }

    } catch (err) {
      console.error('Failed to load workflows list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkflows();
  }, []);

  // Save new or updated workflow
  const handleSaveWorkflow = async (formData) => {
    const payload = {
      ...formData,
      created_by: selectedWorkflow && !isDuplicate ? formData.created_by : user?.id
    };

    if (selectedWorkflow && !isDuplicate) {
      // Update
      const { error } = await supabase
        .from('recurring_workflows')
        .update(payload)
        .eq('id', selectedWorkflow.id);
      if (error) throw error;
    } else {
      // Insert
      const { error } = await supabase
        .from('recurring_workflows')
        .insert([payload]);
      if (error) throw error;
    }
    
    // Automatically trigger scheduler run to evaluate new schedule immediately
    setTimeout(() => {
      WorkflowScheduler.checkAndGenerateTasks();
    }, 1000);

    loadWorkflows();
  };

  // Toggle active/paused status
  const handleToggleStatus = async (workflow) => {
    const nextStatus = workflow.status === 'active' ? 'paused' : 'active';
    try {
      const { error } = await supabase
        .from('recurring_workflows')
        .update({ status: nextStatus })
        .eq('id', workflow.id);
        
      if (error) throw error;
      
      // Update local state immediately
      setWorkflows(prev => prev.map(w => w.id === workflow.id ? { ...w, status: nextStatus } : w));
      
      if (nextStatus === 'active') {
        // Trigger check immediately if activated
        WorkflowScheduler.checkAndGenerateTasks();
      }
    } catch (err) {
      console.error('Failed to toggle status', err);
      alert('Failed to change status: ' + err.message);
    }
  };

  // Delete workflow
  const handleDeleteWorkflow = async (workflow) => {
    if (!window.confirm(`Are you sure you want to delete workflow "${workflow.name}"? This cannot be undone.`)) return;
    try {
      const { error } = await supabase
        .from('recurring_workflows')
        .delete()
        .eq('id', workflow.id);
        
      if (error) throw error;
      setWorkflows(prev => prev.filter(w => w.id !== workflow.id));
    } catch (err) {
      console.error('Failed to delete workflow', err);
      alert('Delete failed: ' + err.message);
    }
  };

  // Duplicate template trigger
  const handleDuplicateClick = (workflow) => {
    setSelectedWorkflow(workflow);
    setIsDuplicate(true);
    setIsFormOpen(true);
  };

  const handleEditClick = (workflow) => {
    setSelectedWorkflow(workflow);
    setIsDuplicate(false);
    setIsFormOpen(true);
  };

  const handleHistoryClick = (workflow) => {
    setSelectedWorkflow(workflow);
    setIsHistoryOpen(true);
  };

  const handleOpenTask = (taskId) => {
    navigate(`/tasks?id=${taskId}`);
  };

  // Filter workflows list
  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.task_title_template.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={styles.workflowsContainer}
    >
      <PageHeader
        title="Recurring Workflows"
        description="Automate repetitive media tasks, schedules, and deliverables generation."
        action={
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setSelectedWorkflow(null);
              setIsDuplicate(false);
              setIsFormOpen(true);
            }}
          >
            Create Workflow
          </Button>
        }
      />

      {/* Dashboard widgets */}
      <div className={styles.dashboardSummary}>
        <WorkflowsDashboardWidget 
          workflows={workflows} 
          monthlyGenerated={historyCount.success}
          failedGenerations={historyCount.failed}
        />
      </div>

      {/* Toolbar Controls */}
      <div className={styles.controlsBar}>
        <div className={styles.searchBox}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search workflows by name or template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Workflows list */}
      {loading ? (
        <LoadingSkeleton count={3} height={140} />
      ) : filteredWorkflows.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className={styles.workflowsGrid}
        >
          {filteredWorkflows.map((flow) => {
            const assigneeName = flow.assignee?.name || 'Unassigned';
            return (
              <motion.div 
                key={flow.id} 
                variants={fadeUpVariants}
                className={styles.workflowCard}
              >
                <div className={styles.cardBanner} />
                
                <div className={styles.cardHeader}>
                  <div className={styles.cardTitleSection}>
                    <span className={styles.categoryTag}>{flow.category}</span>
                    <h3 className={styles.workflowName}>{flow.name}</h3>
                  </div>
                  <span className={`${styles.statusIndicator} ${styles[flow.status]}`}>
                    {flow.status}
                  </span>
                </div>

                <div className={styles.cardBody}>
                  {/* Task Template Preview */}
                  <div className={styles.templatePreview}>
                    <span className={styles.templateLabel}>Title Template</span>
                    <p className={styles.templateText}>{flow.task_title_template}</p>
                  </div>

                  {/* Schedule Specs */}
                  <div className={styles.scheduleDetails}>
                    <div className={styles.scheduleRow}>
                      <Calendar size={14} className={styles.scheduleIcon} />
                      <span className={styles.scheduleValue}>
                        {flow.schedule_type.charAt(0).toUpperCase() + flow.schedule_type.slice(1)} Recurrence
                      </span>
                    </div>
                    <div className={styles.scheduleRow}>
                      <Clock size={14} className={styles.scheduleIcon} />
                      <span>
                        Gen: <span className={styles.scheduleValue}>
                          {flow.generation_offset.replace(/_/g, ' ')}
                        </span> at <span className={styles.scheduleValue}>{flow.generation_time}</span>
                      </span>
                    </div>
                  </div>

                  {/* Footer metadata */}
                  <div className={styles.cardMetaGroup}>
                    <div className={styles.metaItem}>
                      <User size={13} />
                      <span>{assigneeName}</span>
                    </div>
                    {flow.tags && flow.tags.length > 0 && (
                      <div className={styles.metaItem}>
                        <Tag size={13} />
                        <span>#{flow.tags[0]}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardActions}>
                  {/* Left toggle button */}
                  <div className={styles.leftActionGroup}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(flow)}
                      className={styles.actionBtn}
                      title={flow.status === 'active' ? 'Pause Workflow' : 'Activate Workflow'}
                      style={{ color: flow.status === 'active' ? '#B45309' : '#047857' }}
                    >
                      {flow.status === 'active' ? <Pause size={14} /> : <Play size={14} />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHistoryClick(flow)}
                      className={styles.actionBtn}
                      title="View Run History"
                      style={{ color: '#7C3AED' }}
                    >
                      <History size={14} />
                    </Button>
                  </div>

                  {/* Right editing/duplicating actions */}
                  <div className={styles.rightActionGroup}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDuplicateClick(flow)}
                      className={styles.actionBtn}
                      title="Duplicate Configuration"
                    >
                      <Copy size={14} />
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleEditClick(flow)}
                      style={{ height: '32px', fontSize: '11px', padding: '0 12px' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteWorkflow(flow)}
                      className={styles.actionBtn}
                      title="Delete Workflow"
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <div style={{ textAlign: 'center', padding: '64px 32px', backgroundColor: '#FFFFFF', borderRadius: 24, border: '1px solid rgba(226, 232, 240, 0.8)' }}>
          <RefreshCw size={48} style={{ color: '#7C3AED', animation: 'spin 12s linear infinite', marginBottom: 16 }} />
          <h3 style={{ margin: 0, fontSize: '18px', color: '#1E293B' }}>No Recurring Workflows Found</h3>
          <p style={{ margin: '8px 0 16px 0', fontSize: '14px', color: '#64748B' }}>Add repetitive tasks to automate your team workspace.</p>
          <Button 
            variant="primary" 
            size="sm" 
            leftIcon={<Plus size={16} />}
            onClick={() => {
              setSelectedWorkflow(null);
              setIsDuplicate(false);
              setIsFormOpen(true);
            }}
          >
            Create Workflow
          </Button>
        </div>
      )}

      {/* Form builder Modal */}
      <WorkflowModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        workflow={selectedWorkflow}
        isDuplicate={isDuplicate}
        onSave={handleSaveWorkflow}
      />

      {/* History Log view Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        workflow={selectedWorkflow}
        onOpenTask={handleOpenTask}
      />

    </motion.div>
  );
};

export default RecurringWorkflows;
