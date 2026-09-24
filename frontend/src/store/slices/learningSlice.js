import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  generateLearningRoadmap as generateRoadmapApi,
  getLearningRoadmap,
  getRoadmapReadiness,
  updateLearningMilestone,
} from '../../services/learningService.js';
import { getErrorMessage } from '../../utils/index.js';

const initialState = {
  roadmap: null,
  readiness: null,
  loading: false,
  readinessLoading: false,
  generating: false,
  updatingMilestoneId: null,
  error: null,
  success: null,
};

export const fetchLearningRoadmap = createAsyncThunk(
  'learning/fetchRoadmap',
  async (_, { rejectWithValue }) => {
    try {
      return await getLearningRoadmap();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRoadmapReadiness = createAsyncThunk(
  'learning/fetchReadiness',
  async (_, { rejectWithValue }) => {
    try {
      return await getRoadmapReadiness();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const generateRoadmap = createAsyncThunk(
  'learning/generateRoadmap',
  async (confirmRegeneration = false, { rejectWithValue }) => {
    try {
      return await generateRoadmapApi(confirmRegeneration);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateMilestone = createAsyncThunk(
  'learning/updateMilestone',
  async (milestone, { rejectWithValue }) => {
    try {
      return await updateLearningMilestone(milestone);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const learningSlice = createSlice({
  name: 'learning',
  initialState,
  reducers: {
    clearLearningError: (state) => { state.error = null; },
    clearLearningSuccess: (state) => { state.success = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLearningRoadmap.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLearningRoadmap.fulfilled, (state, action) => {
        state.loading = false;
        state.roadmap = action.payload;
      })
      .addCase(fetchLearningRoadmap.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to load your learning roadmap.';
      })
      .addCase(fetchRoadmapReadiness.pending, (state) => {
        state.readinessLoading = true;
      })
      .addCase(fetchRoadmapReadiness.fulfilled, (state, action) => {
        state.readinessLoading = false;
        state.readiness = action.payload;
      })
      .addCase(fetchRoadmapReadiness.rejected, (state, action) => {
        state.readinessLoading = false;
        state.error = action.payload || 'Unable to check roadmap prerequisites.';
      })
      .addCase(generateRoadmap.pending, (state) => {
        state.generating = true;
        state.error = null;
        state.success = null;
      })
      .addCase(generateRoadmap.fulfilled, (state, action) => {
        state.generating = false;
        state.roadmap = action.payload;
        state.success = action.payload.generationSource === 'skill_gap_fallback'
          ? 'Gemini is rate-limited, so your roadmap was created from your saved Skill Gap Analysis.'
          : 'Your personalized roadmap is ready.';
      })
      .addCase(generateRoadmap.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload || 'Unable to generate your roadmap.';
      })
      .addCase(updateMilestone.pending, (state, action) => {
        state.updatingMilestoneId = action.meta.arg.milestoneId;
        state.error = null;
        state.success = null;
      })
      .addCase(updateMilestone.fulfilled, (state, action) => {
        state.updatingMilestoneId = null;
        state.roadmap = action.payload;
        state.success = 'Milestone progress saved.';
      })
      .addCase(updateMilestone.rejected, (state, action) => {
        state.updatingMilestoneId = null;
        state.error = action.payload || 'Unable to update milestone progress.';
      });
  },
});

export const { clearLearningError, clearLearningSuccess } = learningSlice.actions;
export default learningSlice.reducer;
