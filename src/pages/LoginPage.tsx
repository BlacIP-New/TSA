import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-[#f2f4f7] px-4 py-10">
      <div className="mx-auto w-full max-w-[760px]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#00a651] text-white">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h1 className="text-[40px] font-semibold tracking-[-0.03em] text-slate-900">TSA Collection Portal</h1>
          <p className="mt-2 text-base text-slate-500">Sign in to your account</p>
        </div>

        <div className="mx-auto w-full max-w-[440px] rounded-xl border border-gray-300 bg-white p-7">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Welcome back</h2>
          </div>

          {error && (
            <Alert variant="error" message={error} className="mb-5" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Email address"
              type="email"
              placeholder="admin@credo.test"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setFieldErrors((p) => ({ ...p, email: undefined })); }}
              error={fieldErrors.email}
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
            <p className="mb-2 text-xs font-semibold text-slate-700">Test accounts</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div>
                <span className="font-medium">Admin:</span>{' '}
                admin@nsw.gov.ng / Admin@1234
              </div>
              <div>
                <span className="font-medium">MDA User:</span>{' '}
                finance@fmf.gov.ng / Viewer@1234
              </div>
            </div>
          </div>

          <p className="mt-6 text-center text-xs text-gray-400">
            Having trouble? Contact your administrator for support.
          </p>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          &copy; 2026 TSA Collection Insight Portal. Powered by Credo.
        </p>
      </div>
    </div>
  );
}
