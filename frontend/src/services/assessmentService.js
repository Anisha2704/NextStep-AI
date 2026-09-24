import api from './api.js';

export const getAssessments = async () => {
  const response = await api.get('/assessments');
  return response.data.assessments;
};

export const getAssessment = async (assessmentId) => {
  const response = await api.get(`/assessments/${assessmentId}`);
  return response.data.assessment;
};

export const submitAssessment = async ({ assessmentId, answers }) => {
  const response = await api.post(`/assessments/${assessmentId}/submit`, { answers });
  return response.data.result;
};

export const getAssessmentResults = async () => {
  const response = await api.get('/assessments/results');
  return response.data.results;
};

export const getAssessmentResult = async (resultId) => {
  const response = await api.get(`/assessments/results/${resultId}`);
  return response.data.result;
};
