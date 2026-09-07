import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import { INTEREST_OPTIONS } from '../../constants';

const InterestsSelector = ({ interests = [], onChange, onSave, saving }) => {
  const toggleInterest = (interest) => {
    if (interests.includes(interest)) {
      onChange(interests.filter((i) => i !== interest));
    } else {
      onChange([...interests, interest]);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Interests"
        subtitle="Select areas you're passionate about"
        action={
          <Button onClick={onSave} loading={saving} size="sm">
            Save
          </Button>
        }
      />
      <div className="flex flex-wrap gap-2">
        {INTEREST_OPTIONS.map((interest) => {
          const selected = interests.includes(interest);
          return (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                selected
                  ? 'border-primary bg-primary text-white'
                  : 'border-border bg-card text-text-secondary hover:border-primary/30 hover:bg-lavender'
              }`}
            >
              {interest}
            </button>
          );
        })}
      </div>
    </Card>
  );
};

export default InterestsSelector;
