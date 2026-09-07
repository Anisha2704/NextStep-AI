import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

const EducationForm = ({ data, onChange, onSave, saving }) => {
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
          placeholder="2026"
          value={data.graduationYear || ''}
          onChange={(e) => onChange('graduationYear', e.target.value)}
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
