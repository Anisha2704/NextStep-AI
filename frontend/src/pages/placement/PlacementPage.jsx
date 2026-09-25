import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, CheckCircle2, CircleAlert, RefreshCw, Target } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card, { CardHeader } from '../../components/ui/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProgressBar from '../../components/ui/ProgressBar';
import { clearPlacementError, evaluateReadiness, fetchPlacementReadiness } from '../../store/slices/placementSlice';
import { formatDate } from '../../utils';

const PlacementPage = () => {
  const dispatch = useDispatch();
  const { readiness, loading, evaluating, hasLoaded, error } = useSelector((state) => state.placement);

  useEffect(() => {
    if (!hasLoaded) dispatch(fetchPlacementReadiness());
  }, [dispatch, hasLoaded]);

  if (loading && !hasLoaded) return <LoadingSpinner message="Loading placement readiness..." />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Career preparation</p>
          <h2 className="mt-1 text-3xl font-bold text-text-main">Placement Readiness</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">Get a practical snapshot of your profile, technical assessment performance, resume, portfolio, and preparation progress.</p>
        </div>
        {readiness && <Button variant="outline" loading={evaluating} onClick={() => dispatch(evaluateReadiness())}>
          <RefreshCw className="h-4 w-4" aria-hidden="true" /> Re-evaluate
        </Button>}
      </header>

      {error && <Alert message={error} onClose={() => dispatch(clearPlacementError())} />}

      {!readiness ? (
        <Card className="py-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary"><Target className="h-7 w-7" aria-hidden="true" /></div>
          <h3 className="mt-4 text-xl font-bold text-text-main">Build your readiness snapshot</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-text-secondary">We’ll review the data you have saved in NextStep AI and give you clear next steps. Your score updates only when you evaluate again.</p>
          <Button className="mt-5" loading={evaluating} onClick={() => dispatch(evaluateReadiness())}>
            <BriefcaseBusiness className="h-4 w-4" aria-hidden="true" /> Evaluate my readiness
          </Button>
        </Card>
      ) : (
        <>
          <Card>
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary-light text-primary"><Target className="h-7 w-7" aria-hidden="true" /></div>
                <div>
                  <p className="text-sm text-text-secondary">{readiness.targetRole ? `Target role: ${readiness.targetRole}` : 'Set a target career role in your profile to personalize your preparation.'}</p>
                  <h3 className="mt-1 text-2xl font-bold text-text-main">{readiness.level}</h3>
                  <p className="mt-1 text-xs text-text-secondary">Evaluated {formatDate(readiness.evaluatedAt)}</p>
                </div>
              </div>
              <div className="w-full md:max-w-md">
                <div className="mb-2 flex items-end justify-between"><span className="text-sm font-medium text-text-secondary">Readiness score</span><span className="text-3xl font-bold text-primary">{readiness.overallScore}<span className="text-base">/100</span></span></div>
                <ProgressBar value={readiness.overallScore} size="lg" />
              </div>
            </div>
          </Card>

          <section className="space-y-4" aria-labelledby="readiness-dimensions-title">
            <div>
              <h3 id="readiness-dimensions-title" className="text-xl font-bold text-text-main">Readiness dimensions</h3>
              <p className="mt-1 text-sm text-text-secondary">Each score is based on saved application data. Dimension weights are shown so you can understand the overall score.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {readiness.dimensions.map((dimension) => (
                <Card key={dimension.key}>
                  <div className="flex items-start justify-between gap-3">
                    <div><h4 className="font-semibold text-text-main">{dimension.title}</h4><p className="mt-1 text-xs text-text-secondary">Weight: {dimension.weight}%</p></div>
                    <Badge variant={dimension.score >= 75 ? 'success' : dimension.score >= 45 ? 'warning' : 'outline'}>{dimension.score}%</Badge>
                  </div>
                  <ProgressBar className="mt-4" value={dimension.score} />
                  <p className="mt-3 text-sm leading-6 text-text-secondary">{dimension.evidence}</p>
                  <p className="mt-2 text-xs leading-5 text-text-secondary">How this is scored: {dimension.method}</p>
                  {dimension.action && <Link to={dimension.href} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"><CircleAlert className="h-4 w-4" aria-hidden="true" />{dimension.action}<ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
                  {!dimension.action && <p className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-success"><CheckCircle2 className="h-4 w-4" aria-hidden="true" />Good foundation</p>}
                </Card>
              ))}
            </div>
          </section>

          <Card>
            <CardHeader title="Recommended next steps" subtitle="These actions are generated from missing or lower-scoring readiness areas." />
            {readiness.actionItems.length ? (
              <ol className="space-y-3">
                {readiness.actionItems.map((item, index) => (
                  <li key={item.key} className="flex flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary">{index + 1}</span><div><p className="font-medium text-text-main">{item.title}</p><p className="mt-1 text-sm text-text-secondary">{item.action}</p></div></div>
                    <Link to={item.href} className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-button)] border border-border bg-card px-3 py-1.5 text-sm font-medium text-text-main hover:bg-lavender focus:outline-none focus:ring-2 focus:ring-primary/20">Open <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-text-secondary">You have a strong foundation across all tracked areas. Keep your profile and evidence current.</p>}
          </Card>
          <p className="text-xs leading-5 text-text-secondary">This readiness score is a preparation aid based on the information you provided. It does not predict hiring outcomes. Re-evaluate after updating your profile, resume, assessments, or learning progress.</p>
        </>
      )}
    </div>
  );
};

export default PlacementPage;
