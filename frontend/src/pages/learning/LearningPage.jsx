import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  GraduationCap,
  RefreshCw,
  Sparkles,
  Target,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfile } from '../../store/slices/userSlice';
import {
  clearLearningError,
  clearLearningSuccess,
  fetchLearningRoadmap,
  fetchRoadmapReadiness,
  generateRoadmap,
  updateMilestone,
} from '../../store/slices/learningSlice';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import ProgressBar from '../../components/ui/ProgressBar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate } from '../../utils';

const MISSING_PREREQUISITES = {
  targetRole: {
    label: 'Choose a target career role in your profile.',
    href: '/profile',
    link: 'Update profile',
  },
  skills: {
    label: 'Add at least one current skill to your profile.',
    href: '/profile',
    link: 'Add skills',
  },
  skillGap: {
    label: 'Complete Skill Gap Analysis for your target role first.',
    href: '/skills/gaps',
    link: 'Open Skill Gap Analysis',
  },
};

const statusLabel = (status) => ({
  not_started: 'Not started',
  in_progress: 'In progress',
  completed: 'Completed',
}[status] || 'Not started');

const effortLabel = (hours) => {
  const value = Number(hours) || 0;
  return `${value} ${value === 1 ? 'hour' : 'hours'}`;
};

const LearningPage = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const {
    roadmap,
    readiness,
    loading,
    readinessLoading,
    generating,
    updatingMilestoneId,
    error,
    success,
  } = useSelector((state) => state.learning);
  const [confirmRegeneration, setConfirmRegeneration] = useState(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    dispatch(fetchLearningRoadmap()).then((action) => {
      if (fetchLearningRoadmap.fulfilled.match(action) && !action.payload) {
        dispatch(fetchRoadmapReadiness());
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (!profile) dispatch(fetchProfile());
  }, [dispatch, profile]);

  useEffect(() => {
    if (confirmRegeneration && dialogRef.current && !dialogRef.current.open) {
      dialogRef.current.showModal();
    }
  }, [confirmRegeneration]);

  const firstIncompleteMilestone = useMemo(() => {
    if (!roadmap?.stages) return null;
    for (const stage of roadmap.stages) {
      const milestone = stage.milestones.find((item) => item.status !== 'completed');
      if (milestone) return milestone;
    }
    return null;
  }, [roadmap]);

  const resumeLearning = () => {
    if (!firstIncompleteMilestone) return;
    const element = document.getElementById(`milestone-${firstIncompleteMilestone._id}`);
    element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    element?.focus({ preventScroll: true });
  };

  const handleMilestoneStatus = (milestone, status) => {
    dispatch(updateMilestone({ milestoneId: milestone._id, status }));
  };

  if (loading && !roadmap) return <LoadingSpinner message="Loading your learning roadmap..." />;

  if (error && !roadmap) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <Alert type="error" message={error} />
        <Button
          variant="outline"
          onClick={() => {
            dispatch(clearLearningError());
            dispatch(fetchLearningRoadmap()).then((action) => {
              if (fetchLearningRoadmap.fulfilled.match(action) && !action.payload) {
                dispatch(fetchRoadmapReadiness());
              }
            });
          }}
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
        </Button>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="mx-auto max-w-4xl space-y-5">
        <header>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Your next steps</p>
          <h1 className="mt-1 text-3xl font-bold text-text-main">Learning roadmap</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            Turn your career goal and skill-gap results into a practical sequence of learning milestones.
          </p>
        </header>

        {error && <Alert type="error" message={error} onClose={() => dispatch(clearLearningError())} />}
        {success && <Alert type="success" message={success} onClose={() => dispatch(clearLearningSuccess())} />}

        <Card className="py-9 text-center sm:py-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary">
            <BookOpen className="h-7 w-7" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-text-main">Create your personalized learning roadmap</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">
            We’ll use your saved profile and Skill Gap Analysis to prioritize what to learn for your target role.
            Your roadmap will be saved so you can return to it later.
          </p>

          {readinessLoading ? (
            <div className="mt-6"><LoadingSpinner message="Checking your profile and skill gaps..." /></div>
          ) : readiness?.canGenerate ? (
            <Button
              className="mt-6"
              size="lg"
              loading={generating}
              disabled={generating}
              onClick={() => dispatch(generateRoadmap(false))}
            >
              <Sparkles className="h-5 w-5" aria-hidden="true" />
              Generate roadmap
            </Button>
          ) : (
            <div className="mx-auto mt-6 max-w-lg rounded-xl border border-border bg-background p-4 text-left">
              <h3 className="font-semibold text-text-main">Before you begin</h3>
              <ul className="mt-3 space-y-3">
                {(readiness?.missing || ['targetRole', 'skills', 'skillGap']).map((key) => {
                  const item = MISSING_PREREQUISITES[key];
                  if (!item) return null;
                  return (
                    <li key={key} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-text-secondary">{item.label}</span>
                      <Link className="inline-flex items-center gap-1 font-semibold text-primary hover:underline" to={item.href}>
                        {item.link}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </Card>
      </div>
    );
  }

  const milestones = roadmap.stages.flatMap((stage) => stage.milestones);
  const completedCount = milestones.filter((milestone) => milestone.status === 'completed').length;
  const estimatedHours = roadmap.stages.reduce((total, stage) => total + Number(stage.estimatedHours || 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Your next steps</p>
          <h1 className="mt-1 text-3xl font-bold text-text-main">Learning roadmap</h1>
          <p className="mt-2 text-sm text-text-secondary">
            A saved plan shaped around your profile and skill gaps.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {firstIncompleteMilestone && (
            <Button variant="outline" onClick={resumeLearning}>
              <ArrowRight className="h-4 w-4" aria-hidden="true" /> Continue learning
            </Button>
          )}
          <Button variant="outline" onClick={() => setConfirmRegeneration(true)}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Regenerate roadmap
          </Button>
        </div>
      </header>

      {error && <Alert type="error" message={error} onClose={() => dispatch(clearLearningError())} />}
      {success && <Alert type="success" message={success} onClose={() => dispatch(clearLearningSuccess())} />}

      <Card>
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-cyan-soft text-cyan">
              <Target className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Target career</p>
              <h2 className="text-xl font-bold text-text-main">{roadmap.targetRole}</h2>
              <p className="mt-1 text-xs text-text-secondary">
                Version {roadmap.version} · Created {formatDate(roadmap.generatedAt)}
              </p>
              {roadmap.generationSource === 'skill_gap_fallback' && (
                <p className="mt-1 text-xs text-text-secondary">
                  Built from your saved Skill Gap Analysis while AI generation was rate-limited.
                </p>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm md:min-w-64">
            <div className="rounded-xl bg-background p-3">
              <div className="flex items-center gap-2 text-text-secondary"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Completed</div>
              <p className="mt-1 text-lg font-semibold text-text-main">{completedCount} / {milestones.length}</p>
            </div>
            <div className="rounded-xl bg-background p-3">
              <div className="flex items-center gap-2 text-text-secondary"><Clock3 className="h-4 w-4" aria-hidden="true" />Estimated</div>
              <p className="mt-1 text-lg font-semibold text-text-main">{effortLabel(estimatedHours)}</p>
            </div>
          </div>
        </div>
        <div className="mt-6 border-t border-border pt-5">
          <ProgressBar value={roadmap.overallProgress} showLabel size="lg" />
          <p className="mt-2 text-xs text-text-secondary" aria-live="polite">
            Progress is calculated from completed milestones and saved to your roadmap.
          </p>
        </div>
      </Card>

      <section className="space-y-4" aria-labelledby="roadmap-stages-title">
        <div>
          <h2 id="roadmap-stages-title" className="text-xl font-bold text-text-main">Your learning stages</h2>
          <p className="mt-1 text-sm text-text-secondary">Work through the milestones in order, and update your progress as you go.</p>
        </div>
        {roadmap.stages.map((stage) => (
          <Card key={stage._id}>
            <CardHeader
              title={<span className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" aria-hidden="true" />Stage {stage.order} — {stage.title}</span>}
              subtitle={stage.description}
              action={<Badge variant={stage.status === 'completed' ? 'success' : stage.status === 'in_progress' ? 'cyan' : 'outline'}>{statusLabel(stage.status)}</Badge>}
            />
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <ProgressBar value={stage.progress} showLabel />
              <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-text-secondary">
                <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />{effortLabel(stage.estimatedHours)}
              </span>
            </div>
            <ol className="space-y-3">
              {stage.milestones.map((milestone) => (
                <li key={milestone._id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${milestone.status === 'completed' ? 'bg-success/10 text-success' : milestone.status === 'in_progress' ? 'bg-primary-light text-primary' : 'bg-background text-text-secondary'}`} aria-hidden="true">
                        {milestone.status === 'completed' ? <Check className="h-4 w-4" /> : milestone.status === 'in_progress' ? <Circle className="h-4 w-4 fill-current" /> : <Circle className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-text-main">{milestone.title}</h3>
                        <p className="mt-1 text-sm leading-6 text-text-secondary">{milestone.description}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge>{milestone.skill}</Badge>
                          <span className="text-xs text-text-secondary">{effortLabel(milestone.estimatedHours)}</span>
                        </div>
                        {milestone.resources?.length > 0 && (
                          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
                            {milestone.resources.map((resource) => (
                              <li key={`${resource.url}-${resource.title}`}>
                                <a className="text-sm font-medium text-primary underline-offset-2 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" href={resource.url} target="_blank" rel="noreferrer">
                                  {resource.title} (opens in a new tab)
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                        {milestone.completedAt && <p className="mt-2 text-xs text-text-secondary">Completed {formatDate(milestone.completedAt)}</p>}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                      <Badge variant={milestone.status === 'completed' ? 'success' : milestone.status === 'in_progress' ? 'cyan' : 'outline'}>
                        {statusLabel(milestone.status)}
                      </Badge>
                      {milestone.status !== 'completed' && (
                        <Button
                          id={`milestone-${milestone._id}`}
                          size="sm"
                          variant={milestone.status === 'in_progress' ? 'primary' : 'outline'}
                          loading={updatingMilestoneId === milestone._id}
                          disabled={Boolean(updatingMilestoneId)}
                          onClick={() => handleMilestoneStatus(milestone, milestone.status === 'not_started' ? 'in_progress' : 'completed')}
                          aria-label={`${milestone.status === 'not_started' ? 'Start' : 'Complete'} milestone: ${milestone.title}`}
                        >
                          {milestone.status === 'not_started' ? 'Start' : 'Mark complete'}
                        </Button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        ))}
      </section>

      {confirmRegeneration && (
        <dialog
          ref={dialogRef}
          className="m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-border bg-card p-6 text-text-main shadow-xl backdrop:bg-black/50"
          aria-labelledby="regenerate-title"
          aria-describedby="regenerate-description"
          onCancel={(event) => {
            event.preventDefault();
            setConfirmRegeneration(false);
          }}
        >
            <h2 id="regenerate-title" className="text-lg font-bold text-text-main">Regenerate your roadmap?</h2>
            <p id="regenerate-description" className="mt-2 text-sm leading-6 text-text-secondary">
              This will replace your current active milestones with a new plan based on your latest profile and skill gaps. Your current roadmap will be kept as a previous version, but its progress will not carry over.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button variant="outline" disabled={generating} onClick={() => setConfirmRegeneration(false)}>Keep current roadmap</Button>
              <Button
                loading={generating}
                disabled={generating}
                onClick={async () => {
                  const result = await dispatch(generateRoadmap(true));
                  if (generateRoadmap.fulfilled.match(result)) setConfirmRegeneration(false);
                }}
              >
                Regenerate roadmap
              </Button>
            </div>
        </dialog>
      )}
    </div>
  );
};

export default LearningPage;
