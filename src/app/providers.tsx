'use client';

import { AuthProvider } from '../context/AuthContext';
import { FilterProvider } from '../context/FilterContext';
import { ToastProvider } from '../context/ToastContext';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <FilterProvider>{children}</FilterProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}