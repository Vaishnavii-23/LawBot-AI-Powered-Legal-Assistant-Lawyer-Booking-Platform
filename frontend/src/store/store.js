import { configureStore } from "@reduxjs/toolkit";
import lawyerProfileReducer from "./slices/lawyerProfileSlice.js";
import lawyerBookingsReducer from "./slices/lawyerBookingsSlice.js";
import lawyerReviewsReducer from "./slices/lawyerReviewsSlice.js";
import userBookingsReducer from "./slices/userBookingsSlice.js";

const store = configureStore({
  reducer: {
    lawyerProfile: lawyerProfileReducer,
    lawyerBookings: lawyerBookingsReducer,
    lawyerReviews: lawyerReviewsReducer,
    userBookings: userBookingsReducer,
  },
});

export default store;
