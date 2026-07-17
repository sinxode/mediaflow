import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, Clock, Sparkles } from 'lucide-react';
import Modal from '../../components/Modal/Modal';
import Button from '../../components/Button/Button';
import { UserService } from '../../services/users/userService';
import { CATEGORIES, PRIORITIES } from '../../constants';
import styles from './RecurringWorkflows.module.scss';

const INITIAL_FORM = {
  name: '',
  task_title_template: '',
  task_description_template: '',
  category: Object.values(CATEGORIES)[0],
  priority: PRIORITIES.MEDIUM,
  assigned_to: '',
  backup_assignee_id: '',
  checklist: [],
  estimated_duration: '',
  tags: [],
  schedule_type: 'weekly',
  schedule_config: {
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    everyXDays: 1,
    everyXWeeks: 1,
    weekdays: ['thursday', 'friday'],
    mode: 'day_of_month',
    dayOfMonth: 10,
    nth: 'first',
    weekday: 'wednesday',
    month: 1,
    day: 1
  },
  generation_offset: 'immediately',
  generation_time: '09:00'
};

const WEEKDAYS = [
  { name: 'Mon', value: 'monday' },
  { name: 'Tue', value: 'tuesday' },
  { name: 'Wed', value: 'wednesday' },
  { name: 'Thu', value: 'thursday' },
  { name: 'Fri', value: 'friday' },
  { name: 'Sat', value: 'satday' }, // aligned to custom strings
  { name: 'Sun', value: 'sunday' }
];

const MONTHS = [
  { name: 'January', value: 1 },
  { name: 'February', value: 2 },
  { name: 'March', value: 3 },
  { name: 'April', value: 4 },
  { name: 'May', value: 5 },
  { name: 'June', value: 6 },
  { name: 'July', value: 7 },
  { name: 'August', value: 8 },
  { name: 'September', value: 9 },
  { name: 'October', value: 10 },
  { name: 'November', value: 11 },
  { name: 'December', value: 12 }
];

const WorkflowModal = ({ isOpen, onClose, workflow, isDuplicate = false, onSave }) => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [users, setUsers] = useState([]);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newTag, setNewTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Load real team members for dropdown lists
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const list = await UserService.getAllUsers();
        setUsers(list || []);
      } catch (err) {
        console.error('Failed to load assignees', err);
      }
    };
    loadUsers();
  }, []);

  // Sync form state when modal opens or workflow selection changes
  useEffect(() => {
    if (workflow) {
      const parsedConfig = {
        ...INITIAL_FORM.schedule_config,
        ...(workflow.schedule_config || {})
      };
      
      setForm({
        name: isDuplicate ? `${workflow.name} (Copy)` : workflow.name,
        task_title_template: workflow.task_title_template,
        task_description_template: workflow.task_description_template || '',
        category: workflow.category,
        priority: workflow.priority,
        assigned_to: workflow.assigned_to || '',
        backup_assignee_id: workflow.backup_assignee_id || '',
        checklist: workflow.checklist || [],
        estimated_duration: workflow.estimated_duration || '',
        tags: workflow.tags || [],
        schedule_type: workflow.schedule_type,
        schedule_config: parsedConfig,
        generation_offset: workflow.generation_offset || 'immediately',
        generation_time: workflow.generation_time || '09:00'
      });
    } else {
      setForm(INITIAL_FORM);
    }
  }, [workflow, isOpen, isDuplicate]);

  const handleChange = (field, val) => {
    setForm(prev => ({
      ...prev,
      [field]: val
    }));
  };

  const handleConfigChange = (field, val) => {
    setForm(prev => ({
      ...prev,
      schedule_config: {
        ...prev.schedule_config,
        [field]: val
      }
    }));
  };

  const handleAddChecklist = (e) => {
    if (e) e.preventDefault();
    if (!newChecklistItem.trim()) return;
    handleChange('checklist', [...form.checklist, newChecklistItem.trim()]);
    setNewChecklistItem('');
  };

  const handleRemoveChecklist = (idx) => {
    handleChange('checklist', form.checklist.filter((_, i) => i !== idx));
  };

  const handleAddTag = (e) => {
    if (e) e.preventDefault();
    if (!newTag.trim()) return;
    const cleanTag = newTag.trim().toLowerCase();
    if (!form.tags.includes(cleanTag)) {
      handleChange('tags', [...form.tags, cleanTag]);
    }
    setNewTag('');
  };

  const handleRemoveTag = (tag) => {
    handleChange('tags', form.tags.filter(t => t !== tag));
  };

  const handleWeekdayToggle = (dayValue) => {
    const current = form.schedule_config.weekdays || [];
    const updated = current.includes(dayValue)
      ? current.filter(w => w !== dayValue)
      : [...current, dayValue];
    handleConfigChange('weekdays', updated);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!form.name.trim()) return alert('Please provide a workflow name.');
    if (!form.task_title_template.trim()) return alert('Please enter a task title template.');

    try {
      setSubmitting(true);
      
      const payload = {
        ...form,
        name: form.name.trim(),
        task_title_template: form.task_title_template.trim(),
        task_description_template: form.task_description_template.trim(),
        assigned_to: form.assigned_to || null,
        backup_assignee_id: form.backup_assignee_id || null,
      };

      await onSave(payload);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Save failed: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={workflow ? (isDuplicate ? 'Duplicate Workflow' : 'Edit Recurring Workflow') : 'Create Recurring Workflow'}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} loading={submitting}>
            Save Workflow
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className={styles.formGrid}>
        
        {/* Section 1: Basic details */}
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Basic Information</h4>
          <div className={styles.inputGroup}>
            <label>Workflow Config Name</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="e.g. Weekly Live Broadcast Schedule..."
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>Asset Category</label>
              <select
                className={styles.selectField}
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {Object.values(CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Priority Level</label>
              <select
                className={styles.selectField}
                value={form.priority}
                onChange={(e) => handleChange('priority', e.target.value)}
              >
                <option value={PRIORITIES.LOW}>Low</option>
                <option value={PRIORITIES.MEDIUM}>Medium</option>
                <option value={PRIORITIES.HIGH}>High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Task template builder */}
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Task Deliverable Template</h4>
          
          <div className={styles.inputGroup}>
            <label>Task Title Template (Supports {`{Date}`}, {`{Month}`}, {`{Day}`}, {`{Year}`}, {`{WeekNumber}`})</label>
            <input
              type="text"
              className={styles.inputField}
              placeholder="e.g. Friday Live Broadcast - {Date}..."
              value={form.task_title_template}
              onChange={(e) => handleChange('task_title_template', e.target.value)}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Task Instruction Template</label>
            <textarea
              className={styles.textareaField}
              placeholder="Provide default steps, deliverables requirements, or copy instructions..."
              value={form.task_description_template}
              onChange={(e) => handleChange('task_description_template', e.target.value)}
            />
          </div>

          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>Default Assignee</label>
              <select
                className={styles.selectField}
                value={form.assigned_to}
                onChange={(e) => handleChange('assigned_to', e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Backup Assignee (Optional)</label>
              <select
                className={styles.selectField}
                value={form.backup_assignee_id}
                onChange={(e) => handleChange('backup_assignee_id', e.target.value)}
              >
                <option value="">None</option>
                {users.map(u => (
                  <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>Estimated Duration (e.g. 2h, 1d)</label>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g. 4 hours..."
                value={form.estimated_duration}
                onChange={(e) => handleChange('estimated_duration', e.target.value)}
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label>Tags (Press Enter to add)</label>
              <div className={styles.checklistInputRow}>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="e.g. design, live..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                />
                <Button type="button" variant="secondary" onClick={handleAddTag}>Add</Button>
              </div>
              <div className={styles.tagsContainer}>
                {form.tags.map(tag => (
                  <span key={tag} className={styles.tagPill}>
                    #{tag}
                    <button type="button" onClick={() => handleRemoveTag(tag)} className={styles.tagRemoveBtn}>
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Checklist Manager */}
          <div className={styles.inputGroup} style={{ marginTop: 8 }}>
            <label>Default Task Checklist Items</label>
            <div className={styles.checklistInputRow}>
              <input
                type="text"
                className={styles.inputField}
                placeholder="e.g. Upload raw thumbnail..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklist();
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={handleAddChecklist}>
                <Plus size={16} />
              </Button>
            </div>
            <div className={styles.checklistManager}>
              {form.checklist.map((item, idx) => (
                <div key={idx} className={styles.checklistItem}>
                  <span>{idx + 1}. {item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveChecklist(idx)}
                    style={{ color: '#EF4444', height: '24px', padding: 0 }}
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Scheduling config */}
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Workflow Recurrence Schedule</h4>
          
          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>Frequency Type</label>
              <select
                className={styles.selectField}
                value={form.schedule_type}
                onChange={(e) => handleChange('schedule_type', e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Start Date</label>
              <input
                type="date"
                className={styles.inputField}
                value={form.schedule_config.startDate || ''}
                onChange={(e) => handleConfigChange('startDate', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Daily inputs */}
          {form.schedule_type === 'daily' && (
            <div className={styles.row2}>
              <div className={styles.inputGroup}>
                <label>Recur Frequency</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px' }}>Every</span>
                  <input
                    type="number"
                    min="1"
                    className={styles.inputField}
                    style={{ width: '80px' }}
                    value={form.schedule_config.everyXDays || 1}
                    onChange={(e) => handleConfigChange('everyXDays', parseInt(e.target.value) || 1)}
                  />
                  <span style={{ fontSize: '13px' }}>day(s)</span>
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label>End Date (Optional)</label>
                <input
                  type="date"
                  className={styles.inputField}
                  value={form.schedule_config.endDate || ''}
                  onChange={(e) => handleConfigChange('endDate', e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Weekly inputs */}
          {form.schedule_type === 'weekly' && (
            <div className={styles.formSection} style={{ border: 'none', padding: 0 }}>
              <div className={styles.row2}>
                <div className={styles.inputGroup}>
                  <label>Recur Frequency</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px' }}>Every</span>
                    <input
                      type="number"
                      min="1"
                      className={styles.inputField}
                      style={{ width: '80px' }}
                      value={form.schedule_config.everyXWeeks || 1}
                      onChange={(e) => handleConfigChange('everyXWeeks', parseInt(e.target.value) || 1)}
                    />
                    <span style={{ fontSize: '13px' }}>week(s)</span>
                  </div>
                </div>
                <div className={styles.inputGroup}>
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    className={styles.inputField}
                    value={form.schedule_config.endDate || ''}
                    onChange={(e) => handleConfigChange('endDate', e.target.value)}
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label>Select Weekdays</label>
                <div className={styles.weekdayGrid}>
                  {WEEKDAYS.map(day => {
                    const checked = (form.schedule_config.weekdays || []).includes(day.value);
                    return (
                      <div
                        key={day.value}
                        onClick={() => handleWeekdayToggle(day.value)}
                        className={`${styles.weekdayCheckbox} ${checked ? styles.checked : ''}`}
                      >
                        {day.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Monthly inputs */}
          {form.schedule_type === 'monthly' && (
            <div className={styles.formSection} style={{ border: 'none', padding: 0 }}>
              <div className={styles.row2}>
                <div className={styles.inputGroup}>
                  <label>Monthly Mode</label>
                  <select
                    className={styles.selectField}
                    value={form.schedule_config.mode}
                    onChange={(e) => handleConfigChange('mode', e.target.value)}
                  >
                    <option value="day_of_month">Specific Day of Month</option>
                    <option value="nth_weekday">Relative Weekday (e.g. First Wed)</option>
                  </select>
                </div>
                
                <div className={styles.inputGroup}>
                  <label>End Date (Optional)</label>
                  <input
                    type="date"
                    className={styles.inputField}
                    value={form.schedule_config.endDate || ''}
                    onChange={(e) => handleConfigChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              {form.schedule_config.mode === 'day_of_month' ? (
                <div className={styles.inputGroup}>
                  <label>Day of Month</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px' }}>Every month on the</span>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      className={styles.inputField}
                      style={{ width: '80px' }}
                      value={form.schedule_config.dayOfMonth || 10}
                      onChange={(e) => handleConfigChange('dayOfMonth', parseInt(e.target.value) || 1)}
                    />
                    <span style={{ fontSize: '13px' }}>th day</span>
                  </div>
                </div>
              ) : (
                <div className={styles.row2}>
                  <div className={styles.inputGroup}>
                    <label>Nth Weekday Occurrence</label>
                    <select
                      className={styles.selectField}
                      value={form.schedule_config.nth}
                      onChange={(e) => handleConfigChange('nth', e.target.value)}
                    >
                      <option value="first">First</option>
                      <option value="second">Second</option>
                      <option value="third">Third</option>
                      <option value="fourth">Fourth</option>
                      <option value="last">Last</option>
                    </select>
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Target Weekday</label>
                    <select
                      className={styles.selectField}
                      value={form.schedule_config.weekday}
                      onChange={(e) => handleConfigChange('weekday', e.target.value)}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Yearly inputs */}
          {form.schedule_type === 'yearly' && (
            <div className={styles.formSection} style={{ border: 'none', padding: 0 }}>
              <div className={styles.row2}>
                <div className={styles.inputGroup}>
                  <label>Select Month</label>
                  <select
                    className={styles.selectField}
                    value={form.schedule_config.month}
                    onChange={(e) => handleConfigChange('month', parseInt(e.target.value) || 1)}
                  >
                    {MONTHS.map(m => (
                      <option key={m.value} value={m.value}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div className={styles.inputGroup}>
                  <label>Day of Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    className={styles.inputField}
                    value={form.schedule_config.day || 1}
                    onChange={(e) => handleConfigChange('day', parseInt(e.target.value) || 1)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 4: Task Generation timing and offset */}
        <div className={styles.formSection}>
          <h4 className={styles.sectionTitle}>Task Generation Timing</h4>
          <div className={styles.row2}>
            <div className={styles.inputGroup}>
              <label>Generate Task Before Event</label>
              <select
                className={styles.selectField}
                value={form.generation_offset}
                onChange={(e) => handleChange('generation_offset', e.target.value)}
              >
                <option value="immediately">Immediately (On event day)</option>
                <option value="hours_1">1 Hour before</option>
                <option value="hours_6">6 Hours before</option>
                <option value="hours_12">12 Hours before</option>
                <option value="days_1">1 Day before</option>
                <option value="days_2">2 Days before</option>
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label>Execution Time (HH:MM)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} style={{ color: '#7C3AED' }} />
                <input
                  type="time"
                  className={styles.inputField}
                  value={form.generation_time}
                  onChange={(e) => handleChange('generation_time', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
        </div>

      </form>
    </Modal>
  );
};

export default WorkflowModal;
