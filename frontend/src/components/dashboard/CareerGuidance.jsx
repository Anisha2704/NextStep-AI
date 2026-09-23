import { useDispatch, useSelector } from 'react-redux';
import {
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Target,
  ArrowRight,
  Brain,
} from 'lucide-react';
import { getCareerRecommendations, clearAIError } from '../../store/slices/aiSlice';
import Card, { CardHeader } from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Alert from '../ui/Alert';

const CareerGuidance = () => {
  const dispatch = useDispatch();
  const { careerRecommendations, loading, error } = useSelector((state) => state.ai);

  const handleFetchGuidance = () => {
    dispatch(getCareerRecommendations());
  };

  const summary = careerRecommendations?.summary;
  const recommendations = careerRecommendations?.recommendedCareers || [];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-text-main">AI Career Guidance</h3>
              <p className="mt-0.5 text-sm text-text-secondary">
                Personalized career path recommendations powered by Google Gemini AI
              </p>
            </div>
          </div>

          {careerRecommendations && !loading && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleFetchGuidance}
              loading={loading}
              className="self-start sm:self-auto"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Guidance
            </Button>
          )}
        </div>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-error/20 bg-error/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3 text-error">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-sm">Unable to generate career guidance</h4>
                <p className="mt-1 text-sm text-text-secondary">{error}</p>
              </div>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                dispatch(clearAIError());
                handleFetchGuidance();
              }}
              className="self-start sm:self-auto"
            >
              Try Again
            </Button>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-primary animate-pulse">
              <Brain className="h-8 w-8 animate-spin" />
            </div>
            <h4 className="text-lg font-semibold text-text-main">Analyzing your profile...</h4>
            <p className="mt-1 text-sm text-text-secondary max-w-md">
              Finding career paths that match your skills, education, and target goals using Gemini AI.
            </p>
          </div>
        </Card>
      )}

      {/* Empty State (Initial) */}
      {!loading && !careerRecommendations && !error && (
        <Card className="py-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-lavender text-primary mb-4">
            <Sparkles className="h-7 w-7" />
          </div>
          <h4 className="text-lg font-bold text-text-main">Ready to explore your career path?</h4>
          <p className="mx-auto mt-2 max-w-md text-sm text-text-secondary">
            We&apos;ll analyze your profile, technical skills, and interests to suggest career paths and practical skills you can develop next.
          </p>
          <div className="mt-6">
            <Button variant="primary" size="lg" onClick={handleFetchGuidance}>
              <Sparkles className="h-5 w-5" />
              Get Career Guidance
            </Button>
          </div>
        </Card>
      )}

      {/* Results View */}
      {!loading && careerRecommendations && (
        <div className="space-y-6">
          {/* Executive Summary Card */}
          {summary && (
            <Card className="border-primary/20 bg-primary-light/30">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-primary text-white p-2.5 shrink-0 mt-0.5">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-primary">Career Summary</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-text-main">{summary}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Recommendations Cards Grid */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Recommended Roles ({recommendations.length})
            </h4>

            <div className="grid gap-6 md:grid-cols-2">
              {recommendations.map((rec, index) => (
                <Card key={index} className="flex flex-col justify-between hover:shadow-md transition-shadow">
                  <div className="space-y-4">
                    {/* Role Header */}
                    <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="rounded-xl bg-lavender p-2 text-primary">
                          <Briefcase className="h-5 w-5" />
                        </div>
                        <h5 className="text-base font-bold text-text-main">{rec.role}</h5>
                      </div>
                      <Badge variant="default">Option #{index + 1}</Badge>
                    </div>

                    {/* Why this role */}
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1">
                        Why this role?
                      </p>
                      <p className="text-sm text-text-main leading-relaxed">{rec.reason}</p>
                    </div>

                    {/* Matching Skills */}
                    {rec.matchingSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                          Matching Skills You Have
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.matchingSkills.map((skill, sIdx) => (
                            <Badge key={sIdx} variant="success">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Skills to Develop */}
                    {rec.missingSkills?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                          Skills to Develop Next
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {rec.missingSkills.map((skill, mIdx) => (
                            <Badge key={mIdx} variant="warning">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actionable Next Steps */}
                    {rec.nextSteps?.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-secondary mb-2">
                          Recommended Next Steps
                        </p>
                        <ul className="space-y-2">
                          {rec.nextSteps.map((step, nIdx) => (
                            <li key={nIdx} className="flex items-start gap-2 text-xs text-text-main">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-primary mt-0.5" />
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

export default CareerGuidance;
