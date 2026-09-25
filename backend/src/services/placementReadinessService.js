import AssessmentResult from '../models/AssessmentResult.js';
import LearningPath from '../models/LearningPath.js';
import PlacementReadiness from '../models/PlacementReadiness.js';
import Resume from '../models/Resume.js';
import SkillGap from '../models/SkillGap.js';
import { calculateProfileCompletion } from './userService.js';
import { publishNotification } from './notificationService.js';

const DIMENSION_WEIGHTS = {
  profile: 20,
  assessment: 25,
  resume: 20,
  portfolio: 15,
  careerPreparation: 20,
};

const summarizeAssessmentPerformance = (results) => {
  const latestBySubject = new Map();
  for (const result of results) {
    if (result.subject && !latestBySubject.has(result.subject)) latestBySubject.set(result.subject, result);
  }
  const subjectResults = [...latestBySubject.values()];
  return subjectResults.length
    ? Math.round(subjectResults.reduce((sum, result) => sum + result.percentage, 0) / subjectResults.length)
    : 0;
};

const getReadinessLevel = (score) => {
  if (score >= 80) return 'Ready';
  if (score >= 60) return 'On Track';
  if (score >= 35) return 'Building';
  return 'Starting';
};

const addActionWhenNeeded = (dimension, action, href, threshold = 80) => ({
  ...dimension,
  evidence: dimension.evidence.slice(0, 240),
  ...(dimension.score < threshold ? { action, href } : { action: '', href: '' }),
});

const serializeReadiness = (snapshot) => {
  if (!snapshot) return null;
  const value = snapshot.toObject ? snapshot.toObject() : snapshot;
  return {
    id: String(value._id || value.id),
    overallScore: value.overallScore,
    level: value.level,
    targetRole: value.targetRole,
    dimensions: value.dimensions.map(({ key, title, score, weight, method, evidence, action, href }) => ({
      key, title, score, weight, method, evidence, action, href,
    })),
    actionItems: value.actionItems.map(({ key, title, action, href }) => ({ key, title, action, href })),
    evaluatedAt: value.evaluatedAt,
  };
};

export const buildPlacementReadiness = async (user) => {
  const targetRole = user.careerGoals?.targetJobRole?.trim().slice(0, 120) || '';
  const [assessmentResults, latestResume, skillGap, roadmap] = await Promise.all([
    AssessmentResult.find({ user: user._id, subject: { $exists: true } })
      .sort({ submittedAt: -1 }).limit(20).select('subject percentage submittedAt').lean(),
    Resume.findOne({ user: user._id }).sort({ analyzedAt: -1 }).select('analysis.overallScore analyzedAt targetRole').lean(),
    targetRole ? SkillGap.findOne({ user: user._id, targetRole }).select('targetRole currentSkills skillGaps').lean() : null,
    LearningPath.findOne({ user: user._id }).select('overallProgress targetRole').lean(),
  ]);

  const completionBreakdown = calculateProfileCompletion(user).breakdown;
  const profileScore = Math.round((completionBreakdown.basicInfo + completionBreakdown.education
    + completionBreakdown.skills + completionBreakdown.interests + completionBreakdown.careerGoals) / 85 * 100);
  const assessmentScore = summarizeAssessmentPerformance(assessmentResults);
  const resumeMatchesRole = latestResume && (!targetRole || latestResume.targetRole?.toLowerCase() === targetRole.toLowerCase());
  const resumeScore = resumeMatchesRole ? latestResume.analysis?.overallScore || 0 : 0;
  const projectScore = Math.min(100, Math.round((user.projects?.length || 0) / 3 * 80)
    + Math.min(20, (user.certifications?.length || 0) * 10));
  const currentSkills = (user.skills || [])
    .filter((item) => item.category?.toLowerCase() !== 'soft')
    .map((item) => item.name.trim().toLowerCase()).sort();
  const analyzedSkills = (skillGap?.currentSkills || []).map((item) => item.trim().toLowerCase()).sort();
  const skillGapMatchesProfile = Boolean(skillGap?.skillGaps?.length)
    && JSON.stringify(currentSkills) === JSON.stringify(analyzedSkills);
  const careerPreparationScore = Math.round(
    (targetRole ? 30 : 0)
    + (skillGapMatchesProfile ? 35 : 0)
    + (roadmap?.targetRole?.toLowerCase() === targetRole.toLowerCase() ? 35 * (roadmap.overallProgress || 0) / 100 : 0)
  );

  const dimensions = [
    addActionWhenNeeded({
      key: 'profile', title: 'Profile completeness', score: profileScore, weight: DIMENSION_WEIGHTS.profile,
      method: 'Profile sections for personal details, education, skills, interests, and goals are normalized to 100.',
      evidence: `${user.skills?.length || 0} skills and ${user.interests?.length || 0} interests recorded`,
    }, 'Complete education, skills, projects, and career details.', '/profile'),
    addActionWhenNeeded({
      key: 'assessment', title: 'Technical assessments', score: assessmentScore, weight: DIMENSION_WEIGHTS.assessment,
      method: 'Average of your latest saved score in each subject.',
      evidence: assessmentResults.length ? `Latest assessment attempts across ${new Set(assessmentResults.map((item) => item.subject).filter(Boolean)).size} subjects` : 'No saved subject assessments yet',
    }, 'Take subject assessments and review the topics that need practice.', '/assessment', 75),
    addActionWhenNeeded({
      key: 'resume', title: 'Resume quality', score: resumeScore, weight: DIMENSION_WEIGHTS.resume,
      method: 'Latest resume content score for your current target role.',
      evidence: resumeMatchesRole ? `Latest matching resume review · ${new Date(latestResume.analyzedAt).toISOString().slice(0, 10)}` : 'No resume review matches the target role yet',
    }, 'Analyze your resume and apply its prioritized improvements.', '/resume', 75),
    addActionWhenNeeded({
      key: 'portfolio', title: 'Portfolio evidence', score: projectScore, weight: DIMENSION_WEIGHTS.portfolio,
      method: 'Up to 80 points for three listed projects and up to 20 points for two listed certifications.',
      evidence: `${user.projects?.length || 0} projects and ${user.certifications?.length || 0} certifications listed`,
    }, 'Add clear project outcomes and relevant certifications to your profile.', '/profile'),
    addActionWhenNeeded({
      key: 'careerPreparation', title: 'Career preparation', score: careerPreparationScore, weight: DIMENSION_WEIGHTS.careerPreparation,
      method: '30 points for a target role, 35 for current skill-gap analysis, and up to 35 for roadmap progress.',
      evidence: [targetRole ? `Target role: ${targetRole}` : 'Target role not set', skillGapMatchesProfile ? 'Current skill gaps analyzed' : 'Current skill gap analysis missing', roadmap?.targetRole?.toLowerCase() === targetRole.toLowerCase() ? `Learning roadmap ${roadmap.overallProgress || 0}% complete` : 'Learning roadmap missing'].join(' · '),
    }, !targetRole ? 'Set a target role in your profile.' : !skillGapMatchesProfile ? 'Run a skill gap analysis for your current profile and target role.' : 'Build a learning roadmap and complete its milestones.', !targetRole ? '/profile' : !skillGapMatchesProfile ? '/skills' : '/learning'),
  ];

  const overallScore = Math.round(dimensions.reduce((sum, item) => sum + item.score * item.weight, 0) / 100);
  return {
    overallScore,
    level: getReadinessLevel(overallScore),
    targetRole,
    dimensions,
    actionItems: dimensions.filter((item) => item.action).map(({ key, title, action, href }) => ({ key, title, action, href })),
    evaluatedAt: new Date(),
  };
};

export const getPlacementReadiness = async (userId) => {
  const snapshot = await PlacementReadiness.findOne({ user: userId }).sort({ evaluatedAt: -1 }).lean();
  return serializeReadiness(snapshot);
};

export const evaluatePlacementReadiness = async (user) => {
  const previousSnapshot = await PlacementReadiness.findOne({ user: user._id }).select('overallScore').lean();
  const readiness = await buildPlacementReadiness(user);
  let snapshot;
  try {
    snapshot = await PlacementReadiness.findOneAndUpdate(
      { user: user._id },
      { $set: readiness },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
  } catch (error) {
    if (error.code !== 11000) throw error;
    snapshot = await PlacementReadiness.findOneAndUpdate(
      { user: user._id },
      { $set: readiness },
      { new: true, runValidators: true }
    );
  }
  const result = serializeReadiness(snapshot);
  if (!previousSnapshot || previousSnapshot.overallScore !== result.overallScore) {
    await publishNotification({
      userId: user._id,
      type: 'placement',
      title: 'Placement readiness updated',
      message: `Your placement readiness${result.targetRole ? ` for ${result.targetRole}` : ''} is now ${result.overallScore}%. Review the recommended next steps.`,
      link: '/placement',
    });
  }
  return result;
};
