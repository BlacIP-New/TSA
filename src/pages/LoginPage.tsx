import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/authService';
import { validateEmail } from '../utils/validators';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const { setUser } = useAuth();
  const navigate = useNavigate();

  function validate(): boolean {
    const errors: { email?: string; password?: string } = {};
    const emailErr = validateEmail(email);
    if (emailErr) errors.email = emailErr;
    if (!password) errors.password = 'Password is required.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { user } = await login({ email, password });
      setUser(user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 relative overflow-hidden flex-col justify-between p-12">
        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E8001C] flex items-center justify-center">
              <span className="text-white font-black text-sm">e</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              <span className="text-[#E8001C]">e</span>tranzact
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-white/80">Secure Government Revenue Portal</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight">
            TSA Collection<br />
            <span className="text-[#E8001C]">Insight Portal</span>
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-sm">
            Self-service visibility into your settled TSA collections.
            Reconcile, audit, and report — independently and on demand.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-4">
            {[
              { label: 'MDAs Onboarded', value: '240+' },
              { label: 'Transactions Tracked', value: '1.2M+' },
              { label: 'Settled Volume', value: '₦890B+' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg border border-gray-300 bg-white p-4">
                <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                <div className="mt-0.5 text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-gray-600">
          Powered by eTranzact International Plc &bull; CBN Licensed
        </div>

        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8001C]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#E8001C]/5 rounded-full translate-y-1/2 -translate-x-1/4" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1">
              Sign in to access your collection dashboard
            </p>
          </div>

          {error && (
            <Alert variant="error" message={error} className="mb-5" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="you@organisation.gov.ng"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              error={fieldErrors.email}
              leftAddon={<Mail className="w-4 h-4" />}
              autoComplete="email"
              autoFocus
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
              error={fieldErrors.password}
              leftAddon={<Lock className="w-4 h-4" />}
              rightAddon={
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="cursor-pointer hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
              autoComplete="current-password"
            />

            <div className="flex justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-[#E8001C] hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-8 rounded-lg border border-gray-300 bg-white p-4">
            <p className="mb-2 text-xs font-semibold text-slate-700">Demo credentials</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div>
                <span className="font-medium">Aggregator Admin:</span>{' '}
                admin@nsw.gov.ng / Admin@1234
              </div>
              <div>
                <span className="font-medium">MDA Viewer:</span>{' '}
                finance@fmf.gov.ng / Viewer@1234
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Having trouble? Contact your aggregator administrator or{' '}
            <a href="mailto:support@etranzact.com" className="text-[#E8001C] hover:underline">
              support@etranzact.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
