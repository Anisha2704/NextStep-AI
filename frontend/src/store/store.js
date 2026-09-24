import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import aiReducer from './slices/aiSlice';
import learningReducer from './slices/learningSlice';
import assessmentReducer from './slices/assessmentSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    ai: aiReducer,
    learning: learningReducer,
    assessments: assessmentReducer,
  },
});

export default store;

