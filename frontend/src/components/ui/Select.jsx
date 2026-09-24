import { useId } from 'react';

const Select = ({ label, error, options = [], className = '', ...props }) => {
  const generatedId = useId();
  const selectId = props.id || generatedId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-text-main">{label}</label>
      )}
      <select
        className={`w-full rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm text-text-main focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${error ? 'border-error' : ''} ${className}`}
        id={selectId}
        aria-invalid={error ? 'true' : undefined}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default Select;
