import api from './api';

export const register = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  return data;
};

export const login = async (credentials) => {
  const { data } = await api.post('/auth/login', credentials);
  return data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me');
  return data;
};

export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore network error on logout
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
  }
};

export const forgotPassword = async (email) => {
  const clientUrl = typeof window !== 'undefined' ? window.location.origin : undefined;
  const { data } = await api.post('/auth/forgot-password', { email, clientUrl });
  return data;
};

export const resetPassword = async ({ token, newPassword }) => {
  const { data } = await api.post('/auth/reset-password', { token, newPassword });
  return data;
};

