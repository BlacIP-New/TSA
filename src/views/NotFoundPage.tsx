import Link from 'next/link';
import { Logo } from '../components/ui/Logo';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <Logo className="mb-8" />
      <div className="text-6xl font-black text-gray-100 mb-2">404</div>
      <h1 className="text-xl font-bold text-gray-800">Page not found</h1>
      <p className="text-gray-500 text-sm mt-1 mb-6">
        The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/dashboard">
        <Button variant="secondary">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
