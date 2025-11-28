import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const shouldShowFindLawyers = !isAuthenticated || user?.role !== "lawyer";
  const navItems = [
    { path: "/", label: "Home" },
    { path: "/chat", label: "Chat" },
    ...(shouldShowFindLawyers ? [{ path: "/lawyers", label: "Find Lawyers" }] : []),
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" }
  ];

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
  };

  const handleDashboardClick = () => {
    if (user?.role === "lawyer") {
      navigate("/lawyer/dashboard");
    } else {
      navigate("/user/dashboard");
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/40 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-2xl">⚖️</span>
          <span className="text-xl font-semibold text-slate-900">LawBot</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `transition-colors hover:text-brand-600 ${isActive ? "text-brand-600" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden items-center gap-4 lg:flex">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-900">{user?.full_name || user?.email}</span>
                  <span className="text-xs font-medium uppercase tracking-wide text-brand-600">{user?.role}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDashboardClick}
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 transition hover:text-brand-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:border-brand-600 hover:text-brand-600 lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>
      {menuOpen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-1 px-6 py-4 text-sm font-medium text-slate-600">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-3 py-2 transition ${isActive ? "bg-brand-50 text-brand-700" : "hover:bg-slate-100"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="rounded-xl bg-slate-100 px-3 py-2">
                    <p className="text-sm font-semibold">{user?.full_name || user?.email}</p>
                    <p className="text-xs uppercase tracking-wide text-brand-600">{user?.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDashboardClick}
                    className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
