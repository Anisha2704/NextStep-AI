import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { evaluatePlacementReadiness, getPlacementReadiness } from '../../services/placementService.js';
import { getErrorMessage } from '../../utils/index.js';

const initialState = { readiness: null, loading: false, evaluating: false, hasLoaded: false, error: null };

const createRequest = (type, request) => createAsyncThunk(type, async (_, { rejectWithValue }) => {
  try { return await request(); } catch (error) { return rejectWithValue(getErrorMessage(error)); }
});

export const fetchPlacementReadiness = createRequest('placement/fetchReadiness', getPlacementReadiness);
export const evaluateReadiness = createRequest('placement/evaluateReadiness', evaluatePlacementReadiness);

const placementSlice = createSlice({
  name: 'placement',
  initialState,
  reducers: { clearPlacementError: (state) => { state.error = null; } },
  extraReducers: (builder) => builder
    .addCase(fetchPlacementReadiness.pending, (state) => { state.loading = true; state.error = null; })
    .addCase(fetchPlacementReadiness.fulfilled, (state, action) => {
      state.loading = false;
      state.hasLoaded = true;
      state.readiness = action.payload;
    })
    .addCase(fetchPlacementReadiness.rejected, (state, action) => {
      state.loading = false;
      state.hasLoaded = true;
      state.error = action.payload || 'Unable to load placement readiness.';
    })
    .addCase(evaluateReadiness.pending, (state) => { state.evaluating = true; state.error = null; })
    .addCase(evaluateReadiness.fulfilled, (state, action) => {
      state.evaluating = false;
      state.readiness = action.payload;
      state.hasLoaded = true;
    })
    .addCase(evaluateReadiness.rejected, (state, action) => {
      state.evaluating = false;
      state.error = action.payload || 'Unable to evaluate placement readiness.';
    })
    .addMatcher((action) => [
      'auth/logout', 'auth/login/fulfilled', 'auth/register/fulfilled', 'auth/fetchCurrentUser/rejected',
    ].includes(action.type), () => initialState),
});

export const { clearPlacementError } = placementSlice.actions;
export default placementSlice.reducer;
