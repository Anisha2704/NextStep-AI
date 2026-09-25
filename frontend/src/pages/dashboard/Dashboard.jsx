import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  User,
  Brain,
  FolderGit2,
  Award,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { fetchProfile } from '../../store/slices/userSlice';
import Card, { CardHeader } from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import CareerGuidancePreview from '../../components/dashboard/CareerGuidancePreview';
import SkillGapPreview from '../../components/dashboard/SkillGapPreview';

const StatCard = ({ icon: Icon, label, value, color = 'primary' }) => {


  const colors = {
    primary: 'bg-primary-light text-primary',
    cyan: 'bg-cyan-soft text-cyan',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
  };

  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-text-secondary">{label}</p>
          <p className="mt-2 text-2xl font-bold text-text-main">{value}</p>
        </div>
        <div className={`rounded-xl p-2.5 ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </Card>
  );
};

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { profile, loading } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(fetchProfile());
  }, [dispatch]);

  if (loading && !profile) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const completion = profile?.profileCompletion?.percentage ?? 0;
  const recommendations = profile?.profileCompletion?.recommendations ?? [];
  const careerGoal = profile?.careerGoals?.targetJobRole || 'Not set yet';
  const skillCount = profile?.skills?.length ?? 0;
  const projectCount = profile?.projects?.length ?? 0;
  const certCount = profile?.certifications?.length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-main">
            Welcome, {user?.name?.split(' ')[0]} 👋
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Here&apos;s an overview of your career development journey
          </p>
        </div>
        <Link to="/profile">
          <Button variant="primary">Complete Profile</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={User} label="Profile Completion" value={`${completion}%`} color="primary" />
        <StatCard icon={Brain} label="Skills" value={skillCount} color="cyan" />
        <StatCard icon={FolderGit2} label="Projects" value={projectCount} color="success" />
        <StatCard icon={Award} label="Certifications" value={certCount} color="warning" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Profile Completion" subtitle="Complete your profile for better AI recommendations" />
          <ProgressBar value={completion} showLabel size="lg" />
          {recommendations.length > 0 && (
            <ul className="mt-4 space-y-2">
              {recommendations.map((rec, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-text-secondary">
                  <TrendingUp size={14} className="shrink-0 text-primary" />
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title="Career Goal" />
          <div className="flex flex-col items-center py-4 text-center">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light">
              <Briefcase className="h-7 w-7 text-primary" />
            </div>
            <p className="text-lg font-semibold text-text-main">{careerGoal}</p>
            {profile?.careerGoals?.targetIndustry && (
              <Badge variant="outline" className="mt-2">
                {profile.careerGoals.targetIndustry}
              </Badge>
            )}
            {!profile?.careerGoals?.targetJobRole && (
              <Link to="/profile" className="mt-3 text-sm text-primary hover:underline">
                Set your career goal →
              </Link>
            )}
          </div>
        </Card>
      </div>

      {/* AI Career Guidance & Skill Gap Preview / CTA Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <CareerGuidancePreview />
        <SkillGapPreview />
      </div>

    </div>
  );
};


export default Dashboard;
