import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { ToastProvider } from './context/ToastContext';
import { router } from './router';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <FilterProvider>
            <RouterProvider router={router} />
          </FilterProvider>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
