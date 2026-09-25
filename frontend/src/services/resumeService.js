import api from './api.js';

export const getResumeAnalyses = async () => {
  const response = await api.get('/resume');
  return response.data.analyses;
};

export const getResumeAnalysis = async (resumeId) => {
  const response = await api.get(`/resume/${resumeId}`);
  return response.data.analysis;
};

export const analyzeResume = async ({ resumeText, targetRole, file }) => {
  const params = targetRole ? `?targetRole=${encodeURIComponent(targetRole)}` : '';
  if (file) {
    const extension = file.name.toLowerCase().split('.').pop();
    const contentType = extension === 'pdf' ? 'application/pdf' : 'text/plain';
    const response = await api.post(`/resume/analyze-file${params}`, file, {
      headers: {
        'Content-Type': contentType,
        'X-File-Name': encodeURIComponent(file.name),
      },
    });
    return response.data.analysis;
  }
  const response = await api.post('/resume/analyze', { resumeText, targetRole });
  return response.data.analysis;
};

export const deleteResumeAnalysis = async (resumeId) => {
  await api.delete(`/resume/${resumeId}`);
  return resumeId;
};
