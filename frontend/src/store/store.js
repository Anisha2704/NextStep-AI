import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import aiReducer from './slices/aiSlice';
import learningReducer from './slices/learningSlice';
import assessmentReducer from './slices/assessmentSlice';
import resumeReducer from './slices/resumeSlice';
import placementReducer from './slices/placementSlice';
import notificationReducer from './slices/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ai: aiReducer,
    learning: learningReducer,
    assessments: assessmentReducer,
    resume: resumeReducer,
    placement: placementReducer,
    notifications: notificationReducer,
  },
});

export default store;

