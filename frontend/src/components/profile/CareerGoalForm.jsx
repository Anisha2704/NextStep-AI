import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { WORK_TYPES, CAREER_DOMAIN_OPTIONS } from '../../constants';

const CareerGoalForm = ({ data, onChange, onSave, saving }) => {
  return (
    <Card>
      <CardHeader
        title="Career Goals"
        subtitle="Define your career aspirations"
        action={
          <Button onClick={onSave} loading={saving} size="sm">
            Save
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <fieldset className="sm:col-span-2">
          <legend className="mb-2 text-sm font-medium text-text-main">Preferred career domains</legend>
          <div className="flex flex-wrap gap-2">
            {CAREER_DOMAIN_OPTIONS.map((domain) => {
              const selected = (data.preferredDomains || []).includes(domain);
              return (
                <button
                  key={domain}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onChange('preferredDomains', selected
                    ? data.preferredDomains.filter((item) => item !== domain)
                    : [...(data.preferredDomains || []), domain])}
                  className={`rounded-full border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30 ${selected ? 'border-primary bg-primary text-white' : 'border-border bg-card text-text-secondary hover:bg-lavender'}`}
                >
                  {domain}
                </button>
              );
            })}
          </div>
        </fieldset>
        <Input
          label="Target Job Role"
          placeholder="Machine Learning Engineer"
          value={data.targetJobRole || ''}
          onChange={(e) => onChange('targetJobRole', e.target.value)}
        />
        <Input
          label="Target Industry"
          placeholder="Technology"
          value={data.targetIndustry || ''}
          onChange={(e) => onChange('targetIndustry', e.target.value)}
        />
        <Select
          label="Preferred Work Type"
          value={data.preferredWorkType || ''}
          onChange={(e) => onChange('preferredWorkType', e.target.value)}
          options={[{ value: '', label: 'Select...' }, ...WORK_TYPES.map((w) => ({ value: w, label: w }))]}
        />
        <Input
          label="Preferred Location"
          placeholder="India"
          value={data.preferredLocation || ''}
          onChange={(e) => onChange('preferredLocation', e.target.value)}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Career Goal Description"
            rows={3}
            placeholder="Describe your long-term career vision..."
            value={data.description || ''}
            onChange={(e) => onChange('description', e.target.value)}
          />
        </div>
      </div>
    </Card>
  );
};

export default CareerGoalForm;
