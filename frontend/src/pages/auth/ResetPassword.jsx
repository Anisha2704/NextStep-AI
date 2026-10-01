import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { resetPassword } from '../../services/authService';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import { validatePassword } from '../../utils/passwordValidator';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (isSuccess && countdown === 0) {
      navigate('/login');
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const validate = () => {
    const errors = {};
    const pwdValidation = validatePassword(form.password);
    if (!pwdValidation.isValid) {
      errors.password = pwdValidation.errors[0];
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Please confirm your new password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    if (!token) {
      setError('Password reset token is missing from the URL. Please request a new reset link.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({
        token,
        newPassword: form.password,
      });
      setIsSuccess(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Failed to reset password. The link may have expired or is invalid.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  // Missing token view
  if (!token) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
          <AlertTriangle size={30} />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Invalid Reset Link</h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          No valid reset token was found in your link. The link may be incomplete or corrupted.
        </p>
        <div className="mt-6">
          <Link to="/forgot-password">
            <Button className="w-full">Request New Reset Link</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Success view
  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 size={34} />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Password Reset Complete!</h2>
        <p className="mt-2 text-sm text-text-secondary leading-relaxed">
          Your password has been securely updated. You can now use your new password to sign in.
        </p>

        <p className="mt-4 text-xs text-text-secondary font-medium">
          Redirecting to login in <span className="text-primary font-bold">{countdown}</span> seconds...
        </p>

        <div className="mt-6">
          <Button onClick={() => navigate('/login')} className="w-full flex items-center justify-center gap-2">
            Continue to Sign In
            <ArrowRight size={16} />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Lock size={20} />
        </div>
        <h2 className="text-2xl font-bold text-text-main">Set new password</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Choose a strong password with at least 8 characters.
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => setError('')} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="relative">
            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (validationErrors.password) {
                  setValidationErrors({ ...validationErrors, password: '' });
                }
              }}
              error={validationErrors.password}
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-text-secondary hover:text-text-main"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <PasswordStrengthIndicator password={form.password} />
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat new password"
            value={form.confirmPassword}
            onChange={(e) => {
              setForm({ ...form, confirmPassword: e.target.value });
              if (validationErrors.confirmPassword) {
                setValidationErrors({ ...validationErrors, confirmPassword: '' });
              }
            }}
            error={validationErrors.confirmPassword}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-9 text-text-secondary hover:text-text-main"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reset Password
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

export default ResetPassword;
