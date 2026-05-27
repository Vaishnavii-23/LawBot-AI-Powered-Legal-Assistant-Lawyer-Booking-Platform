import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchLawyers, upsertLawyerProfile } from "../../lib/apiClient.js";

export const fetchLawyerProfile = createAsyncThunk(
  "lawyerProfile/fetch",
  async (userId) => {
    const response = await fetchLawyers({ user_id: userId, page_size: 10 });
    const items = Array.isArray(response)
      ? response
      : response?.items || response?.results || [];
    return items.find((item) => item.user_id === userId) || null;
  }
);

export const saveLawyerProfile = createAsyncThunk(
  "lawyerProfile/save",
  async (payload) => {
    const response = await upsertLawyerProfile(payload);
    return response;
  }
);

const lawyerProfileSlice = createSlice({
  name: "lawyerProfile",
  initialState: {
    profile: null,
    loading: false,
    error: null,
    saving: false,
    saveError: null,
  },
  reducers: {
    clearLawyerProfileState: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
      state.saving = false;
      state.saveError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLawyerProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLawyerProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(fetchLawyerProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Unable to load profile";
      })
      .addCase(saveLawyerProfile.pending, (state) => {
        state.saving = true;
        state.saveError = null;
      })
      .addCase(saveLawyerProfile.fulfilled, (state, action) => {
        state.saving = false;
        state.profile = action.payload;
      })
      .addCase(saveLawyerProfile.rejected, (state, action) => {
        state.saving = false;
        state.saveError = action.error?.message || "Unable to save profile";
      });
  },
});

export const { clearLawyerProfileState } = lawyerProfileSlice.actions;
export default lawyerProfileSlice.reducer;
