import api from './api.js';

export const getLearningRoadmap = async () => {
  try {
    const response = await api.get('/learning/roadmap');
    return response.data.roadmap;
  } catch (error) {
    if (error.response?.status === 404) return null;
    throw error;
  }
};

export const getRoadmapReadiness = async () => {
  const response = await api.get('/learning/roadmap/readiness');
  return response.data.readiness;
};

export const generateLearningRoadmap = async (confirmRegeneration = false) => {
  const response = await api.post('/learning/roadmap/generate', { confirmRegeneration });
  return response.data.roadmap;
};

export const updateLearningMilestone = async ({ milestoneId, status }) => {
  const response = await api.patch(`/learning/roadmap/milestones/${milestoneId}`, { status });
  return response.data.roadmap;
};
