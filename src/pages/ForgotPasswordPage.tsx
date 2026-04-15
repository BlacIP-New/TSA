import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Logo } from '../components/ui/Logo';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { requestPasswordReset } from '../services/authService';
import { validateEmail } from '../utils/validators';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const err = validateEmail(email);
    if (err) { setEmailError(err); return; }
    setEmailError('');

    setIsLoading(true);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-500" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  We've sent a password reset link to{' '}
                  <span className="font-medium text-gray-700">{email}</span>.
                  The link will expire in 1 hour.
                </p>
              </div>
              <div className="pt-2">
                <p className="text-xs text-gray-400">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={() => { setSubmitted(false); }}
                    className="text-[#E8001C] hover:underline font-medium"
                  >
                    try again
                  </button>
                  .
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Reset your password</h2>
                <p className="text-sm text-gray-500 mt-1.5">
                  Enter the email associated with your account and we'll send a reset link.
                </p>
              </div>

              {error && <Alert variant="error" message={error} className="mb-4" />}

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  placeholder="you@organisation.gov.ng"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
                  error={emailError}
                  leftAddon={<Mail className="w-4 h-4" />}
                  autoFocus
                  autoComplete="email"
                />
                <Button type="submit" className="w-full" isLoading={isLoading}>
                  Send reset link
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
