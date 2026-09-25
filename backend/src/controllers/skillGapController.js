import { analyzeSkillGap } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import SkillGap from '../models/SkillGap.js';
import { publishNotification } from '../services/notificationService.js';

/**
 * Controller to analyze skill gaps for the authenticated user against a target role.
 * POST /api/ai/skill-gap/analyze
 */
export const analyzeSkillGapController = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return sendError(res, 401, 'Unauthorized access.');
    }

    // Target role can come from request body or fall back to user's saved career goals
    const targetRole = req.body?.targetRole || user.careerGoals?.targetJobRole;

    if (!targetRole || !targetRole.trim()) {
      return sendError(
        res,
        400,
        'Please select or set a target career role for skill gap analysis.'
      );
    }

    // Map MongoDB User schema fields to FastAPI SkillGapRequest format
    const allSkills = user.skills || [];
    const skills = allSkills
      .filter((s) => s.category?.toLowerCase() !== 'soft')
      .map((s) => s.name);
    
    const softSkills = allSkills
      .filter((s) => s.category?.toLowerCase() === 'soft')
      .map((s) => s.name);

    const edu = user.education || {};
    let educationStr = '';
    if (edu.degree || edu.branch || edu.college) {
      const parts = [edu.degree, edu.branch, edu.college].filter(Boolean);
      educationStr = parts.join(' in ');
    }

    const projects = (user.projects || []).map((p) => p.name);
    const experienceLevel = edu.currentYear || 'Fresher';

    const profilePayload = {
      targetRole: targetRole.trim(),
      skills,
      softSkills,
      experienceLevel,
      education: educationStr,
      projects,
    };

    const aiResponse = await analyzeSkillGap(profilePayload);

    await SkillGap.findOneAndUpdate(
      { user: user._id, targetRole: profilePayload.targetRole },
      {
        $set: {
          summary: aiResponse.summary,
          currentSkills: skills,
          skillGaps: aiResponse.skillGaps,
          missingSkills: (aiResponse.skillGaps || [])
            .filter((gap) => gap.status === 'Missing')
            .map((gap) => ({ name: gap.skill, priority: gap.priority })),
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    await publishNotification({
      userId: user._id,
      type: 'skill_gap',
      title: 'Skill gap analysis is ready',
      message: `Your skill gap analysis for ${profilePayload.targetRole} has been saved and can be used to guide your learning roadmap.`,
      link: '/skills',
    });

    return sendSuccess(res, 200, 'Skill gap analysis completed successfully', aiResponse);
  } catch (error) {
    console.error('Error in analyzeSkillGapController:', error.message);
    const statusCode = error.statusCode || 500;
    const message = statusCode >= 500
      ? 'Failed to analyze skill gap. Please try again.'
      : error.message || 'Failed to analyze skill gap.';
    return sendError(res, statusCode, message);
  }
};
