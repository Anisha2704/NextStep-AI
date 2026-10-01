import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { forgotPassword } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [validationError, setValidationError] = useState('');

  const validate = () => {
    if (!email.trim()) {
      setValidationError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError('Please enter a valid email address');
      return false;
    }
    setValidationError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to process your request. Please try again later.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <CheckCircle2 size={32} />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Check your email</h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          If an account exists for <span className="font-semibold text-text-main">{email}</span>, we&apos;ve sent a password reset link.
        </p>
        <div className="mt-6 rounded-xl border border-border bg-lavender/40 p-4 text-xs text-text-secondary">
          <p>
            Please check your inbox (and spam folder). The link will expire in{' '}
            <strong className="text-text-main">20 minutes</strong> for security reasons.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSubmitted(false);
              setEmail('');
            }}
          >
            Re-enter email or try another
          </Button>

          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary-bright transition-colors"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-main mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Sign In
        </Link>
        <h2 className="text-2xl font-bold text-text-main">Forgot password?</h2>
        <p className="mt-1 text-sm text-text-secondary">
          No worries. Enter your registered email and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Registered Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (validationError) setValidationError('');
          }}
          error={validationError}
          icon={Mail}
          autoFocus
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send Reset Link
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-bright">
          Sign in
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
