import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
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
const TeamHub = lazy(() => import('../pages/TeamHub/TeamHub'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <LoadingSkeleton count={3} height={80} />
    </div>
  }>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />
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
        path: 'team-hub',
        element: (
          <SuspenseWrapper>
            <TeamHub />
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
