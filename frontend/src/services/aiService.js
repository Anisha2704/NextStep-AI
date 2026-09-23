import api from './api';

/**
 * Service to interact with the backend AI endpoints.
 */
export const getCareerRecommendations = async () => {
  const response = await api.post('/ai/career/recommend');
  return response.data;
};

/**
 * Service to request AI Skill Gap Analysis for a target role.
 * @param {string} [targetRole] - Optional target role to evaluate against.
 */
export const analyzeSkillGap = async (targetRole) => {
  const response = await api.post('/ai/skill-gap/analyze', { targetRole });
  return response.data;
};

