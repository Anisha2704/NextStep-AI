import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Target, ArrowRight, Sparkles, Brain, RefreshCw } from 'lucide-react';
import { analyzeSkillGap } from '../../store/slices/aiSlice';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const SkillGapPreview = () => {
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.user);
  const { skillGap, skillGapLoading } = useSelector((state) => state.ai);

  const targetRole = profile?.careerGoals?.targetJobRole || 'Full Stack Developer';
  const gaps = skillGap?.skillGaps || [];
  const missingCount = gaps.filter((g) => g.status?.toLowerCase() === 'missing').length;

  return (
    <Card className="border-cyan/20 bg-gradient-to-r from-card via-cyan-soft/20 to-lavender/30">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 text-cyan font-semibold text-sm">
            <Target className="h-4 w-4" />
            <span>AI Skill Gap Analysis</span>
            <Badge variant="cyan" className="ml-1 text-[10px]">
              Gemini Powered
            </Badge>
          </div>

          {!skillGap ? (
            <div>
              <h3 className="text-xl font-bold text-text-main">
                Analyze Skill Gaps for {targetRole}
              </h3>
              <p className="mt-1 text-sm text-text-secondary leading-relaxed">
                Compare your current skills against industry expectations to uncover high-priority missing skills and learning steps.
              </p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
                <span>Skill Readiness for {skillGap.targetRole || targetRole}</span>
              </h3>
              <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                {skillGap.summary}
              </p>
              <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="font-semibold text-text-main">Evaluated Gaps: {gaps.length}</span>
                {missingCount > 0 && (
                  <Badge variant="warning">{missingCount} Missing Skills Identified</Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          {!skillGap ? (
            <Link to="/skills">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                <Target className="h-4 w-4" />
                Analyze Skill Gap
              </Button>
            </Link>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => dispatch(analyzeSkillGap(targetRole))}
                loading={skillGapLoading}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Re-Analyze
              </Button>
              <Link to="/skills">
                <Button variant="primary" size="sm">
                  View Full Analysis
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

export default SkillGapPreview;
