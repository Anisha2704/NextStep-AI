import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getCareerRecommendations as fetchRecommendationsApi,
  analyzeSkillGap as analyzeSkillGapApi,
} from '../../services/aiService';
import { getErrorMessage } from '../../utils';

const initialState = {
  careerRecommendations: null,
  loading: false,
  error: null,
  skillGap: null,
  skillGapLoading: false,
  skillGapError: null,
};

export const getCareerRecommendations = createAsyncThunk(
  'ai/getCareerRecommendations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchRecommendationsApi();
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const analyzeSkillGap = createAsyncThunk(
  'ai/analyzeSkillGap',
  async (targetRole, { rejectWithValue }) => {
    try {
      const data = await analyzeSkillGapApi(targetRole);
      return data;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIError: (state) => {
      state.error = null;
    },
    clearSkillGapError: (state) => {
      state.skillGapError = null;
    },
    resetAIState: (state) => {
      state.careerRecommendations = null;
      state.error = null;
      state.loading = false;
      state.skillGap = null;
      state.skillGapError = null;
      state.skillGapLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Career Recommendations
      .addCase(getCareerRecommendations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCareerRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.careerRecommendations = action.payload;
      })
      .addCase(getCareerRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Unable to generate career guidance right now. Please try again.';
      })
      // Skill Gap Analysis
      .addCase(analyzeSkillGap.pending, (state) => {
        state.skillGapLoading = true;
        state.skillGapError = null;
      })
      .addCase(analyzeSkillGap.fulfilled, (state, action) => {
        state.skillGapLoading = false;
        state.skillGap = action.payload;
      })
      .addCase(analyzeSkillGap.rejected, (state, action) => {
        state.skillGapLoading = false;
        state.skillGapError = action.payload || 'Unable to analyze skill gap right now. Please try again.';
      });
  },
});

export const { clearAIError, clearSkillGapError, resetAIState } = aiSlice.actions;
export default aiSlice.reducer;
