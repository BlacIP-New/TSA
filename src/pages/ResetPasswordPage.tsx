import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { confirmPasswordReset } from '../services/authService';
import { validatePassword } from '../utils/validators';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  function validate(): boolean {
    const errors: { password?: string; confirm?: string } = {};
    const pwdErr = validatePassword(password);
    if (pwdErr) errors.password = pwdErr;
    if (password !== confirmPassword) errors.confirm = 'Passwords do not match.';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await confirmPasswordReset(token, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-sm">
          <Logo className="justify-center" />
          <Alert variant="error" message="Invalid or missing reset token. Please request a new password reset link." />
          <Link to="/forgot-password">
            <Button variant="secondary" size="sm">Request new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Password updated</h2>
                <p className="text-sm text-gray-500 mt-2">
                  Your password has been successfully reset. You can now sign in with your new password.
                </p>
              </div>
              <Button className="w-full" onClick={() => navigate('/login')}>
                Sign in
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Set new password</h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  Choose a strong password for your account.
                </p>
              </div>

              {error && <Alert variant="error" message={error} className="mb-4" />}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="New password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setFieldErrors((p) => ({ ...p, password: undefined })); }}
                  error={fieldErrors.password}
                  hint="At least 8 characters, one uppercase, one number, one special character."
                  leftAddon={<Lock className="w-4 h-4" />}
                  rightAddon={
                    <button type="button" onClick={() => setShowPassword((s) => !s)} tabIndex={-1} className="cursor-pointer hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  autoFocus
                />
                <Input
                  label="Confirm new password"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setFieldErrors((p) => ({ ...p, confirm: undefined })); }}
                  error={fieldErrors.confirm}
                  leftAddon={<Lock className="w-4 h-4" />}
                  rightAddon={
                    <button type="button" onClick={() => setShowConfirm((s) => !s)} tabIndex={-1} className="cursor-pointer hover:text-gray-600">
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Reset password
                </Button>
              </form>
            </>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
