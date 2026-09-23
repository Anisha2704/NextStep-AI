import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Sparkles, ArrowRight, Briefcase, Brain, RefreshCw } from 'lucide-react';
import { getCareerRecommendations } from '../../store/slices/aiSlice';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const CareerGuidancePreview = () => {
  const dispatch = useDispatch();
  const { careerRecommendations, loading } = useSelector((state) => state.ai);

  const topRoles = careerRecommendations?.recommendedCareers?.slice(0, 3) || [];
  const summary = careerRecommendations?.summary;

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-card via-lavender/30 to-primary-light/20">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Sparkles className="h-4 w-4" />
            <span>AI Career Guidance</span>
            <Badge variant="default" className="ml-1 text-[10px]">
              Gemini Powered
            </Badge>
          </div>

          {!careerRecommendations ? (
            <div>
              <h3 className="text-xl font-bold text-text-main">
                Discover Career Paths Matching Your Skills
              </h3>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                Let Gemini AI analyze your technical profile, interests, and experience level to suggest tailored career roles and actionable learning roadmaps.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-text-main">
                Your AI Career Match Breakdown
              </h3>
              <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                {summary}
              </p>
              {topRoles.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-text-secondary font-medium">Top Matches:</span>
                  {topRoles.map((roleObj, i) => (
                    <Badge key={i} variant="default" className="text-xs font-semibold">
                      <Briefcase className="h-3 w-3 mr-1 inline" />
                      {roleObj.role}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {!careerRecommendations ? (
            <Link to="/career">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <Sparkles className="h-4 w-4" />
                Get Career Guidance
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(getCareerRecommendations())}
                loading={loading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
              <Link to="/career">
                <Button variant="primary" size="sm">
                  View Full Guidance
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CareerGuidancePreview;
