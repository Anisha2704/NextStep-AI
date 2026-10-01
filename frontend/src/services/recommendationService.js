import api from './api';

/**
 * Fetch AI-powered course & certification recommendations for the current user (DB-bound).
 * @param {boolean} forceRefresh - If true, bypasses the 24h cache and requests a fresh Gemini analysis.
 */
export const fetchRecommendations = async (forceRefresh = false) => {
  const url = forceRefresh ? '/recommendations/me?refresh=true' : '/recommendations/me';
  const response = await api.get(url);
  return response.data?.data ?? response.data;
};

/**
 * Fetch full AI-powered career recommendations (Jobs + Real Courses + Real Certifications).
 * These are AI-generated from real-world knowledge, not limited to the course catalog.
 */
export const fetchFullRecommendations = async () => {
  const response = await api.get('/recommendations/full');
  return response.data?.data ?? response.data;
};
