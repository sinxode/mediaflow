import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';

export const RoleRoute = ({ children, requiredPermission }) => {
  const { user, loading } = useAuth();
  const permissions = usePermissions();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to dashboard if user doesn't possess the required permission
  if (requiredPermission && !permissions.hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
