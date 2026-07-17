import React, { lazy, Suspense } from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout/MainLayout';
import Login from '../pages/Login/Login';
import ProtectedRoute from '../auth/guards/ProtectedRoute';
import RoleRoute from '../auth/guards/RoleRoute';
import LoadingSkeleton from '../components/LoadingSkeleton/LoadingSkeleton';

// Route-based code splitting using lazy loaders
const Dashboard = lazy(() => import('../pages/Dashboard/Dashboard'));
const Tasks = lazy(() => import('../pages/Tasks/Tasks'));
const CreateTask = lazy(() => import('../pages/CreateTask/CreateTask'));
const ReviewQueue = lazy(() => import('../pages/ReviewQueue/ReviewQueue'));
const Published = lazy(() => import('../pages/Published/Published'));
const Profile = lazy(() => import('../pages/Profile/Profile'));
const Settings = lazy(() => import('../pages/Settings/Settings'));
const Notifications = lazy(() => import('../pages/Notifications/Notifications'));
const Analytics = lazy(() => import('../pages/Analytics/Analytics'));
const RecurringWorkflows = lazy(() => import('../pages/RecurringWorkflows/RecurringWorkflows'));

// Ignite LabOS Lazy Components
const StudentPortal = lazy(() => import('../pages/ComputerLab/StudentPortal'));
const LabDashboard = lazy(() => import('../pages/ComputerLab/LabDashboard'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <LoadingSkeleton count={3} height={80} />
    </div>
  }>
    {children}
  </Suspense>
);

export const router = createHashRouter([
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/lab/portal',
    element: (
      <ProtectedRoute>
        <SuspenseWrapper>
          <StudentPortal />
        </SuspenseWrapper>
      </ProtectedRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: (
          <SuspenseWrapper>
            <Dashboard />
          </SuspenseWrapper>
        )
      },
      {
        path: 'tasks',
        element: (
          <SuspenseWrapper>
            <Tasks />
          </SuspenseWrapper>
        )
      },
      {
        path: 'tasks/create',
        element: (
          <RoleRoute requiredPermission="canCreateTask">
            <SuspenseWrapper>
              <CreateTask />
            </SuspenseWrapper>
          </RoleRoute>
        )
      },
      {
        path: 'review',
        element: (
          <RoleRoute requiredPermission="canReviewTask">
            <SuspenseWrapper>
              <ReviewQueue />
            </SuspenseWrapper>
          </RoleRoute>
        )
      },
      {
        path: 'workflows',
        element: (
          <SuspenseWrapper>
            <RecurringWorkflows />
          </SuspenseWrapper>
        )
      },
      {
        path: 'published',
        element: (
          <SuspenseWrapper>
            <Published />
          </SuspenseWrapper>
        )
      },
      {
        path: 'profile',
        element: (
          <SuspenseWrapper>
            <Profile />
          </SuspenseWrapper>
        )
      },
      {
        path: 'settings',
        element: (
          <SuspenseWrapper>
            <Settings />
          </SuspenseWrapper>
        )
      },
      {
        path: 'notifications',
        element: (
          <SuspenseWrapper>
            <Notifications />
          </SuspenseWrapper>
        )
      },
      {
        path: 'analytics',
        element: (
          <SuspenseWrapper>
            <Analytics />
          </SuspenseWrapper>
        )
      },
      {
        path: 'lab/dashboard',
        element: (
          <SuspenseWrapper>
            <LabDashboard />
          </SuspenseWrapper>
        )
      },
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />
      }
    ]
  }
]);
