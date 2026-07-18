import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // If initial auth is still loading, let the provider show the loader screen
  if (loading) {
    return null; 
  }

  // Redirect to login page and store current location for post-auth redirections
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If this is the student portal terminal account, restrict them exclusively to /lab/portal
  if (user && user.email === 'mediasquad@zainussunna.com' && location.pathname !== '/lab/portal') {
    return <Navigate to="/lab/portal" replace />;
  }

  return children;
};

export default ProtectedRoute;
