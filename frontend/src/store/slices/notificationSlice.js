import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getNotifications,
  getNotificationPreferences,
  markAllNotificationsRead,
  markNotificationRead,
  updateNotificationPreferences,
} from '../../services/notificationService';
import { getErrorMessage } from '../../utils';

const initialState = {
  notifications: [],
  unreadCount: 0,
  preferences: { emailEnabled: true },
  emailDeliveryConfigured: false,
  loading: false,
  hasLoaded: false,
  preferencesLoading: false,
  error: null,
};

const createRequest = (type, request) => createAsyncThunk(type, async (payload, { rejectWithValue }) => {
  try { return await request(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const fetchNotifications = createRequest('notifications/fetch', getNotifications);
export const markRead = createRequest('notifications/markRead', markNotificationRead);
export const markAllRead = createRequest('notifications/markAllRead', markAllNotificationsRead);
export const fetchNotificationPreferences = createRequest('notifications/fetchPreferences', getNotificationPreferences);
export const saveNotificationPreferences = createRequest('notifications/savePreferences', updateNotificationPreferences);

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: { clearNotificationError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => { state.error = null; state.loading = !state.hasLoaded; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.notifications = action.payload.notifications || [];
        state.unreadCount = action.payload.unreadCount || 0;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.error = action.payload || 'Unable to load notifications.';
      })
      .addCase(markRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((item) => item.id === action.payload);
        if (notification && !notification.readAt) {
          notification.readAt = new Date().toISOString();
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markRead.rejected, (state, action) => { state.error = action.payload || 'Unable to update this notification.'; })
      .addCase(markAllRead.fulfilled, (state) => {
        const readAt = new Date().toISOString();
        state.notifications.forEach((notification) => { notification.readAt = notification.readAt || readAt; });
        state.unreadCount = 0;
      })
      .addCase(markAllRead.rejected, (state, action) => { state.error = action.payload || 'Unable to mark notifications as read.'; })
      .addCase(fetchNotificationPreferences.pending, (state) => { state.preferencesLoading = true; })
      .addCase(fetchNotificationPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload.preferences || { emailEnabled: true };
        state.emailDeliveryConfigured = action.payload.emailDeliveryConfigured === true;
      })
      .addCase(fetchNotificationPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = action.payload || 'Unable to load notification preferences.';
      })
      .addCase(saveNotificationPreferences.pending, (state) => { state.preferencesLoading = true; })
      .addCase(saveNotificationPreferences.fulfilled, (state, action) => {
        state.preferencesLoading = false;
        state.preferences = action.payload.preferences || state.preferences;
        state.emailDeliveryConfigured = action.payload.emailDeliveryConfigured === true;
      })
      .addCase(saveNotificationPreferences.rejected, (state, action) => {
        state.preferencesLoading = false;
        state.error = action.payload || 'Unable to save notification preferences.';
      })
      .addMatcher((action) => [
        'auth/logout', 'auth/login/fulfilled', 'auth/register/fulfilled', 'auth/fetchCurrentUser/rejected',
      ].includes(action.type), () => initialState);
  },
});

export const { clearNotificationError } = notificationSlice.actions;
export default notificationSlice.reducer;
