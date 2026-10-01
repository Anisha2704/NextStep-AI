import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  Brain,
  Briefcase,
  ChevronRight,
  Clock,
  ExternalLink,
  MapPin,
  RefreshCw,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Building2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  clearCooldown,
  clearFullError,
  clearRecommendationError,
  loadFullRecommendations,
  loadRecommendations,
} from '../../store/slices/recommendationSlice';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const importanceBadgeVariant = (level) => {
  if (level === 'HIGH') return 'error';
  if (level === 'MEDIUM') return 'warning';
  return 'outline';
};

const importanceLabel = (level) => {
  if (level === 'HIGH') return 'High Priority';
  if (level === 'MEDIUM') return 'Medium';
  return 'Low';
};

const sourceLabel = (source) =>
  source === 'gemini' ? '✦ Powered by Gemini AI' : '⚡ Rule-based fallback';

// ─── Tab definitions ─────────────────────────────────────────────────────────

const TABS = [
  { id: 'jobs', label: 'Job Matches', icon: Briefcase },
  { id: 'courses', label: 'Courses', icon: BookOpen },
  { id: 'certs', label: 'Certifications', icon: Award },
  { id: 'catalog', label: 'Catalog Picks', icon: Sparkles },
];

// ─── Job Card ─────────────────────────────────────────────────────────────────

const JobCard = ({ job, index }) => (
  <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
    <div className="flex items-start gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
        <Building2 className="h-5 w-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-text-main">{job.title}</h3>
          <Badge variant={job.matchPercentage >= 80 ? 'success' : job.matchPercentage >= 65 ? 'warning' : 'outline'}>
            {job.matchPercentage}% match
          </Badge>
          <Badge variant="outline">{job.jobType}</Badge>
        </div>
        <p className="mt-0.5 text-sm font-medium text-primary">{job.company}</p>
        <p className="flex items-center gap-1 text-xs text-text-secondary">
          <MapPin className="h-3 w-3" aria-hidden="true" /> {job.location}
        </p>
      </div>
    </div>

    <p className="text-sm leading-6 text-text-secondary">{job.whyRecommended}</p>

    <div className="flex flex-wrap gap-2">
      {job.requiredSkills?.slice(0, 6).map((sk) => (
        <Badge key={sk}>{sk}</Badge>
      ))}
    </div>

    {job.missingSkills?.length > 0 && (
      <div className="rounded-lg bg-warning/5 border border-warning/20 px-3 py-2">
        <p className="text-xs font-semibold text-warning mb-1">Skills to develop:</p>
        <div className="flex flex-wrap gap-1.5">
          {job.missingSkills.map((sk) => (
            <Badge key={sk} variant="warning">{sk}</Badge>
          ))}
        </div>
      </div>
    )}

    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
      <p className="text-xs text-text-secondary">
        <span className="font-semibold text-text-main">Next step: </span>
        {job.nextStep}
      </p>
      {job.jobUrl && (
        <a
          href={job.jobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
        >
          View jobs <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  </li>
);

// ─── Full Course Card ─────────────────────────────────────────────────────────

const FullCourseCard = ({ course, index }) => (
  <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-text-main">{course.courseName}</h3>
        <p className="mt-0.5 text-sm text-text-secondary">{course.provider} · {course.platform}</p>
      </div>
      <Badge>{course.level}</Badge>
    </div>
    <p className="text-sm leading-6 text-text-secondary">{course.whyRecommended}</p>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {course.duration && (
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            {course.duration}
          </span>
        )}
        {course.skillsCovered?.slice(0, 3).map((sk) => (
          <Badge key={sk} variant="cyan">{sk}</Badge>
        ))}
      </div>
      {course.courseUrl && (
        <a
          href={course.courseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
        >
          Start course <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  </li>
);

// ─── Full Cert Card ──────────────────────────────────────────────────────────

const FullCertCard = ({ cert, index }) => (
  <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-soft text-sm font-bold text-cyan">
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-semibold text-text-main">{cert.certificationName}</h3>
        <p className="mt-0.5 text-sm text-text-secondary">{cert.provider}</p>
      </div>
      <Badge variant="cyan">{cert.level}</Badge>
    </div>
    <p className="text-sm leading-6 text-text-secondary">{cert.whyRecommended}</p>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {cert.examName && <Badge variant="outline">{cert.examName}</Badge>}
        {cert.eligibility && (
          <span className="text-xs text-text-secondary">{cert.eligibility}</span>
        )}
        {cert.skillsValidated?.slice(0, 3).map((sk) => (
          <Badge key={sk} variant="cyan">{sk}</Badge>
        ))}
      </div>
      {cert.certificationUrl && (
        <a
          href={cert.certificationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-primary px-3.5 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-light"
        >
          Official page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  </li>
);

// ─── Catalog Course Card (DB-bound) ──────────────────────────────────────────

const CatalogCourseCard = ({ course, index }) => (
  <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md">
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-bold text-primary">
        {course.priority ?? index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-text-main">{course.title}</h3>
          <Badge variant={importanceBadgeVariant(course.importance)}>{importanceLabel(course.importance)}</Badge>
        </div>
        <p className="mt-0.5 text-sm text-text-secondary">{course.provider}</p>
      </div>
    </div>
    <p className="text-sm leading-6 text-text-secondary">{course.reason}</p>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {course.level && <Badge>{course.level}</Badge>}
        {course.duration && (
          <span className="inline-flex items-center gap-1 text-xs text-text-secondary">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />{course.duration}
          </span>
        )}
        {course.skillsCovered?.slice(0, 3).map((sk) => (
          <Badge key={sk} variant="cyan">{sk}</Badge>
        ))}
      </div>
      {course.url && (
        <a
          href={course.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
        >
          Start course <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      )}
    </div>
  </li>
);

// ─── Profile incomplete gate ──────────────────────────────────────────────────

const IncompleteProfile = ({ data }) => (
  <div className="mx-auto max-w-4xl space-y-6">
    <header>
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">AI Recommendations</p>
      <h1 className="mt-1 text-3xl font-bold text-text-main">Complete your profile to unlock</h1>
      <p className="mt-2 text-sm leading-6 text-text-secondary">{data?.message}</p>
    </header>
    <Card className="py-10 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-warning/10 text-warning">
        <AlertTriangle className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-xl font-bold text-text-main">Profile incomplete</h2>
      <ul className="mx-auto mt-4 max-w-xs space-y-2 text-sm">
        {(data?.requiredFields ?? []).map((field) => (
          <li key={field} className="flex items-center gap-2 text-text-secondary">
            <AlertTriangle className="h-4 w-4 text-warning shrink-0" aria-hidden="true" />
            {field}
          </li>
        ))}
      </ul>
      <Link
        to="/profile"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-bright"
      >
        Go to Profile <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Link>
    </Card>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const RecommendationsPage = () => {
  const dispatch = useDispatch();
  const {
    data, loading, refreshing, error, cooldownRemaining,
    fullData, fullLoading, fullError,
  } = useSelector((state) => state.recommendations);
  const [activeTab, setActiveTab] = useState('jobs');
  const cooldownTimerRef = useRef(null);

  useEffect(() => {
    dispatch(loadRecommendations());
    dispatch(loadFullRecommendations());
  }, [dispatch]);

  useEffect(() => {
    if (cooldownRemaining) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = setTimeout(() => dispatch(clearCooldown()), cooldownRemaining * 1000);
    }
    return () => clearTimeout(cooldownTimerRef.current);
  }, [cooldownRemaining, dispatch]);

  const handleRefresh = () => {
    dispatch(loadRecommendations({ forceRefresh: true }));
    dispatch(loadFullRecommendations());
  };

  // ── Global loading ──────────────────────────────────────────────────────────
  if ((loading && !data) && (fullLoading && !fullData)) {
    return <LoadingSpinner message="Generating your personalized AI recommendations…" />;
  }

  // ── Profile incomplete ──────────────────────────────────────────────────────
  if (data?.isIncomplete) return <IncompleteProfile data={data} />;

  const jobRecs = fullData?.jobRecommendations ?? [];
  const fullCourses = fullData?.courseRecommendations ?? [];
  const fullCerts = fullData?.certificationRecommendations ?? [];
  const catalogCourses = data?.courseRecommendations ?? [];
  const catalogCerts = data?.certificationRecommendations ?? [];
  const skillGaps = data?.skillGaps ?? [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">AI Recommendations</p>
          <h1 className="mt-1 text-3xl font-bold text-text-main">
            Career Recommendations
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            {data?.summary || 'Personalized jobs, courses, and certifications tailored to your profile.'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          loading={refreshing || fullLoading}
          disabled={refreshing || fullLoading || !!cooldownRemaining}
          id="refresh-recommendations-btn"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          {refreshing || fullLoading ? 'Analysing…' : 'Refresh AI'}
        </Button>
      </header>

      {/* Alerts */}
      {error && <Alert type="error" message={error} onClose={() => dispatch(clearRecommendationError())} />}
      {fullError && <Alert type="error" message={fullError} onClose={() => dispatch(clearFullError())} />}
      {cooldownRemaining && (
        <Alert type="warning" message={`Please wait ${cooldownRemaining}s before requesting a fresh AI analysis.`} />
      )}

      {/* Meta strip */}
      {data && (
        <div className="flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background px-4 py-3 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5 font-medium text-primary">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            {sourceLabel(data.source)}
          </span>
          {data.cached && (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-hidden="true" />
              Cached
            </span>
          )}
          {data.generatedAt && (
            <span>
              Generated {new Date(data.generatedAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
            </span>
          )}
        </div>
      )}

      {/* Skill gaps */}
      {skillGaps.length > 0 && (
        <Card>
          <CardHeader
            title={<span className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-warning" />Skill gaps identified</span>}
            subtitle="Areas to strengthen to reach your target role."
          />
          <ul className="space-y-3">
            {skillGaps.map((gap, idx) => (
              <li key={`${gap.skill}-${idx}`} className="flex flex-col gap-1 rounded-xl border border-border bg-background p-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-text-main">{gap.skill}</p>
                  <p className="mt-0.5 text-sm text-text-secondary">{gap.reason}</p>
                </div>
                <Badge variant={importanceBadgeVariant(gap.importance)} className="self-start shrink-0">
                  {importanceLabel(gap.importance)}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="-mb-px flex gap-1 overflow-x-auto" aria-label="Recommendation tabs">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-secondary hover:border-border hover:text-text-main'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
              {id === 'jobs' && jobRecs.length > 0 && (
                <span className="rounded-full bg-primary-light px-2 py-0.5 text-xs font-semibold text-primary">{jobRecs.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="min-h-[300px]">
        {/* Jobs tab */}
        {activeTab === 'jobs' && (
          <section aria-labelledby="jobs-heading">
            <div className="mb-4">
              <h2 id="jobs-heading" className="flex items-center gap-2 text-xl font-bold text-text-main">
                <Briefcase className="h-5 w-5 text-primary" aria-hidden="true" />
                Job matches
                <span className="ml-1 rounded-full bg-primary-light px-2.5 py-0.5 text-sm font-semibold text-primary">{jobRecs.length}</span>
              </h2>
              <p className="mt-1 text-sm text-text-secondary">Roles matched to your current skills and career goal.</p>
            </div>
            {fullLoading && !fullData ? (
              <LoadingSpinner message="Finding matching job roles…" />
            ) : jobRecs.length > 0 ? (
              <ul className="space-y-4">
                {jobRecs.map((job, idx) => <JobCard key={`${job.title}-${idx}`} job={job} index={idx} />)}
              </ul>
            ) : (
              <Card className="py-10 text-center">
                <Brain className="mx-auto h-10 w-10 text-text-secondary" aria-hidden="true" />
                <p className="mt-3 text-sm text-text-secondary">No job matches yet. Ensure your profile has a target role and skills, then refresh.</p>
                <Button className="mt-4" variant="outline" onClick={handleRefresh} loading={fullLoading}>
                  <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
                </Button>
              </Card>
            )}
          </section>
        )}

        {/* Real Courses tab */}
        {activeTab === 'courses' && (
          <section aria-labelledby="courses-heading">
            <div className="mb-4">
              <h2 id="courses-heading" className="flex items-center gap-2 text-xl font-bold text-text-main">
                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
                Recommended courses
              </h2>
              <p className="mt-1 text-sm text-text-secondary">Real courses from recognized platforms to fill your skill gaps.</p>
            </div>
            {fullLoading && !fullData ? (
              <LoadingSpinner message="Curating courses for your profile…" />
            ) : fullCourses.length > 0 ? (
              <ul className="space-y-4">
                {fullCourses.map((course, idx) => <FullCourseCard key={`${course.courseName}-${idx}`} course={course} index={idx} />)}
              </ul>
            ) : (
              <Card className="py-10 text-center">
                <p className="text-sm text-text-secondary">No courses available yet. Refresh to generate.</p>
              </Card>
            )}
          </section>
        )}

        {/* Certifications tab */}
        {activeTab === 'certs' && (
          <section aria-labelledby="certs-heading">
            <div className="mb-4">
              <h2 id="certs-heading" className="flex items-center gap-2 text-xl font-bold text-text-main">
                <Award className="h-5 w-5 text-cyan" aria-hidden="true" />
                Recommended certifications
              </h2>
              <p className="mt-1 text-sm text-text-secondary">Industry-recognised credentials to validate your skills.</p>
            </div>
            {fullLoading && !fullData ? (
              <LoadingSpinner message="Selecting certifications for your career…" />
            ) : fullCerts.length > 0 ? (
              <ul className="space-y-4">
                {fullCerts.map((cert, idx) => <FullCertCard key={`${cert.certificationName}-${idx}`} cert={cert} index={idx} />)}
              </ul>
            ) : (
              <Card className="py-10 text-center">
                <p className="text-sm text-text-secondary">No certifications available yet. Refresh to generate.</p>
              </Card>
            )}
          </section>
        )}

        {/* Catalog picks tab (DB-bound) */}
        {activeTab === 'catalog' && (
          <section aria-labelledby="catalog-heading">
            <div className="mb-4">
              <h2 id="catalog-heading" className="flex items-center gap-2 text-xl font-bold text-text-main">
                <Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
                Catalog picks
              </h2>
              <p className="mt-1 text-sm text-text-secondary">Verified courses and certifications from the NextStep catalog, matched to your profile by Gemini AI.</p>
            </div>
            {loading && !data ? (
              <LoadingSpinner message="Loading catalog recommendations…" />
            ) : catalogCourses.length > 0 || catalogCerts.length > 0 ? (
              <div className="space-y-8">
                {catalogCourses.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-text-main">Courses from catalog</h3>
                    <ul className="space-y-4">
                      {catalogCourses.map((c, idx) => <CatalogCourseCard key={c.courseId ?? idx} course={c} index={idx} />)}
                    </ul>
                  </div>
                )}
                {catalogCerts.length > 0 && (
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-text-main">Certifications from catalog</h3>
                    <ul className="space-y-4">
                      {catalogCerts.map((cert, idx) => (
                        <li key={cert.certificationId ?? idx} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
                          <div className="flex items-start gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-soft text-sm font-bold text-cyan">{cert.priority ?? idx + 1}</span>
                            <div>
                              <h4 className="font-semibold text-text-main">{cert.name}</h4>
                              <p className="text-sm text-text-secondary">{cert.provider}</p>
                            </div>
                          </div>
                          <p className="text-sm leading-6 text-text-secondary">{cert.reason}</p>
                          {cert.officialUrl && (
                            <a href={cert.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-primary px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary-light">
                              Official page <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                            </a>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Card className="py-10 text-center">
                <Zap className="mx-auto h-10 w-10 text-text-secondary" aria-hidden="true" />
                <p className="mt-3 text-sm text-text-secondary">
                  No catalog items yet. The admin may need to seed the course catalog first.
                </p>
              </Card>
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPage;
