import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center text-center">
        <div className="rounded-3xl bg-white p-10 shadow-soft">
          <p className="text-xl font-semibold text-brand-600">Access denied</p>
          <p className="mt-2 text-slate-600">
            This area is reserved for {requiredRole === "lawyer" ? "lawyers" : "users"}. If you believe this is an error,
            please contact support.
          </p>
        </div>
      </div>
    );
  }

  if (children) {
    return children;
  }

  return <Outlet />;
};

export default ProtectedRoute;
