import React from 'react';
import {
  CheckSquare,
  CheckCircle,
  AlertTriangle,
  Globe,
  ShieldCheck,
  UserPlus,
  Play,
  Check
} from 'lucide-react';
import Button from '../../../components/Button/Button';
import styles from './WorkflowActions.module.scss';

const getActionIcon = (id) => {
  switch (id) {
    case 'assign-task': return <UserPlus />;
    case 'start-working': return <Play />;
    case 'submit-review': return <CheckSquare />;
    case 'start-review': return <ShieldCheck />;
    case 'approve': return <CheckCircle />;
    case 'request-changes': return <AlertTriangle />;
    case 'publish': return <Globe />;
    case 'complete': return <CheckCircle />;
    default: return null;
  }
};

const STAGES = [
  { key: 'created', label: 'Created' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'working', label: 'Working' },
  { key: 'review', label: 'In Review', matches: ['ready_for_review', 'reviewing'] },
  { key: 'approved', label: 'Approved' },
  { key: 'published', label: 'Published' },
  { key: 'completed', label: 'Completed' }
];

const getActiveStageIndex = (currentStatus) => {
  if (!currentStatus) return 0;
  const norm = currentStatus.toLowerCase().replace(/\s+/g, '_');
  return STAGES.findIndex((s) => {
    if (s.matches) return s.matches.includes(norm);
    return s.key === norm;
  });
};

const WorkflowActions = ({ actions = [], onActionClick, currentStatus }) => {
  const activeIndex = getActiveStageIndex(currentStatus);

  // Check if "Submit for Review" is currently present in the list but disabled
  const isSubmitDisabled = actions.some((a) => a.id === 'submit-review' && !a.enabled);

  return (
    <div className={styles.actionsPanel}>
      <h3 className={styles.sectionTitle}>Workflow status</h3>

      {/* Compact Horizontal Stepper Progress Bar */}
      <div className={styles.stepperContainer}>
        <div className={styles.progressLineBg} />
        <div
          className={styles.progressLineActive}
          style={{ width: `calc((${activeIndex} / 6) * (100% - (100% / 7)))` }}
        />

        <div className={styles.stepsList}>
          {STAGES.map((stage, idx) => {
            const isCompleted = idx < activeIndex;
            const isActive = idx === activeIndex;
            const isFuture = idx > activeIndex;

            let stepStateClass = styles.future;
            if (isCompleted) stepStateClass = styles.completed;
            else if (isActive) stepStateClass = styles.active;

            return (
              <div key={stage.key} className={`${styles.stepNode} ${stepStateClass}`}>
                <div className={styles.nodeCircle}>
                  {isCompleted ? <Check className={styles.checkIcon} /> : idx + 1}
                </div>
                <span className={styles.nodeLabel}>{stage.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Relevant Action Buttons Group */}
      <div className={styles.actionsFooterRow}>
        <span className={styles.actionsLabel}>Available Actions:</span>
        <div className={styles.buttonsGroup}>
          {actions.map((act) => (
            <Button
              key={act.id}
              variant={act.variant || 'secondary'}
              size="md"
              leftIcon={getActionIcon(act.id)}
              onClick={() => onActionClick(act.targetStatus)}
              disabled={!act.enabled}
            >
              {act.label}
            </Button>
          ))}
          {actions.length === 0 && (
            <span className={styles.noActionsMsg}>No actions available for current role.</span>
          )}
        </div>
      </div>

      {isSubmitDisabled && (
        <p className={styles.hintText}>
          * Note: You must upload a deliverable asset file before you can Submit for Review.
        </p>
      )}
    </div>
  );
};

export default WorkflowActions;
