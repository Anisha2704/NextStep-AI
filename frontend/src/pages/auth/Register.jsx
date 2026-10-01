import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff } from 'lucide-react';
import { registerUser, clearError } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import PasswordStrengthIndicator from '../../components/auth/PasswordStrengthIndicator';
import { validatePassword } from '../../utils/passwordValidator';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validate = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errors.email = 'Enter a valid email';

    const pwdValidation = validatePassword(form.password);
    if (!pwdValidation.isValid) {
      errors.password = pwdValidation.errors[0];
    }

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!acceptTerms) errors.terms = 'You must accept the terms';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());
    setSuccess('');
    if (!validate()) return;

    const result = await dispatch(
      registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      const regUser = result.payload?.user;
      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        if (regUser?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }, 1000);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-text-main">Create your account</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Start your personalized career development journey
        </p>
      </div>

      {error && (
        <div className="mb-4">
          <Alert type="error" message={error} onClose={() => dispatch(clearError())} />
        </div>
      )}

      {success && (
        <div className="mb-4">
          <Alert type="success" message={success} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={form.name}
          onChange={(e) => {
            setForm({ ...form, name: e.target.value });
            if (validationErrors.name) setValidationErrors({ ...validationErrors, name: '' });
          }}
          error={validationErrors.name}
        />

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => {
            setForm({ ...form, email: e.target.value });
            if (validationErrors.email) setValidationErrors({ ...validationErrors, email: '' });
          }}
          error={validationErrors.email}
        />

        <div>
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="e.g. Password123!"
              value={form.password}
              onChange={(e) => {
                setForm({ ...form, password: e.target.value });
                if (validationErrors.password) setValidationErrors({ ...validationErrors, password: '' });
              }}
              error={validationErrors.password}
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
            label="Confirm Password"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Repeat password"
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

        <label className="flex items-start gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => {
              setAcceptTerms(e.target.checked);
              if (validationErrors.terms) setValidationErrors({ ...validationErrors, terms: '' });
            }}
            className="mt-0.5 rounded border-border text-primary focus:ring-primary"
          />
          <span>
            I agree to the{' '}
            <Link to="/terms-of-service" className="font-medium text-primary hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="font-medium text-primary hover:underline">
              Privacy Policy
            </Link>
            {validationErrors.terms && (
              <span className="mt-1 block text-xs text-error">{validationErrors.terms}</span>
            )}
          </span>
        </label>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary hover:text-primary-bright">
          Sign in
        </Link>
      </p>

      <p className="mt-4 text-center text-xs text-text-secondary">
        By registering, you agree to our{' '}
        <Link to="/terms-of-service" className="font-medium text-primary hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link to="/privacy-policy" className="font-medium text-primary hover:underline">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
};

export default Register;
