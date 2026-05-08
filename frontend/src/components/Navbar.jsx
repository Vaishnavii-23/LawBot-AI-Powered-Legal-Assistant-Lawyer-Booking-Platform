import { useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Menu, X, Bell, Search } from "lucide-react";

const Navbar = ({ sidebarOpen, setSidebarOpen }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if user is on a dashboard page
  const isDashboardPage = location.pathname.startsWith("/user/dashboard") || location.pathname.startsWith("/lawyer/dashboard");

  // Only show navigation items on landing page (not authenticated)
  const shouldShowNavItems = !isAuthenticated;

  const navItems = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/contact", label: "Contact" }
  ];

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className={`flex items-center justify-between px-4 py-2.5 sm:px-6 transition-all duration-300 ${isAuthenticated ? (sidebarOpen ? 'lg:ml-64' : 'lg:ml-0') : 'lg:px-8 mx-auto max-w-7xl'}`}>
        <Link to="/" className="flex items-center gap-2.5 flex-shrink-0">
          <span className={`flex items-center justify-center rounded-lg ${isAuthenticated ? 'h-9 w-9 text-lg' : 'h-10 w-10 text-2xl'} bg-gradient-to-br from-brand-100 to-brand-50 hover:shadow-md transition-shadow`}>
            ⚖️
          </span>
          {!isAuthenticated && <span className="hidden sm:inline text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-700 bg-clip-text text-transparent">LawBot</span>}
        </Link>

        {isAuthenticated && (
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex items-center justify-center p-2 ml-4 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all duration-200"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} className={`transition-transform duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`} />
          </button>
        )}

        {shouldShowNavItems && (
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex mx-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `transition-all duration-200 hover:text-brand-600 relative group ${isActive ? "text-brand-600 font-semibold" : ""}`
                }
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-600 transition-all duration-300 group-hover:w-full" />
              </NavLink>
            ))}
          </nav>
        )}

        <div className={`hidden items-center gap-4 lg:flex ${isAuthenticated ? 'ml-auto' : ''}`}>
          {isAuthenticated ? (
            <>
              <button className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                <Search size={18} />
              </button>
              <button className="p-2 text-slate-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors relative">
                <Bell size={18} />
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-2.5 rounded-lg hover:bg-slate-50 px-2.5 py-1.5 cursor-pointer transition-colors">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white text-xs font-semibold">
                  {(user?.full_name || user?.email)?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-900">{(user?.full_name || user?.email)?.split(' ')[0]}</span>
                  <span className="text-xs text-slate-500 capitalize">{user?.role}</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-600 transition-all hover:text-brand-600 hover:bg-brand-50 px-3 py-1.5 rounded-lg"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-700 px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-lg hover:shadow-brand-600/20"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-brand-600 hover:text-brand-600 lg:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <nav className="flex flex-col gap-1 px-4 py-3 text-sm font-medium text-slate-600">
            {shouldShowNavItems && navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${isActive ? "bg-brand-50 text-brand-700" : "hover:bg-slate-100"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2">
              {isAuthenticated ? (
                <>
                  <div className="rounded-lg bg-slate-100 px-3 py-2">
                    <p className="text-xs font-semibold">{user?.full_name || user?.email}</p>
                    <p className="text-xs uppercase tracking-wide text-brand-600">{user?.role}</p>
                  </div>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-center text-sm font-semibold text-slate-600"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white"
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
