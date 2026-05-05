'use client';

import { AppLayoutContainer } from '../../components/layout/AppLayout';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <AppLayoutContainer>{children}</AppLayoutContainer>
    </ProtectedRoute>
  );
}