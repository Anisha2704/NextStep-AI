import api from './api';

/**
 * Service to interact with the backend AI endpoints.
 */
export const getCareerRecommendations = async () => {
  const response = await api.post('/ai/career/recommend');
  return response.data;
};
