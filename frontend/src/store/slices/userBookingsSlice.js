import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchUserBookings } from "../../lib/apiClient.js";

export const loadUserBookings = createAsyncThunk(
  "userBookings/load",
  async (userId) => {
    const response = await fetchUserBookings(userId);
    return Array.isArray(response) ? response : response?.items || [];
  }
);

const userBookingsSlice = createSlice({
  name: "userBookings",
  initialState: {
    items: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearUserBookings: (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error?.message || "Unable to load bookings";
      });
  },
});

export const { clearUserBookings } = userBookingsSlice.actions;
export default userBookingsSlice.reducer;
