'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import MDAManagementPage from '../../../views/MDAManagementPage';

export default function RouteMDAManagementPage() {
  return (
    <ProtectedRoute requiredRoles={['system_admin', 'system_user', 'mda_admin']}>
      <MDAManagementPage />
    </ProtectedRoute>
  );
}