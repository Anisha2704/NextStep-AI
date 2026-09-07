import { Sparkles } from 'lucide-react';

const Logo = ({ size = 'md', showText = true }) => {
  const sizes = {
    sm: { icon: 24, text: 'text-lg' },
    md: { icon: 32, text: 'text-xl' },
    lg: { icon: 40, text: 'text-2xl' },
  };

  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md shadow-primary/20">
        <Sparkles size={s.icon * 0.55} />
      </div>
      {showText && (
        <div>
          <span className={`font-bold text-text-main ${s.text}`}>NextStep AI</span>
          {size === 'lg' && (
            <p className="text-xs text-text-secondary">Know Your Skills. Find Your Path.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
