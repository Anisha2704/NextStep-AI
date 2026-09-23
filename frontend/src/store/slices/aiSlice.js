import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCareerRecommendations as fetchRecommendationsApi } from '../../services/aiService';
import { getErrorMessage } from '../../utils';

const initialState = {
  careerRecommendations: null,
  loading: false,
  error: null,
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

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    clearAIError: (state) => {
      state.error = null;
    },
    resetAIState: (state) => {
      state.careerRecommendations = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export const { clearAIError, resetAIState } = aiSlice.actions;
export default aiSlice.reducer;
