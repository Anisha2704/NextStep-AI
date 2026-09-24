import { getInitials } from '../../utils';
import ProgressBar from '../ui/ProgressBar';
import Badge from '../ui/Badge';
import { MapPin, Mail, Phone, Camera } from 'lucide-react';

const ProfileHeader = ({ profile, onSavePhoto }) => {
  const completion = profile?.profileCompletion?.percentage ?? 0;

  return (
    <div className="rounded-[var(--radius-card)] border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary text-3xl font-bold text-white">
            {profile?.profilePhoto ? (
              <img
                src={profile.profilePhoto}
                alt={profile.name}
                className="h-full w-full rounded-2xl object-cover"
              />
            ) : (
              getInitials(profile?.name)
            )}
          </div>
          <button
            type="button"
            onClick={onSavePhoto}
            aria-label="Update profile photo URL"
            className="absolute -bottom-1 -right-1 rounded-full bg-card p-1.5 shadow-md border border-border text-text-secondary hover:text-primary"
            title="Update photo URL"
          >
            <Camera size={14} />
          </button>
        </div>

        <div className="flex-1">
          <h2 className="text-2xl font-bold text-text-main">{profile?.name}</h2>
          <p className="text-text-secondary">{profile?.bio || 'Add a bio to tell us about yourself'}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-text-secondary">
            {profile?.email && (
              <span className="flex items-center gap-1">
                <Mail size={14} /> {profile.email}
              </span>
            )}
            {profile?.location && (
              <span className="flex items-center gap-1">
                <MapPin size={14} /> {profile.location}
              </span>
            )}
            {profile?.phone && (
              <span className="flex items-center gap-1">
                <Phone size={14} /> {profile.phone}
              </span>
            )}
          </div>
        </div>

        <div className="w-full sm:w-48">
          <p className="mb-2 text-sm font-medium text-text-main">Profile Completion</p>
          <ProgressBar value={completion} showLabel />
          <Badge variant={completion >= 80 ? 'success' : 'warning'} className="mt-2">
            {completion >= 80 ? 'Great progress!' : 'Keep going!'}
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
