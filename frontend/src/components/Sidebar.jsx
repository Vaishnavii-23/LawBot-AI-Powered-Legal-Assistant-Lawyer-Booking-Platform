import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { 
  LayoutDashboard, 
  MessageCircle, 
  Users, 
  Calendar, 
  User, 
  Star,
  LogOut,
  Settings,
  BarChart3
} from "lucide-react";

const Sidebar = ({ sidebarOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const userMenuItems = [
    { path: "/user/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/chat", label: "Chat with AI", icon: MessageCircle },
    { path: "/lawyers", label: "Find Advocates", icon: Users },
    { path: "/user/bookings", label: "My Bookings", icon: Calendar },
    { path: "/user/settings", label: "Settings", icon: Settings },
  ];

  const lawyerMenuItems = [
    { path: "/lawyer/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/lawyer/profile", label: "My Profile", icon: User },
    { path: "/lawyer/bookings", label: "My Bookings", icon: Calendar },
    { path: "/lawyer/reviews", label: "Reviews", icon: Star },
    { path: "/lawyer/settings", label: "Settings", icon: Settings },
  ];

  const adminMenuItems = [
    { path: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/users", label: "Manage Users", icon: Users },
    { path: "/admin/advocates", label: "Manage Advocates", icon: User },
    { path: "/admin/bookings", label: "All Bookings", icon: Calendar },
    { path: "/admin/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const menuItems = user?.role === "lawyer" ? lawyerMenuItems : user?.role === "admin" ? adminMenuItems : userMenuItems;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleProfileClick = () => {
    if (user?.role === "lawyer") {
      navigate("/lawyer/profile");
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-brand-600 via-brand-650 to-brand-700 shadow-xl z-50 flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-20"
      }`}
      aria-label="Sidebar"
    >
      <div className={`flex items-center border-b border-white/10 ${sidebarOpen ? "gap-3 px-5 py-5" : "justify-center px-3 py-5"}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className={`flex items-center justify-center rounded-lg bg-white/15 text-white font-bold border border-white/20 ${
            sidebarOpen ? "h-10 w-10 text-sm" : "h-10 w-10 text-sm"
          }`}>
            LB
          </div>
          {sidebarOpen && <span className="text-base font-semibold text-white">LawBot</span>}
        </Link>
      </div>

      {/* Navigation Items */}
      <nav
        className={`flex-1 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-500 scrollbar-track-brand-600 ${
          sidebarOpen ? "px-3 py-6 pr-2" : "px-2 py-6"
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center rounded-lg py-3 text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white/20 text-white shadow-lg shadow-black/20 backdrop-blur-sm scale-105"
                  : "text-brand-100 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-black/10"
              } ${sidebarOpen ? "gap-3.5 px-4" : "justify-center px-3"}`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon size={19} />
              </div>
              {sidebarOpen && <span className="transition-all duration-200">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-brand-500/30 via-brand-400/50 to-brand-500/30" />

      {/* Profile Section */}
      <div className={`space-y-3 ${sidebarOpen ? "p-4" : "p-3"}`}>
        <button
          type="button"
          onClick={handleProfileClick}
          className={`flex items-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/10 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 ${
            user?.role === "lawyer" ? "cursor-pointer hover:bg-white/20" : "cursor-default"
          } ${
            sidebarOpen ? "gap-3 p-4" : "justify-center p-3"
          }`}
          aria-label="Open profile"
        >
          <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/10 text-white font-bold border border-white/20 flex-shrink-0 ${
            sidebarOpen ? "h-12 w-12" : "h-10 w-10"
          }`}>
            <User size={22} />
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{user?.full_name || user?.email}</p>
              <p className="text-xs text-brand-200 capitalize font-medium">{user?.role}</p>
            </div>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex w-full items-center justify-center rounded-lg text-sm font-medium text-brand-100 transition-all duration-200 hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-black/20 border border-transparent hover:border-white/20 group ${
            sidebarOpen ? "gap-2.5 px-4 py-3" : "px-3 py-3"
          }`}
          aria-label="Logout"
        >
          <LogOut size={18} className={`transition-transform duration-200 ${sidebarOpen ? "group-hover:translate-x-1" : ""}`} />
          {sidebarOpen && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
