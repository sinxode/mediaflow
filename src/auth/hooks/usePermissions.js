import { useMemo } from 'react';
import { useRole } from './useRole';
import { checkPermission } from '../permissions/rules';

export const usePermissions = () => {
  const role = useRole();

  return useMemo(() => ({
    canCreateTask: checkPermission(role, 'canCreateTask'),
    canAssignTask: checkPermission(role, 'canAssignTask'),
    canReviewTask: checkPermission(role, 'canReviewTask'),
    canApproveTask: checkPermission(role, 'canApproveTask'),
    canPublishTask: checkPermission(role, 'canPublishTask'),
    canCompleteTask: checkPermission(role, 'canCompleteTask'),
    hasPermission: (permission) => checkPermission(role, permission)
  }), [role]);
};

export default usePermissions;
