import axios from "axios";

const fallbackPort = import.meta.env.VITE_API_PORT || "8001";

const inferredBackendHost =
  typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.hostname}:${fallbackPort}`
    : `http://127.0.0.1:${fallbackPort}`;

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || inferredBackendHost,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.detail || error.message || "Request failed";
    return Promise.reject(new Error(message));
  }
);

export const signupUser = async (data) => {
  const res = await apiClient.post("/auth/signup", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await apiClient.post("/auth/login", data);
  return res.data;
};

export const fetchUsers = async () => {
  const res = await apiClient.get("/users");
  return res.data;
};

export const fetchLawyers = async (params = {}) => {
  const res = await apiClient.get("/lawyers", { params });
  return res.data;
};

export const fetchLawyerById = async (id) => {
  const res = await apiClient.get(`/lawyers/${id}`);
  return res.data;
};

export const upsertLawyerProfile = async (payload) => {
  const res = await apiClient.post("/lawyers/profile", payload);
  return res.data;
};

export const createBooking = async (data) => {
  const res = await apiClient.post("/bookings", data);
  return res.data;
};

export const createBookingRequest = async (data) => {
  const res = await apiClient.post("/booking-requests", data);
  return res.data;
};

export const fetchLawyerRequests = async (lawyerId) => {
  const res = await apiClient.get(`/booking-requests/lawyer/${lawyerId}`);
  return res.data;
};

export const fetchUserRequests = async (userId) => {
  const res = await apiClient.get(`/booking-requests/user/${userId}`);
  return res.data;
};

export const updateBookingRequestStatus = async (requestId, status) => {
  const res = await apiClient.put(`/booking-requests/${requestId}/status`, { status });
  return res.data;
};

export const fetchUserBookings = async (userId) => {
  const res = await apiClient.get(`/bookings/user/${userId}`);
  return res.data;
};

export const fetchLawyerBookings = async (lawyerId) => {
  const res = await apiClient.get(`/bookings/lawyer/${lawyerId}`);
  return res.data;
};

export const createReview = async (data) => {
  const res = await apiClient.post("/reviews", data);
  return res.data;
};

export const fetchLawyerReviews = async (lawyerId) => {
  const res = await apiClient.get(`/reviews/lawyer/${lawyerId}`);
  return res.data;
};

export const fetchUserReviews = async (userId) => {
  const res = await apiClient.get(`/reviews/user/${userId}`);
  return res.data;
};

export const sendChatMessage = async (payload) => {
  const res = await apiClient.post("/chat", payload);
  return res.data;
};

export const fetchChatSessions = async (userId) => {
  const res = await apiClient.get(`/chat/sessions/${userId}`);
  return res.data;
};

export const fetchChatSessionMessages = async (sessionId) => {
  const res = await apiClient.get(`/chat/session/${sessionId}`);
  return res.data;
};

export const fetchChatHistory = async (userId) => {
  const res = await apiClient.get(`/chat/history/${userId}`);
  return res.data;
};

export const uploadChatFile = async (formData) => {
  const res = await apiClient.post("/chat/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return res.data;
};

// --- Admin API ---
export const fetchAdminStats = async () => {
  const res = await apiClient.get("/admin/stats");
  return res.data;
};

export const fetchAdminUsers = async () => {
  const res = await apiClient.get("/admin/users");
  return res.data;
};

export const fetchAdminAdvocates = async () => {
  const res = await apiClient.get("/admin/advocates");
  return res.data;
};

export const fetchAdminBookings = async () => {
  const res = await apiClient.get("/admin/bookings");
  return res.data;
};

export const fetchAdminBookingRequests = async () => {
  const res = await apiClient.get("/admin/booking-requests");
  return res.data;
};

export const deleteAdminUser = async (userId) => {
  await apiClient.delete(`/admin/users/${userId}`);
};

export const deleteAdminAdvocate = async (advocateId) => {
  await apiClient.delete(`/admin/advocates/${advocateId}`);
};

export default apiClient;
