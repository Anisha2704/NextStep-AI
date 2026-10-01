import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { fetchRecommendations, fetchFullRecommendations } from '../../services/recommendationService';

// ─── Async Thunks ────────────────────────────────────────────────────────────

export const loadRecommendations = createAsyncThunk(
  'recommendations/load',
  async ({ forceRefresh = false } = {}, { rejectWithValue }) => {
    try {
      const data = await fetchRecommendations(forceRefresh);
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load recommendations.';
      return rejectWithValue(message);
    }
  }
);

export const loadFullRecommendations = createAsyncThunk(
  'recommendations/loadFull',
  async (_, { rejectWithValue }) => {
    try {
      const data = await fetchFullRecommendations();
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to load full recommendations.';
      return rejectWithValue(message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const initialState = {
  // DB-bound course/cert recommendations
  data: null,
  loading: false,
  refreshing: false,
  error: null,
  cooldownRemaining: null,
  // AI full recommendations (jobs + real courses + real certs)
  fullData: null,
  fullLoading: false,
  fullError: null,
};

const recommendationSlice = createSlice({
  name: 'recommendations',
  initialState,
  reducers: {
    clearRecommendationError(state) {
      state.error = null;
    },
    clearCooldown(state) {
      state.cooldownRemaining = null;
    },
    clearFullError(state) {
      state.fullError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // DB-bound recommendations
      .addCase(loadRecommendations.pending, (state, action) => {
        const isRefresh = action.meta.arg?.forceRefresh === true;
        if (isRefresh) {
          state.refreshing = true;
        } else {
          state.loading = true;
        }
        state.error = null;
        state.cooldownRemaining = null;
      })
      .addCase(loadRecommendations.fulfilled, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        const payload = action.payload;
        if (payload?.cooldownRemaining) {
          state.cooldownRemaining = payload.cooldownRemaining;
          if (payload.courseRecommendations?.length || payload.certificationRecommendations?.length) {
            state.data = payload;
          }
        } else {
          state.data = payload;
          state.cooldownRemaining = null;
        }
      })
      .addCase(loadRecommendations.rejected, (state, action) => {
        state.loading = false;
        state.refreshing = false;
        state.error = action.payload || 'Unexpected error';
      })
      // Full AI recommendations (jobs + courses + certs)
      .addCase(loadFullRecommendations.pending, (state) => {
        state.fullLoading = true;
        state.fullError = null;
      })
      .addCase(loadFullRecommendations.fulfilled, (state, action) => {
        state.fullLoading = false;
        state.fullData = action.payload;
      })
      .addCase(loadFullRecommendations.rejected, (state, action) => {
        state.fullLoading = false;
        state.fullError = action.payload || 'Unexpected error';
      });
  },
});

export const { clearRecommendationError, clearCooldown, clearFullError } = recommendationSlice.actions;
export default recommendationSlice.reducer;
