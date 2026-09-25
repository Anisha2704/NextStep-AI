import api from './api';

export const getNotifications = async (limit = 50) => {
  const response = await api.get('/notifications', { params: { limit } });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  await api.patch(`/notifications/${notificationId}/read`);
  return notificationId;
};

export const markAllNotificationsRead = async () => {
  await api.patch('/notifications/read-all');
};

export const getNotificationPreferences = async () => {
  const response = await api.get('/notifications/preferences');
  return response.data;
};

export const updateNotificationPreferences = async (preferences) => {
  const response = await api.patch('/notifications/preferences', preferences);
  return response.data;
};
