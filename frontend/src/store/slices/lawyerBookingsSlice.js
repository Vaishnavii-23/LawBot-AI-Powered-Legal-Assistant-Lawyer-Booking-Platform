import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchLawyerBookings } from "../../lib/apiClient.js";

export const loadLawyerBookings = createAsyncThunk(
  "lawyerBookings/load",
  async (lawyerId) => {
    const response = await fetchLawyerBookings(lawyerId);
    return Array.isArray(response) ? response : response?.items || [];
  }
);

const lawyerBookingsSlice = createSlice({
  name: "lawyerBookings",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearLawyerBookings: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLawyerBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadLawyerBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadLawyerBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Unable to load bookings";
      });
  },
});

export const { clearLawyerBookings } = lawyerBookingsSlice.actions;
export default lawyerBookingsSlice.reducer;
