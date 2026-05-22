import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    // Redirect the user to their appropriate dashboard if they access a route they shouldn't
    const getRedirectPath = (role) => {
      if (role === "admin") return "/admin/dashboard";
      if (role === "lawyer") return "/lawyer/dashboard";
      return "/user/dashboard";
    };
    return <Navigate to={getRedirectPath(user?.role)} replace />;
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
