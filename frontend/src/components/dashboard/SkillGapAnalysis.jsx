import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Target,
  Brain,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Sparkles,
  BookOpen,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { analyzeSkillGap, clearSkillGapError } from '../../store/slices/aiSlice';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const COMMON_ROLES = [
  'Full Stack Developer',
  'Backend Engineer',
  'Frontend Engineer',
  'AI Web Application Engineer',
  'Software Engineer',
  'Data Scientist',
  'DevOps Engineer',
];

const SkillGapAnalysis = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const { skillGap, skillGapLoading, skillGapError } = useSelector((state) => state.ai);

  const defaultRole = profile?.careerGoals?.targetJobRole || 'Full Stack Developer';
  const [selectedRole, setSelectedRole] = useState(defaultRole);
  const [customRole, setCustomRole] = useState('');

  useEffect(() => {
    if (profile?.careerGoals?.targetJobRole && !customRole) {
      setSelectedRole(profile.careerGoals.targetJobRole);
    }
  }, [profile]);

  const activeRole = customRole.trim() ? customRole.trim() : selectedRole;

  const handleAnalyze = () => {
    if (!activeRole) return;
    dispatch(analyzeSkillGap(activeRole));
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'strong':
        return (
          <Badge variant="success" className="gap-1 font-semibold">
            ✓ Strong
          </Badge>
        );
      case 'needs improvement':
        return (
          <Badge variant="warning" className="gap-1 font-semibold">
            ↗ Needs Improvement
          </Badge>
        );
      case 'missing':
        return (
          <Badge variant="default" className="gap-1 font-semibold">
            ! Missing
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return <Badge variant="warning" className="bg-error/10 text-error">High Priority</Badge>;
      case 'medium':
        return <Badge variant="warning">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="outline">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const summary = skillGap?.summary;
  const currentSkills = skillGap?.currentSkills || [];
  const gaps = skillGap?.skillGaps || [];

  return (
    <div className="space-y-6">
      {/* Header & Role Selection Card */}
      <Card>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-soft text-cyan">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-main">Skill Gap Analysis</h3>
              <p className="mt-0.5 text-sm text-text-secondary">
                Compare your current skills against target career role requirements using Gemini AI
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedRole}
                onChange={(e) => {
                  setSelectedRole(e.target.value);
                  setCustomRole('');
                }}
                className="rounded-[var(--radius-button)] border border-border bg-card px-3 py-2 text-sm font-medium text-text-main outline-none focus:border-primary"
              >
                {COMMON_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Or type custom role..."
                value={customRole}
                onChange={(e) => setCustomRole(e.target.value)}
                className="w-full sm:w-48 rounded-[var(--radius-button)] border border-border bg-card px-3 py-2 text-sm text-text-main outline-none placeholder:text-text-secondary/60 focus:border-primary"
              />
            </div>

            <Button
              variant="primary"
              onClick={handleAnalyze}
              loading={skillGapLoading}
              disabled={!activeRole}
            >
              <Sparkles className="h-4 w-4" />
              Analyze Skill Gap
            </Button>
          </div>
        </div>
      </Card>

      {/* Error Alert */}
      {skillGapError && (
        <Card className="border-error/20 bg-error/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 text-error">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Unable to analyze skill gap</h4>
                <p className="mt-1 text-sm text-text-secondary">{skillGapError}</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                dispatch(clearSkillGapError());
                handleAnalyze();
              }}
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {skillGapLoading && (
        <Card className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cyan-soft text-cyan animate-pulse">
              <Brain className="h-8 w-8 animate-spin" />
            </div>
            <h4 className="text-lg font-semibold text-text-main">Analyzing your skill profile...</h4>
            <p className="mt-1 text-sm text-text-secondary max-w-md">
              Comparing your skills against typical requirements for <span className="font-semibold text-text-main">{activeRole}</span>.
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!skillGapLoading && !skillGap && !skillGapError && (
        <Card className="py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-soft text-cyan mb-4">
            <Target className="h-7 w-7" />
          </div>
          <h4 className="text-lg font-bold text-text-main">Ready to identify your skill gaps?</h4>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            Select your target career role above and let AI evaluate what skills you already possess and what you should learn next.
          </p>
          <div className="mt-6">
            <Button variant="primary" size="lg" onClick={handleAnalyze}>
              <Sparkles className="h-5 w-5" />
              Analyze Skill Gap for {activeRole}
            </Button>
          </div>
        </Card>
      )}

      {/* Results View */}
      {!skillGapLoading && skillGap && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          {summary && (
            <Card className="border-cyan/30 bg-cyan-soft/20">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-cyan text-text-main p-2.5 shrink-0 mt-0.5">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-text-main">Skill Gap Analysis Summary</h4>
                    <Badge variant="cyan">{skillGap.targetRole || activeRole}</Badge>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-main">{summary}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Current Skills Section */}
          {currentSkills.length > 0 && (
            <Card>
              <CardHeader title="Your Evaluated Profile Skills" subtitle="Skills analyzed from your profile" />
              <div className="flex flex-wrap gap-2">
                {currentSkills.map((sk, idx) => (
                  <Badge key={idx} variant="default" className="text-sm py-1 px-3 font-medium">
                    {sk}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Skill Gaps Breakdown Grid */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Detailed Skill Breakdown ({gaps.length})
            </h4>

            <div className="grid gap-6 md:grid-cols-2">
              {gaps.map((gap, index) => (
                <Card key={index} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <h5 className="text-base font-bold text-text-main">{gap.skill}</h5>
                        <p className="text-xs text-text-secondary mt-0.5">Target Requirement</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(gap.status)}
                        {getPriorityBadge(gap.priority)}
                      </div>
                    </div>

                    {/* Why it matters */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                        Why this matters
                      </p>
                      <p className="text-sm text-text-main leading-relaxed">{gap.reason}</p>
                    </div>

                    {/* What to Learn */}
                    {gap.whatToLearn?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1">
                          <BookOpen className="h-3.5 w-3.5 text-primary" />
                          Key Concepts to Learn
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {gap.whatToLearn.map((topic, tIdx) => (
                            <Badge key={tIdx} variant="outline" className="text-xs">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Next Steps */}
                    {gap.nextSteps?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2 flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          Recommended Action Steps
                        </p>
                        <ul className="space-y-2">
                          {gap.nextSteps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-2 text-xs text-text-main">
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" />
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillGapAnalysis;
