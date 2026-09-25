import api from './api.js';

export const getPlacementReadiness = async () => {
  const response = await api.get('/placement/readiness');
  return response.data.readiness;
};

export const evaluatePlacementReadiness = async () => {
  const response = await api.post('/placement/readiness/evaluate');
  return response.data.readiness;
};
