const Textarea = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-main">{label}</label>
      )}
      <textarea
        className={`w-full rounded-[var(--radius-button)] border border-border bg-card px-4 py-2.5 text-sm text-text-main placeholder:text-text-secondary/60 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none ${error ? 'border-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
};

export default Textarea;
