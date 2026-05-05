'use client';

import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import AuditLogPage from '../../../views/AuditLogPage';

export default function RouteAuditLogPage() {
  return (
    <ProtectedRoute requiredRole="system_admin">
      <AuditLogPage />
    </ProtectedRoute>
  );
}