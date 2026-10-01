import { getUserCareerRecommendations } from '../services/recommendationService.js';
import { getFullCareerRecommendations } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Controller to fetch AI-powered course and certification recommendations for the authenticated user.
 * GET /api/recommendations/me
 */
export const getMyRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return sendError(res, 401, 'Unauthorized access.');
    }

    const forceRefresh = String(req.query.refresh || '').toLowerCase() === 'true';

    const result = await getUserCareerRecommendations(user, { forceRefresh });

    if (result.isIncomplete) {
      return sendSuccess(res, 200, result.message, {
        isIncomplete: true,
        message: result.message,
        requiredFields: result.requiredFields,
        summary: '',
        skillGaps: [],
        courseRecommendations: [],
        certificationRecommendations: [],
        learningPath: [],
      });
    }

    return sendSuccess(res, 200, 'Recommendations retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * Controller to fetch AI-generated Job + Course + Certification recommendations (real-world, not DB-bound).
 * POST /api/recommendations/full
 */
export const getMyFullRecommendations = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) return sendError(res, 401, 'Unauthorized access.');

    const profilePayload = {
      name: user.name || 'Student',
      target_role: user.careerGoals?.targetJobRole || 'Software Engineer',
      skills: (user.skills || []).map((s) => s.name),
      skill_levels: Object.fromEntries((user.skills || []).map((s) => [s.name, s.proficiency || 'Beginner'])),
      education: [user.education?.degree, user.education?.branch, user.education?.college].filter(Boolean).join(', '),
      branch: user.education?.branch || '',
      graduation_year: user.education?.graduationYear ? String(user.education.graduationYear) : '',
      current_role: user.experienceLevel || '',
      experience: user.experienceLevel || 'Entry-level',
      projects: (user.projects || []).map((p) => p.name),
      interests: user.interests || [],
      existing_certifications: (user.certifications || []).map((c) => c.name),
      completed_courses: [],
      preferred_location: user.careerGoals?.preferredLocation || user.location || '',
    };

    const result = await getFullCareerRecommendations(profilePayload);
    return sendSuccess(res, 200, 'Full recommendations retrieved successfully', result);
  } catch (error) {
    next(error);
  }
};
