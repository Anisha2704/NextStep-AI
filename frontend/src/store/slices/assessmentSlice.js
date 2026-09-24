import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getAssessment,
  getAssessmentResult,
  getAssessmentResults,
  getAssessments,
  submitAssessment as submitAssessmentApi,
} from '../../services/assessmentService.js';
import { getErrorMessage } from '../../utils/index.js';

const initialState = {
  assessments: [],
  results: [],
  activeAssessment: null,
  currentResult: null,
  loading: false,
  loadingAssessment: false,
  loadingResults: false,
  loadingReview: false,
  submitting: false,
  error: null,
  success: null,
};

const createRequest = (type, request) => createAsyncThunk(type, async (payload, { rejectWithValue }) => {
  try {
    return await request(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error));
  }
});

export const fetchAssessments = createRequest('assessments/fetchCatalog', getAssessments);
export const fetchAssessment = createRequest('assessments/fetchOne', getAssessment);
export const fetchAssessmentResults = createRequest('assessments/fetchResults', getAssessmentResults);
export const fetchAssessmentResult = createRequest('assessments/fetchResult', getAssessmentResult);
export const submitAssessment = createRequest('assessments/submit', submitAssessmentApi);

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    clearAssessmentError: (state) => { state.error = null; },
    clearAssessmentSuccess: (state) => { state.success = null; },
    clearCurrentAssessment: (state) => {
      state.activeAssessment = null;
      state.currentResult = null;
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAssessments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessments.fulfilled, (state, action) => {
        state.loading = false;
        state.assessments = action.payload;
      })
      .addCase(fetchAssessments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load assessments.';
      })
      .addCase(fetchAssessment.pending, (state) => {
        state.loadingAssessment = true;
        state.activeAssessment = null;
        state.currentResult = null;
        state.error = null;
      })
      .addCase(fetchAssessment.fulfilled, (state, action) => {
        state.loadingAssessment = false;
        state.activeAssessment = action.payload;
      })
      .addCase(fetchAssessment.rejected, (state, action) => {
        state.loadingAssessment = false;
        state.error = action.payload || 'Unable to open this assessment.';
      })
      .addCase(fetchAssessmentResults.pending, (state) => {
        state.loadingResults = true;
      })
      .addCase(fetchAssessmentResults.fulfilled, (state, action) => {
        state.loadingResults = false;
        state.results = action.payload;
      })
      .addCase(fetchAssessmentResults.rejected, (state, action) => {
        state.loadingResults = false;
        state.error = action.payload || 'Unable to load your assessment history.';
      })
      .addCase(fetchAssessmentResult.pending, (state) => {
        state.loadingReview = true;
        state.error = null;
      })
      .addCase(fetchAssessmentResult.fulfilled, (state, action) => {
        state.loadingReview = false;
        state.currentResult = action.payload;
        state.activeAssessment = null;
      })
      .addCase(fetchAssessmentResult.rejected, (state, action) => {
        state.loadingReview = false;
        state.error = action.payload || 'Unable to load this assessment result.';
      })
      .addCase(submitAssessment.pending, (state) => {
        state.submitting = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitAssessment.fulfilled, (state, action) => {
        state.submitting = false;
        state.currentResult = action.payload;
        state.success = 'Your assessment has been scored and saved.';
        state.results = [
          action.payload,
          ...state.results.filter((result) => result.id !== action.payload.id),
        ].slice(0, 20);
      })
      .addCase(submitAssessment.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload || 'Unable to submit your assessment.';
      })
      .addMatcher(
        (action) => [
          'auth/logout',
          'auth/login/fulfilled',
          'auth/register/fulfilled',
          'auth/fetchCurrentUser/rejected',
        ].includes(action.type),
        () => initialState
      );
  },
});

export const { clearAssessmentError, clearAssessmentSuccess, clearCurrentAssessment } = assessmentSlice.actions;
export default assessmentSlice.reducer;
