const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-bright focus:ring-primary/30 disabled:bg-primary/50',
  secondary:
    'bg-primary-light text-primary hover:bg-primary/10 focus:ring-primary/20',
  outline:
    'border border-border bg-card text-text-main hover:bg-lavender focus:ring-primary/20',
  ghost: 'text-text-secondary hover:bg-lavender hover:text-text-main',
  danger: 'bg-error/10 text-error hover:bg-error/20 focus:ring-error/20',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  disabled = false,
  type = 'button',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
};

export default Button;
