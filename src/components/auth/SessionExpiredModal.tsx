import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock } from 'lucide-react';
import { Button } from '../ui/Button';

export function SessionExpiredModal() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function handler() { setVisible(true); }
    window.addEventListener('tsa:session-expired', handler);
    return () => window.removeEventListener('tsa:session-expired', handler);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-lg border border-gray-300 p-8 max-w-sm w-full mx-4 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Session expired</h2>
          <p className="text-sm text-gray-500 mt-1.5">
            Your session has been inactive for 30 minutes and has been automatically terminated for security.
          </p>
        </div>
        <Button
          className="w-full"
          onClick={() => { setVisible(false); navigate('/login'); }}
        >
          Sign in again
        </Button>
      </div>
    </div>
  );
}
