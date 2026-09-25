import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  analyzeResume as analyzeResumeApi,
  deleteResumeAnalysis as deleteResumeAnalysisApi,
  getResumeAnalyses,
  getResumeAnalysis,
} from '../../services/resumeService.js';
import { getErrorMessage } from '../../utils/index.js';

const initialState = {
  analyses: [],
  currentAnalysis: null,
  hasLoaded: false,
  loading: false,
  analyzing: false,
  loadingAnalysis: false,
  deleting: false,
  error: null,
  success: null,
};

const createRequest = (type, request) => createAsyncThunk(type, async (payload, { rejectWithValue }) => {
  try { return await request(payload); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const fetchResumeAnalyses = createRequest('resume/fetchAnalyses', getResumeAnalyses);
export const fetchResumeAnalysis = createRequest('resume/fetchAnalysis', getResumeAnalysis);
export const submitResumeAnalysis = createRequest('resume/analyze', analyzeResumeApi);
export const removeResumeAnalysis = createRequest('resume/deleteAnalysis', deleteResumeAnalysisApi);

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    clearResumeError: (state) => { state.error = null; },
    clearResumeSuccess: (state) => { state.success = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResumeAnalyses.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchResumeAnalyses.fulfilled, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.analyses = action.payload;
        if (!state.currentAnalysis && action.payload.length) state.currentAnalysis = action.payload[0];
      })
      .addCase(fetchResumeAnalyses.rejected, (state, action) => {
        state.loading = false;
        state.hasLoaded = true;
        state.error = action.payload || 'Unable to load resume analyses.';
      })
      .addCase(fetchResumeAnalysis.pending, (state) => { state.loadingAnalysis = true; state.error = null; })
      .addCase(fetchResumeAnalysis.fulfilled, (state, action) => {
        state.loadingAnalysis = false;
        state.currentAnalysis = action.payload;
      })
      .addCase(fetchResumeAnalysis.rejected, (state, action) => {
        state.loadingAnalysis = false;
        state.error = action.payload || 'Unable to load this resume analysis.';
      })
      .addCase(submitResumeAnalysis.pending, (state) => {
        state.analyzing = true;
        state.error = null;
        state.success = null;
      })
      .addCase(submitResumeAnalysis.fulfilled, (state, action) => {
        state.analyzing = false;
        state.currentAnalysis = action.payload;
        state.analyses = [action.payload, ...state.analyses.filter((item) => item.id !== action.payload.id)].slice(0, 20);
        state.success = 'Your resume analysis has been saved.';
      })
      .addCase(submitResumeAnalysis.rejected, (state, action) => {
        state.analyzing = false;
        state.error = action.payload || 'Unable to analyze this resume.';
      })
      .addCase(removeResumeAnalysis.pending, (state) => { state.deleting = true; state.error = null; })
      .addCase(removeResumeAnalysis.fulfilled, (state, action) => {
        state.deleting = false;
        state.analyses = state.analyses.filter((item) => item.id !== action.payload);
        if (state.currentAnalysis?.id === action.payload) state.currentAnalysis = state.analyses[0] || null;
        state.success = 'Resume analysis deleted.';
      })
      .addCase(removeResumeAnalysis.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload || 'Unable to delete this analysis.';
      })
      .addMatcher((action) => [
        'auth/logout', 'auth/login/fulfilled', 'auth/register/fulfilled', 'auth/fetchCurrentUser/rejected',
      ].includes(action.type), () => initialState);
  },
});

export const { clearResumeError, clearResumeSuccess } = resumeSlice.actions;
export default resumeSlice.reducer;
