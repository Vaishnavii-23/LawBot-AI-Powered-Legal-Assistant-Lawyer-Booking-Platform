import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, signupUser } from "../lib/apiClient.js";

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  initializing: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {}
});

const STORAGE_KEY = "lawbot_user";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
      } catch (error) {
        console.error("Failed to parse stored user", error);
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
    setInitializing(false);
  }, []);

  const handleAuthSuccess = useCallback(
    (account) => {
      setUser(account);
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(account));
      if (account.role === "lawyer") {
        navigate("/lawyer/dashboard", { replace: true });
      } else {
        navigate("/user/dashboard", { replace: true });
      }
    },
    [navigate]
  );

  const login = useCallback(
    async ({ email, role }) => {
      const account = await loginUser({ email, role });
      handleAuthSuccess(account);
      return account;
    },
    [handleAuthSuccess]
  );

  const signup = useCallback(
    async (payload) => {
      const account = await signupUser(payload);
      handleAuthSuccess(account);
      return account;
    },
    [handleAuthSuccess]
  );

  const logout = useCallback(() => {
    setUser(null);
    window.localStorage.removeItem(STORAGE_KEY);
    navigate("/", { replace: true });
  }, [navigate]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      initializing,
      login,
      signup,
      logout
    }),
    [user, initializing, login, signup, logout]
  );

  if (initializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-600">
        <div className="flex flex-col items-center gap-3">
          <span className="h-10 w-10 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <p className="text-sm font-medium">Preparing LawBot…</p>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
