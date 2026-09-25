import { getCareerRecommendations } from '../services/aiService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { publishNotification } from '../services/notificationService.js';

/**
 * Controller to fetch AI-powered career recommendations for the authenticated user.
 * GET /api/ai/career/recommend or POST /api/ai/career/recommend
 */
export const getCareerRecommendationsController = async (req, res, next) => {
  try {
    const user = req.user;

    if (!user) {
      return sendError(res, 401, 'Unauthorized access.');
    }

    // Map MongoDB User schema fields to FastAPI CareerProfileRequest format
    const allSkills = user.skills || [];
    const skills = allSkills
      .filter((s) => s.category?.toLowerCase() !== 'soft')
      .map((s) => s.name);
    
    const softSkills = allSkills
      .filter((s) => s.category?.toLowerCase() === 'soft')
      .map((s) => s.name);

    const interests = user.interests || [];

    const edu = user.education || {};
    let educationStr = '';
    if (edu.degree || edu.branch || edu.college) {
      const parts = [edu.degree, edu.branch, edu.college].filter(Boolean);
      educationStr = parts.join(' in ');
    }

    const targetRole = user.careerGoals?.targetJobRole || '';
    const projects = (user.projects || []).map((p) => p.name);
    const experienceLevel = edu.currentYear || 'Fresher';

    const profilePayload = {
      skills,
      softSkills,
      interests,
      experienceLevel,
      targetRole,
      education: educationStr,
      projects,
    };

    const aiResponse = await getCareerRecommendations(profilePayload);
    await publishNotification({
      userId: user._id,
      type: 'career',
      title: 'Career guidance is ready',
      message: `Your career guidance${targetRole ? ` for ${targetRole}` : ''} is ready to review.`,
      link: '/career',
    });

    return sendSuccess(res, 200, 'Career recommendations retrieved successfully', aiResponse);
  } catch (error) {
    console.error('Error in getCareerRecommendationsController:', error.message);
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Failed to retrieve career recommendations.';
    return sendError(res, statusCode, message);
  }
};
