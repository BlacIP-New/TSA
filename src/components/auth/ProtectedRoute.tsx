import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[];
}

export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const roles = requiredRoles ?? (requiredRole ? [requiredRole] : []);
  const missingAuth = !isLoading && !isAuthenticated;
  const missingRole =
    !isLoading &&
    isAuthenticated &&
    roles.length > 0 &&
    (!user?.role || !roles.includes(user.role));

  useEffect(() => {
    if (missingAuth) {
      router.replace('/login');
    }
    if (missingRole) {
      router.replace('/dashboard');
    }
  }, [missingAuth, missingRole, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E8001C]/30 border-t-[#E8001C] animate-spin" />
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (missingAuth || missingRole) {
    return null;
  }

  return <>{children}</>;
}
