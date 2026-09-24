import api from './api';

export const getProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};

export const updateProfile = async (profileData) => {
  const { data } = await api.put('/users/profile', profileData);
  return data;
};

export const createProfile = async (profileData) => {
  const { data } = await api.post('/users/profile', profileData);
  return data;
};

export const addSkill = async (skillData) => {
  const { data } = await api.post('/users/skills', skillData);
  return data;
};

export const updateSkill = async (skillId, skillData) => {
  const { data } = await api.put(`/users/skills/${skillId}`, skillData);
  return data;
};

export const deleteSkill = async (skillId) => {
  const { data } = await api.delete(`/users/skills/${skillId}`);
  return data;
};

export const addProject = async (projectData) => {
  const { data } = await api.post('/users/projects', projectData);
  return data;
};

export const updateProject = async (projectId, projectData) => {
  const { data } = await api.put(`/users/projects/${projectId}`, projectData);
  return data;
};

export const deleteProject = async (projectId) => {
  const { data } = await api.delete(`/users/projects/${projectId}`);
  return data;
};

export const addCertification = async (certData) => {
  const { data } = await api.post('/users/certifications', certData);
  return data;
};

export const deleteCertification = async (certId) => {
  const { data } = await api.delete(`/users/certifications/${certId}`);
  return data;
};
