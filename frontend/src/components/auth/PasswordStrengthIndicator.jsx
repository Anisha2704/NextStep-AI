import { Check, X } from 'lucide-react';
import { validatePassword, getPasswordStrength } from '../../utils/passwordValidator';

const PasswordStrengthIndicator = ({ password = '', showRules = true }) => {
  if (!password) return null;

  const { ruleStatus, isValid } = validatePassword(password);
  const strength = getPasswordStrength(password);

  const getBarColor = (index) => {
    if (strength.score >= index) {
      if (strength.score === 1) return 'bg-error';
      if (strength.score === 2) return 'bg-warning';
      return 'bg-success';
    }
    return 'bg-border';
  };

  return (
    <div className="mt-2 space-y-2.5 rounded-xl border border-border bg-lavender/30 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-text-secondary">Password strength:</span>
        <span
          className={`font-semibold ${
            strength.score === 3
              ? 'text-success'
              : strength.score === 2
              ? 'text-warning'
              : 'text-error'
          }`}
        >
          {strength.label}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <div className={`h-1.5 rounded-full transition-colors ${getBarColor(1)}`} />
        <div className={`h-1.5 rounded-full transition-colors ${getBarColor(2)}`} />
        <div className={`h-1.5 rounded-full transition-colors ${getBarColor(3)}`} />
      </div>

      {showRules && (
        <ul className="mt-2 space-y-1 pt-1">
          {ruleStatus.map((rule) => (
            <li
              key={rule.id}
              className={`flex items-center gap-1.5 transition-colors ${
                rule.passed ? 'text-success font-medium' : 'text-text-secondary'
              }`}
            >
              {rule.passed ? (
                <Check size={13} className="shrink-0 text-success" />
              ) : (
                <X size={13} className="shrink-0 text-text-secondary/60" />
              )}
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
