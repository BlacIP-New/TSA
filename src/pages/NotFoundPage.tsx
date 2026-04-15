import { useNavigate } from 'react-router-dom';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <Logo className="mb-8" />
      <div className="text-6xl font-black text-gray-100 mb-2">404</div>
      <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        The page you're looking for doesn't exist or you don't have access to it.
      </p>
      <Button variant="secondary" onClick={() => navigate('/dashboard')}>
        Back to Dashboard
      </Button>
    </div>
  );
}
