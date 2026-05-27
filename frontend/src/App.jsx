import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AuthenticatedLayout from "./components/AuthenticatedLayout.jsx";
import About from "./pages/About.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Contact from "./pages/Contact.jsx";
import Home from "./pages/Home.jsx";
import LawyerDashboard from "./pages/LawyerDashboard.jsx";
import LawyerDetail from "./pages/LawyerDetail.jsx";
import LawyersDirectory from "./pages/LawyersDirectory.jsx";
import LawyerProfile from "./pages/LawyerProfile.jsx";
import LawyerBookings from "./pages/LawyerBookings.jsx";
import LawyerReviews from "./pages/LawyerReviews.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Register from "./pages/Register.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminAdvocates from "./pages/AdminAdvocates.jsx";
import AdminBookings from "./pages/AdminBookings.jsx";
import AdminAnalytics from "./pages/AdminAnalytics.jsx";
import AdminSettings from "./pages/AdminSettings.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";
import UserBookings from "./pages/UserBookings.jsx";

const App = () => {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith("/chat");
  const isRegisterRoute = location.pathname.startsWith("/register");
  const isAuthenticatedRoute = location.pathname.startsWith("/chat") || 
                               location.pathname.startsWith("/lawyers") ||
                               location.pathname.startsWith("/user/") ||
                               location.pathname.startsWith("/lawyer/") ||
                               location.pathname.startsWith("/admin/");

  return (
    <div className="flex min-h-screen flex-col">
      {!isAuthenticatedRoute && <Navbar />}
      <main className={`flex-1 ${isChatRoute ? "min-h-screen" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Authenticated routes with sidebar */}
          <Route path="/lawyers" element={
            <AuthenticatedLayout>
              <LawyersDirectory />
            </AuthenticatedLayout>
          } />
          <Route path="/lawyers/:id" element={
            <AuthenticatedLayout>
              <LawyerDetail />
            </AuthenticatedLayout>
          } />
          <Route path="/chat" element={
            <AuthenticatedLayout>
              <ChatPage />
            </AuthenticatedLayout>
          } />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <AuthenticatedLayout>
                  <UserDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/dashboard"
            element={
              <ProtectedRoute requiredRole="lawyer">
                <AuthenticatedLayout>
                  <LawyerDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/profile"
            element={
              <ProtectedRoute requiredRole="lawyer">
                <AuthenticatedLayout>
                  <LawyerProfile />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/bookings"
            element={
              <ProtectedRoute requiredRole="lawyer">
                <AuthenticatedLayout>
                  <LawyerBookings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/reviews"
            element={
              <ProtectedRoute requiredRole="lawyer">
                <AuthenticatedLayout>
                  <LawyerReviews />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <AdminDashboard />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <AdminUsers />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/advocates"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <AdminAdvocates />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <AdminBookings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <AdminAnalytics />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute requiredRole="admin">
                <AuthenticatedLayout>
                  <AdminSettings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/user/bookings"
            element={
              <ProtectedRoute requiredRole="user">
                <AuthenticatedLayout>
                  <UserBookings />
                </AuthenticatedLayout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isChatRoute && !isRegisterRoute && !isAuthenticatedRoute && <Footer />}
    </div>
  );
};

export default App;
