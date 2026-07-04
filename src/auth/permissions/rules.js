// Scalable Role-Based Access Control (RBAC) rules configuration

const PERMISSION_RULES = {
  creator: {
    canCreateTask: true,
    canAssignTask: true,
    canReviewTask: false,
    canApproveTask: false,
    canPublishTask: false,
    canCompleteTask: false
  },
  reviewer: {
    canCreateTask: true,
    canAssignTask: true,
    canReviewTask: true,
    canApproveTask: true,
    canPublishTask: true,
    canCompleteTask: true
  }
};

/**
 * Checks if a role is permitted to perform a workflow operation
 * @param {string} role - 'creator' | 'reviewer'
 * @param {string} permission - Permission keys
 * @returns {boolean}
 */
export const checkPermission = (role, permission) => {
  if (!role || !PERMISSION_RULES[role.toLowerCase()]) return false;
  return !!PERMISSION_RULES[role.toLowerCase()][permission];
};

export default PERMISSION_RULES;
