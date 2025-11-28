import { Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/Footer.jsx";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import About from "./pages/About.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Contact from "./pages/Contact.jsx";
import Home from "./pages/Home.jsx";
import LawyerDashboard from "./pages/LawyerDashboard.jsx";
import LawyerDetail from "./pages/LawyerDetail.jsx";
import LawyersDirectory from "./pages/LawyersDirectory.jsx";
import Login from "./pages/Login.jsx";
import NotFound from "./pages/NotFound.jsx";
import Register from "./pages/Register.jsx";
import UserDashboard from "./pages/UserDashboard.jsx";

const App = () => {
  const location = useLocation();
  const isChatRoute = location.pathname.startsWith("/chat");
  const isRegisterRoute = location.pathname.startsWith("/register");

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={`flex-1 ${isChatRoute ? "min-h-screen" : ""}`}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/lawyers" element={<LawyersDirectory />} />
          <Route path="/lawyers/:id" element={<LawyerDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route
            path="/user/dashboard"
            element={
              <ProtectedRoute requiredRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lawyer/dashboard"
            element={
              <ProtectedRoute requiredRole="lawyer">
                <LawyerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isChatRoute && !isRegisterRoute ? <Footer /> : null}
    </div>
  );
};

export default App;
