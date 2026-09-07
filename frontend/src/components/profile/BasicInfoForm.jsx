import Card, { CardHeader } from '../ui/Card';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

const BasicInfoForm = ({ data, onChange, onSave, saving }) => {
  return (
    <Card>
      <CardHeader
        title="Basic Information"
        subtitle="Your personal details"
        action={
          <Button onClick={onSave} loading={saving} size="sm">
            Save
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Full Name"
          value={data.name || ''}
          onChange={(e) => onChange('name', e.target.value)}
        />
        <Input label="Email" value={data.email || ''} disabled />
        <Input
          label="Location"
          placeholder="City, Country"
          value={data.location || ''}
          onChange={(e) => onChange('location', e.target.value)}
        />
        <Input
          label="Phone"
          placeholder="+91 9876543210"
          value={data.phone || ''}
          onChange={(e) => onChange('phone', e.target.value)}
        />
        <div className="sm:col-span-2">
          <Textarea
            label="Bio"
            rows={3}
            placeholder="Tell us about yourself..."
            value={data.bio || ''}
            onChange={(e) => onChange('bio', e.target.value)}
          />
        </div>
        <Input
          label="Profile Photo URL"
          placeholder="https://example.com/photo.jpg"
          value={data.profilePhoto || ''}
          onChange={(e) => onChange('profilePhoto', e.target.value)}
          containerClassName="sm:col-span-2"
        />
      </div>
    </Card>
  );
};

export default BasicInfoForm;
