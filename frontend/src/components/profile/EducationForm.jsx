import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { EDUCATION_LEVELS, EXPERIENCE_LEVELS } from '../../constants';

const EducationForm = ({ data, experienceLevel, onChange, onExperienceChange, onSave, saving }) => {
  return (
    <Card>
      <CardHeader
        title="Education"
        subtitle="Your academic background"
        action={
          <Button onClick={onSave} loading={saving} size="sm">
            Save
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Education level"
          value={data.level || ''}
          onChange={(e) => onChange('level', e.target.value)}
          options={[{ value: '', label: 'Select education level' }, ...EDUCATION_LEVELS.map((level) => ({ value: level, label: level }))]}
        />
        <Select
          label="Experience level"
          value={experienceLevel || ''}
          onChange={(e) => onExperienceChange(e.target.value)}
          options={[{ value: '', label: 'Select experience level' }, ...EXPERIENCE_LEVELS.map((level) => ({ value: level, label: level }))]}
        />
        <Input
          label="College / University"
          value={data.college || ''}
          onChange={(e) => onChange('college', e.target.value)}
          containerClassName="sm:col-span-2"
        />
        <Input
          label="Degree"
          placeholder="B.Tech, B.Sc, etc."
          value={data.degree || ''}
          onChange={(e) => onChange('degree', e.target.value)}
        />
        <Input
          label="Branch / Specialization"
          placeholder="Computer Science"
          value={data.branch || ''}
          onChange={(e) => onChange('branch', e.target.value)}
        />
        <Input
          label="Current Year"
          placeholder="3rd Year"
          value={data.currentYear || ''}
          onChange={(e) => onChange('currentYear', e.target.value)}
        />
        <Input
          label="Graduation Year"
          type="number"
          min="1950"
          max="2150"
          placeholder="2026"
          value={data.graduationYear ?? ''}
          onChange={(e) => onChange('graduationYear', e.target.value === '' ? '' : Number(e.target.value))}
        />
        <Input
          label="CGPA / Percentage"
          placeholder="8.5 / 85%"
          value={data.cgpa || ''}
          onChange={(e) => onChange('cgpa', e.target.value)}
        />
      </div>
    </Card>
  );
};

export default EducationForm;
