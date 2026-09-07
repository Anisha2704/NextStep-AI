const ProgressBar = ({ value = 0, className = '', showLabel = false, size = 'md' }) => {
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' };

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1.5 flex justify-between text-xs text-text-secondary">
          <span>Progress</span>
          <span>{value}%</span>
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-primary-light ${heights[size]}`}>
        <div
          className={`${heights[size]} rounded-full bg-primary transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
