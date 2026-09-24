import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getProfile, updateProfile, createProfile } from '../../services/userService';
import { getErrorMessage } from '../../utils';

const initialState = {
  profile: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchProfile = createAsyncThunk(
  'user/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getProfile();
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

export const saveProfile = createAsyncThunk(
  'user/saveProfile',
  async (profileData, { rejectWithValue, getState }) => {
    try {
      const existingProfile = getState().user.profile;
      let response;
      if (existingProfile && existingProfile.profileInitialized === false) {
        try {
          response = await createProfile(profileData);
        } catch (error) {
          if (error.response?.status !== 409) throw error;
          response = await updateProfile(profileData);
        }
      } else {
        response = await updateProfile(profileData);
      }
      return response.user;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearProfileError: (state) => {
      state.error = null;
    },
    updateLocalProfile: (state, action) => {
      state.profile = { ...state.profile, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveProfile.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
      })
      .addCase(saveProfile.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      });
  },
});

export const { clearProfileError, updateLocalProfile } = userSlice.actions;
export default userSlice.reducer;
