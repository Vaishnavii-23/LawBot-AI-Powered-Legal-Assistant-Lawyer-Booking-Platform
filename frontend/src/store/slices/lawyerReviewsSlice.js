import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchLawyerReviews } from "../../lib/apiClient.js";

export const loadLawyerReviews = createAsyncThunk(
  "lawyerReviews/load",
  async (lawyerId) => {
    const response = await fetchLawyerReviews(lawyerId);
    return Array.isArray(response) ? response : response?.items || [];
  }
);

const lawyerReviewsSlice = createSlice({
  name: "lawyerReviews",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearLawyerReviews: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLawyerReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLawyerReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadLawyerReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Unable to load reviews";
      });
  },
});

export const { clearLawyerReviews } = lawyerReviewsSlice.actions;
export default lawyerReviewsSlice.reducer;
