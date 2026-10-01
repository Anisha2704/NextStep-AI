const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-primary-light text-primary',
    cyan: 'bg-cyan-soft text-cyan',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    outline: 'border border-border text-text-secondary bg-card',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
