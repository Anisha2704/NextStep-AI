export const PASSWORD_RULES = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (pwd) => typeof pwd === 'string' && pwd.length >= 8,
    error: 'Password must be at least 8 characters.',
  },
  {
    id: 'uppercase',
    label: 'At least one uppercase letter (A-Z)',
    test: (pwd) => typeof pwd === 'string' && /[A-Z]/.test(pwd),
    error: 'Password must contain at least one uppercase letter.',
  },
  {
    id: 'lowercase',
    label: 'At least one lowercase letter (a-z)',
    test: (pwd) => typeof pwd === 'string' && /[a-z]/.test(pwd),
    error: 'Password must contain at least one lowercase letter.',
  },
  {
    id: 'number',
    label: 'At least one number (0-9)',
    test: (pwd) => typeof pwd === 'string' && /[0-9]/.test(pwd),
    error: 'Password must contain at least one number.',
  },
  {
    id: 'special',
    label: 'At least one special character (!@#$%^&*...)',
    test: (pwd) => typeof pwd === 'string' && /[^A-Za-z0-9]/.test(pwd),
    error: 'Password must contain at least one special character.',
  },
];

/**
 * Validate a password against complexity requirements.
 * @param {string} password
 * @returns {{ isValid: boolean, errors: string[], ruleStatus: Array<{ id: string, label: string, passed: boolean, error: string }> }}
 */
export const validatePassword = (password = '') => {
  if (!password) {
    return {
      isValid: false,
      errors: ['Password is required.'],
      ruleStatus: PASSWORD_RULES.map((rule) => ({ ...rule, passed: false })),
    };
  }

  const ruleStatus = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    passed: rule.test(password),
    error: rule.error,
  }));

  const errors = ruleStatus.filter((r) => !r.passed).map((r) => r.error);

  return {
    isValid: errors.length === 0,
    errors,
    ruleStatus,
  };
};

/**
 * Calculate password strength score (0 to 4).
 * @param {string} password
 * @returns {{ score: number, label: string, color: string }}
 */
export const getPasswordStrength = (password = '') => {
  if (!password) return { score: 0, label: 'None', color: 'bg-border' };
  let passedCount = 0;
  for (const rule of PASSWORD_RULES) {
    if (rule.test(password)) passedCount++;
  }

  if (passedCount <= 2) {
    return { score: 1, label: 'Weak', color: 'bg-error' };
  }
  if (passedCount <= 4) {
    return { score: 2, label: 'Medium', color: 'bg-warning' };
  }
  return { score: 3, label: 'Strong', color: 'bg-success' };
};
