import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import MDAManagementPage from './pages/MDAManagementPage';
import AuditLogPage from './pages/AuditLogPage';
import NotFoundPage from './pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/transactions', element: <TransactionsPage /> },
      {
        path: '/mda-management',
        element: (
          <ProtectedRoute requiredRoles={['system_admin', 'system_user', 'mda_admin']}>
            <MDAManagementPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/audit-log',
        element: (
          <ProtectedRoute requiredRole="system_admin">
            <AuditLogPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
