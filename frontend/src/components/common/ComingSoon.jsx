import { Clock } from 'lucide-react';
import Card from '../ui/Card';

const ComingSoon = ({ title = 'Coming Soon', description }) => {
  return (
    <Card className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
        <Clock className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-text-main">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-text-secondary">
        {description ||
          'This feature is under development and will be available in a future phase.'}
      </p>
    </Card>
  );
};

export default ComingSoon;
