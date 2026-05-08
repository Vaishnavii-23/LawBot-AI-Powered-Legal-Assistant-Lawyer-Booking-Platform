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

  return (
    <aside className="fixed left-0 top-[56px] w-64 h-[calc(100vh-56px)] bg-gradient-to-b from-brand-600 via-brand-650 to-brand-700 shadow-xl z-30 flex flex-col overflow-hidden hover:shadow-2xl transition-shadow duration-300">
      {/* Navigation Items */}
      <nav className="flex-1 space-y-1.5 px-3 py-8 overflow-y-auto scrollbar-thin scrollbar-thumb-brand-500 scrollbar-track-brand-600 pr-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3.5 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-white/20 text-white shadow-lg shadow-black/20 backdrop-blur-sm scale-105"
                  : "text-brand-100 hover:bg-white/10 hover:text-white hover:shadow-lg hover:shadow-black/10"
              }`}
            >
              <div className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                <Icon size={19} />
              </div>
              <span className="transition-all duration-200">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-3 h-px bg-gradient-to-r from-brand-500/30 via-brand-400/50 to-brand-500/30" />

      {/* Profile Section */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/15 backdrop-blur-sm p-4 border border-white/10 hover:bg-white/20 transition-all duration-200 cursor-default hover:shadow-lg hover:shadow-black/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-white/30 to-white/10 text-white font-bold border border-white/20 flex-shrink-0">
            <User size={22} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{user?.full_name || user?.email}</p>
            <p className="text-xs text-brand-200 capitalize font-medium">{user?.role}</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2.5 rounded-lg px-4 py-3 text-sm font-medium text-brand-100 transition-all duration-200 hover:bg-white/15 hover:text-white hover:shadow-lg hover:shadow-black/20 border border-transparent hover:border-white/20 group"
        >
          <LogOut size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
