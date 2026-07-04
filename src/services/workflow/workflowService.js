// Centralized Workflow Engine Rules & Configurations
// Manages task status flows, transition validation, and action buttons mapping.

import { STATUSES, ROLES } from '../../constants';

// Allowed task transition pathways (including backwards/undo steps)
export const WORKFLOW_TRANSITIONS = {
  [STATUSES.CREATED]: [STATUSES.ASSIGNED],
  [STATUSES.ASSIGNED]: [STATUSES.WORKING],
  [STATUSES.WORKING]: [STATUSES.READY_FOR_REVIEW],
  [STATUSES.READY_FOR_REVIEW]: [STATUSES.REVIEWING, STATUSES.WORKING], // 'working' = Creator Undo
  [STATUSES.REVIEWING]: [STATUSES.APPROVED, STATUSES.WORKING, STATUSES.READY_FOR_REVIEW], // 'ready_for_review' = Reviewer Undo Start
  [STATUSES.APPROVED]: [STATUSES.PUBLISHED, STATUSES.REVIEWING], // 'reviewing' = Reviewer Undo Approve
  [STATUSES.PUBLISHED]: [STATUSES.COMPLETED, STATUSES.APPROVED], // 'approved' = Reviewer Undo Publish
  [STATUSES.COMPLETED]: [STATUSES.PUBLISHED] // 'published' = Reopen
};

/**
 * Validates if a task status transition is permitted by workflow rules
 * @param {string} currentStatus 
 * @param {string} targetStatus 
 * @returns {boolean}
 */
export const isValidTransition = (currentStatus, targetStatus) => {
  if (!currentStatus || !targetStatus) return false;
  
  const normCurrent = currentStatus.toLowerCase().replace(/\s+/g, '_');
  const normTarget = targetStatus.toLowerCase().replace(/\s+/g, '_');
  
  const allowed = WORKFLOW_TRANSITIONS[normCurrent];
  return allowed ? allowed.includes(normTarget) : false;
};

/**
 * Generates active workflow buttons dynamically
 * @param {string} status - Current status
 * @param {string} role - 'creator' | 'reviewer'
 * @param {boolean} hasDeliverable - Is a deliverable uploaded?
 * @returns {Array<{ id: string, label: string, targetStatus: string, variant: string, enabled: boolean }>}
 */
export const getStatusActions = (status, role, hasDeliverable = false) => {
  if (!status || !role) return [];
  
  const normStatus = status.toLowerCase().replace(/\s+/g, '_');
  const normRole = role.toLowerCase();
  const actions = [];

  if (normRole === ROLES.CREATOR) {
    // Creator Actions
    if (normStatus === STATUSES.CREATED) {
      actions.push({
        id: 'assign-task',
        label: 'Accept & Assign',
        targetStatus: STATUSES.ASSIGNED,
        variant: 'primary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.ASSIGNED) {
      actions.push({
        id: 'start-working',
        label: 'Start Working',
        targetStatus: STATUSES.WORKING,
        variant: 'primary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.WORKING) {
      actions.push({
        id: 'submit-review',
        label: 'Submit For Review',
        targetStatus: STATUSES.READY_FOR_REVIEW,
        variant: 'primary',
        enabled: hasDeliverable // Requires deliverable file uploaded
      });
    }
    if (normStatus === STATUSES.READY_FOR_REVIEW) {
      actions.push({
        id: 'undo-submit',
        label: 'Undo Submit',
        targetStatus: STATUSES.WORKING,
        variant: 'secondary',
        enabled: true
      });
    }
  } else if (normRole === ROLES.REVIEWER) {
    // Reviewer Actions
    if (normStatus === STATUSES.CREATED) {
      actions.push({
        id: 'assign-task',
        label: 'Accept & Assign',
        targetStatus: STATUSES.ASSIGNED,
        variant: 'primary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.ASSIGNED) {
      actions.push({
        id: 'start-working',
        label: 'Start Working',
        targetStatus: STATUSES.WORKING,
        variant: 'primary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.READY_FOR_REVIEW) {
      actions.push({
        id: 'start-review',
        label: 'Start Review',
        targetStatus: STATUSES.REVIEWING,
        variant: 'primary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.REVIEWING) {
      actions.push({
        id: 'approve',
        label: 'Approve Asset',
        targetStatus: STATUSES.APPROVED,
        variant: 'success',
        enabled: true
      });
      actions.push({
        id: 'request-changes',
        label: 'Request Changes',
        targetStatus: STATUSES.WORKING,
        variant: 'warning',
        enabled: true
      });
      actions.push({
        id: 'undo-review',
        label: 'Undo Start Review',
        targetStatus: STATUSES.READY_FOR_REVIEW,
        variant: 'secondary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.APPROVED) {
      actions.push({
        id: 'publish',
        label: 'Mark Published',
        targetStatus: STATUSES.PUBLISHED,
        variant: 'review',
        enabled: true
      });
      actions.push({
        id: 'undo-approve',
        label: 'Undo Approval',
        targetStatus: STATUSES.REVIEWING,
        variant: 'secondary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.PUBLISHED) {
      actions.push({
        id: 'complete',
        label: 'Complete Task',
        targetStatus: STATUSES.COMPLETED,
        variant: 'primary',
        enabled: true
      });
      actions.push({
        id: 'undo-publish',
        label: 'Undo Publish',
        targetStatus: STATUSES.APPROVED,
        variant: 'secondary',
        enabled: true
      });
    }
    if (normStatus === STATUSES.COMPLETED) {
      actions.push({
        id: 'reopen-task',
        label: 'Reopen Task',
        targetStatus: STATUSES.PUBLISHED,
        variant: 'secondary',
        enabled: true
      });
    }
  }

  return actions;
};

export const WorkflowService = {
  isValidTransition,
  getStatusActions
};
