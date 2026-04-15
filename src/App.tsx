import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SessionExpiredModal } from './components/auth/SessionExpiredModal';
import { router } from './router';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <SessionExpiredModal />
    </AuthProvider>
  );
}
