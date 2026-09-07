const Card = ({ children, className = '', padding = true }) => {
  return (
    <div
      className={`rounded-[var(--radius-card)] border border-border bg-card shadow-sm ${padding ? 'p-6' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ title, subtitle, action, className = '' }) => (
  <div className={`mb-5 flex items-start justify-between gap-4 ${className}`}>
    <div>
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

export default Card;
