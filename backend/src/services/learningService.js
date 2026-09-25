import LearningPath from '../models/LearningPath.js';
import SkillGap from '../models/SkillGap.js';
import { publishNotification } from './notificationService.js';
import { generateLearningRoadmap as requestRoadmap } from './aiService.js';

const serviceError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

const serializeRoadmap = (roadmap) => {
  const result = roadmap.toObject ? roadmap.toObject() : roadmap;
  return {
    id: String(result._id || result.id),
    targetRole: result.targetRole,
    title: result.title,
    generatedAt: result.generatedAt,
    lastUpdatedAt: result.lastUpdatedAt,
    version: result.version,
    generationSource: result.generationSource || 'ai',
    status: result.status,
    overallProgress: result.overallProgress,
    stages: result.stages,
  };
};

export const getRoadmapReadiness = async (user) => {
  const targetRole = user.careerGoals?.targetJobRole?.trim() || '';
  const skills = (user.skills || []).map((skill) => skill.name).filter(Boolean);
  const missing = [];

  if (!targetRole) missing.push('targetRole');
  if (!skills.length) missing.push('skills');

  const skillGap = targetRole
    ? await SkillGap.findOne({ user: user._id, targetRole })
    : null;
  const analyzedSkills = (skillGap?.currentSkills || []).map((skill) => skill.trim().toLowerCase()).sort();
  const currentSkills = skills.map((skill) => skill.trim().toLowerCase()).sort();
  if (!skillGap?.skillGaps?.length || JSON.stringify(analyzedSkills) !== JSON.stringify(currentSkills)) {
    missing.push('skillGap');
  }

  return { canGenerate: missing.length === 0, missing, targetRole, skillGap };
};

export const getRoadmapForUser = async (userId) => {
  const roadmap = await LearningPath.findOne({ user: userId });
  if (!roadmap?.stages?.length) return null;
  return serializeRoadmap(roadmap);
};

const calculateProgress = (stages) => {
  const milestones = stages.flatMap((stage) => stage.milestones);
  const completed = milestones.filter((milestone) => milestone.status === 'completed').length;
  return milestones.length ? Math.round((completed / milestones.length) * 100) : 0;
};

const updateProgress = (roadmap) => {
  let completedStages = 0;
  for (const stage of roadmap.stages) {
    const completed = stage.milestones.filter((milestone) => milestone.status === 'completed').length;
    const inProgress = stage.milestones.some((milestone) => milestone.status === 'in_progress');
    stage.progress = stage.milestones.length
      ? Math.round((completed / stage.milestones.length) * 100)
      : 0;
    if (completed === stage.milestones.length) {
      stage.status = 'completed';
      completedStages += 1;
    } else if (completed || inProgress) {
      stage.status = 'in_progress';
    } else {
      stage.status = 'not_started';
    }
  }
  roadmap.overallProgress = calculateProgress(roadmap.stages);
  roadmap.progress = roadmap.overallProgress;
  roadmap.status = completedStages === roadmap.stages.length ? 'completed' : 'active';
  roadmap.lastUpdatedAt = new Date();
};

const normalizePlan = (plan, expectedRole) => {
  if (!plan || typeof plan !== 'object' || !Array.isArray(plan.stages)) {
    throw serviceError(502, 'The learning service returned an invalid roadmap. Please try again.');
  }
  if (typeof plan.targetRole !== 'string' || plan.targetRole.trim().toLowerCase() !== expectedRole.toLowerCase()) {
    throw serviceError(502, 'The learning service returned a roadmap for a different role. Please try again.');
  }
  if (plan.stages.length < 1 || plan.stages.length > 8) {
    throw serviceError(502, 'The learning service returned an invalid roadmap. Please try again.');
  }

  let milestoneCount = 0;
  const stages = plan.stages.map((stage, stageIndex) => {
    const validText = (value, min, max) => typeof value === 'string'
      && value.trim().length >= min && value.trim().length <= max;
    const validHours = (value, max) => Number.isFinite(value) && value >= 0.1 && value <= max;
    if (
      !stage || !validText(stage.title, 2, 120) || !validText(stage.description, 5, 600)
      || !validHours(stage.estimatedHours, 500)
      || !Array.isArray(stage.milestones) || stage.milestones.length < 1 || stage.milestones.length > 12
    ) {
      throw serviceError(502, 'The learning service returned an invalid roadmap. Please try again.');
    }
    milestoneCount += stage.milestones.length;
    const milestones = stage.milestones.map((milestone, milestoneIndex) => {
      if (
        !milestone || !validText(milestone.title, 2, 120)
        || !validText(milestone.description, 5, 600)
        || !validText(milestone.skill, 1, 100)
        || !validHours(milestone.estimatedHours, 100)
        || (milestone.resources !== undefined && !Array.isArray(milestone.resources))
        || (milestone.resources || []).length > 4
        || (milestone.resources || []).some((resource) => (
          !resource || !validText(resource.title, 1, 120)
          || typeof resource.url !== 'string' || resource.url.length > 2048
          || !resource.url.startsWith('https://')
        ))
      ) {
        throw serviceError(502, 'The learning service returned an invalid roadmap. Please try again.');
      }
      return {
        title: milestone.title.trim(),
        description: milestone.description.trim(),
        skill: milestone.skill.trim(),
        estimatedHours: milestone.estimatedHours,
        order: milestoneIndex + 1,
        resources: (milestone.resources || []).map((resource) => ({
          title: resource.title.trim(),
          url: resource.url,
          type: 'other',
        })),
        status: 'not_started',
        completedAt: null,
      };
    });
    const estimatedHours = milestones.reduce((total, milestone) => total + milestone.estimatedHours, 0);
    if (estimatedHours > 500) {
      throw serviceError(502, 'The learning service returned an invalid roadmap. Please try again.');
    }
    return {
      title: stage.title.trim(),
      description: stage.description.trim(),
      estimatedHours,
      order: stageIndex + 1,
      status: 'not_started',
      progress: 0,
      milestones,
    };
  });

  if (milestoneCount > 60) {
    throw serviceError(502, 'The learning service returned too many roadmap milestones. Please try again.');
  }
  return stages;
};

const buildSkillGapFallback = (skillGap, targetRole) => {
  const priorityOrder = { High: 0, Medium: 1, Low: 2 };
  const actionableGaps = (skillGap.skillGaps || [])
    .filter((gap) => gap.status !== 'Strong')
    .sort((left, right) => (priorityOrder[left.priority] ?? 3) - (priorityOrder[right.priority] ?? 3));

  if (!actionableGaps.length) return null;

  const stages = [];
  const priorities = ['High', 'Medium', 'Low'];
  for (const priority of priorities) {
    const priorityGaps = actionableGaps.filter((gap) => gap.priority === priority);
    const priorityLabel = priority === 'High' ? 'High-priority' : priority === 'Medium' ? 'Medium-priority' : 'Further development';
    for (let index = 0; index < priorityGaps.length; index += 12) {
      const batch = priorityGaps.slice(index, index + 12);
      const milestones = batch.map((gap) => {
        const topics = (gap.whatToLearn || []).slice(0, 3).join(', ');
        const nextSteps = (gap.nextSteps || []).slice(0, 2).join(' ');
        const description = [
          gap.reason ? `Why it matters: ${gap.reason.slice(0, 220)}` : '',
          topics ? `Study topics: ${topics.slice(0, 180)}` : '',
          nextSteps ? `Practice: ${nextSteps.slice(0, 160)}` : '',
        ].filter(Boolean).join(' ').slice(0, 600);

        return {
          title: `Build ${gap.skill}`,
          description: description || `Develop ${gap.skill} for your ${targetRole} goal through focused practice.`,
          skill: gap.skill,
          estimatedHours: priority === 'High' ? 6 : priority === 'Medium' ? 4 : 2,
          resources: [],
        };
      });

      stages.push({
        title: `${priorityLabel} skill gaps${index ? ` (${Math.floor(index / 12) + 1})` : ''}`,
        description: `Work through these priorities from your saved Skill Gap Analysis for ${targetRole}.`,
        estimatedHours: milestones.reduce((total, milestone) => total + milestone.estimatedHours, 0),
        milestones,
      });
    }
  }

  return { targetRole, stages };
};

export const generateRoadmapForUser = async (user, confirmRegeneration = false) => {
  const readiness = await getRoadmapReadiness(user);
  if (readiness.missing.includes('targetRole')) {
    throw serviceError(409, 'Set a target career role in your profile before generating a roadmap.');
  }
  if (readiness.missing.includes('skills')) {
    throw serviceError(409, 'Add at least one current skill to your profile before generating a roadmap.');
  }
  if (readiness.missing.includes('skillGap')) {
    throw serviceError(409, 'Run Skill Gap Analysis for your profile target role before generating a roadmap.');
  }

  const existing = await LearningPath.findOne({ user: user._id });
  if (existing?.stages?.length && !confirmRegeneration) {
    throw serviceError(409, 'A roadmap already exists. Confirm regeneration to create a new version.');
  }

  const targetRole = readiness.targetRole;
  const skillGap = readiness.skillGap;
  const education = user.education || {};
  const skillGaps = skillGap.skillGaps.map((gap) => ({
    skill: gap.skill,
    status: gap.status,
    priority: gap.priority,
    reason: gap.reason,
    whatToLearn: gap.whatToLearn || [],
    nextSteps: gap.nextSteps || [],
  }));

  const roadmapRequest = {
    targetRole,
    currentSkills: (user.skills || []).map((skill) => skill.name).filter(Boolean),
    skillGaps,
    experienceLevel: user.experienceLevel || 'Student',
    education: [education.level, education.degree, education.branch, education.college]
      .filter(Boolean)
      .join(', '),
    interests: user.interests || [],
    careerGoals: [
      user.careerGoals?.targetIndustry,
      ...(user.careerGoals?.preferredDomains || []),
      user.careerGoals?.description,
    ].filter(Boolean).join('; ').slice(0, 1000),
  };
  let generationSource = 'ai';
  let generated;
  try {
    generated = await requestRoadmap(roadmapRequest);
  } catch (error) {
    if (error.statusCode !== 429) throw error;
    generated = buildSkillGapFallback(skillGap, targetRole);
    if (!generated) throw error;
    generationSource = 'skill_gap_fallback';
  }
  const stages = normalizePlan(generated, targetRole);
  const now = new Date();

  if (existing) {
    const history = (existing.history || []).map((version) => version.toObject ? version.toObject() : version);
    if (existing.stages?.length) {
      history.push({
        version: existing.version,
        targetRole: existing.targetRole,
        generationSource: existing.generationSource || 'ai',
        generatedAt: existing.generatedAt,
        overallProgress: existing.overallProgress,
        stages: existing.stages,
      });
    }
    existing.title = `Learning roadmap for ${targetRole}`;
    existing.targetRole = targetRole;
    existing.generatedAt = now;
    existing.lastUpdatedAt = now;
    existing.version = existing.stages?.length ? (existing.version || 1) + 1 : 1;
    existing.generationSource = generationSource;
    existing.status = 'active';
    existing.overallProgress = 0;
    existing.progress = 0;
    existing.stages = stages;
    existing.history = history.slice(-5);
    try {
      await existing.save();
    } catch (error) {
      if (error.name === 'VersionError') {
        throw serviceError(409, 'The roadmap changed while regeneration was running. Refresh and try again.');
      }
      throw error;
    }
    await publishNotification({
      userId: user._id,
      type: 'learning',
      title: 'Learning roadmap is ready',
      message: `Your ${targetRole} learning roadmap${generationSource === 'skill_gap_fallback' ? ' is based on your saved skill gaps while AI generation is unavailable' : ' has been generated'}.`,
      link: '/learning',
    });
    return serializeRoadmap(existing);
  }

  const roadmap = new LearningPath({
    user: user._id,
    title: `Learning roadmap for ${targetRole}`,
    targetRole,
    generatedAt: now,
    lastUpdatedAt: now,
    version: 1,
    generationSource,
    status: 'active',
    overallProgress: 0,
    progress: 0,
    stages,
    history: [],
    steps: [],
  });
  try {
    await roadmap.save();
  } catch (error) {
    if (error.code === 11000) {
      throw serviceError(409, 'A roadmap was generated concurrently. Refresh to view it.');
    }
    throw error;
  }
  await publishNotification({
    userId: user._id,
    type: 'learning',
    title: 'Learning roadmap is ready',
    message: `Your ${targetRole} learning roadmap${generationSource === 'skill_gap_fallback' ? ' is based on your saved skill gaps while AI generation is unavailable' : ' has been generated'}.`,
    link: '/learning',
  });
  return serializeRoadmap(roadmap);
};

export const updateRoadmapMilestone = async (userId, milestoneId, status) => {
  const roadmap = await LearningPath.findOne({
    user: userId,
    'stages.milestones._id': milestoneId,
  });
  if (!roadmap) throw serviceError(404, 'Roadmap milestone not found.');

  let selectedMilestone;
  for (const stage of roadmap.stages) {
    selectedMilestone = stage.milestones.id(milestoneId);
    if (selectedMilestone) break;
  }
  if (!selectedMilestone) throw serviceError(404, 'Roadmap milestone not found.');

  const newlyCompleted = status === 'completed' && selectedMilestone.status !== 'completed';
  selectedMilestone.status = status;
  selectedMilestone.completedAt = status === 'completed' ? new Date() : null;
  updateProgress(roadmap);
  await roadmap.save();
  if (newlyCompleted) {
    await publishNotification({
      userId,
      type: 'milestone',
      title: 'Learning milestone completed',
      message: `You completed “${selectedMilestone.title}” on your ${roadmap.targetRole} roadmap.`,
      link: '/learning',
    });
  }
  return serializeRoadmap(roadmap);
};
