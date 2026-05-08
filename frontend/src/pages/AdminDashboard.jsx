import { useAuth } from "../contexts/AuthContext.jsx";
import { Users, BarChart3, AlertCircle } from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Total Users", value: "1,234", icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Active Advocates", value: "456", icon: Users, color: "bg-green-100 text-green-600" },
    { label: "Total Bookings", value: "789", icon: BarChart3, color: "bg-purple-100 text-purple-600" },
    { label: "Pending Requests", value: "23", icon: AlertCircle, color: "bg-yellow-100 text-yellow-600" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="mt-2 text-slate-600">Welcome back, {user?.full_name || user?.email}. Here's an overview of your platform.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Management Sections */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Recent Users</h2>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-600">
                    U{i}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">User {i}</p>
                    <p className="text-xs text-slate-600">user{i}@example.com</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">Active</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100 transition">
            View All Users
          </button>
        </div>

        {/* Recent Advocates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <h2 className="text-lg font-semibold text-slate-900">Recent Advocates</h2>
          <div className="mt-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-600">
                    A{i}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Advocate {i}</p>
                    <p className="text-xs text-slate-600">{i * 5} years experience</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Verified</span>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full rounded-lg bg-brand-50 px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-100 transition">
            View All Advocates
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button className="rounded-lg bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-100 transition">
            Add New User
          </button>
          <button className="rounded-lg bg-green-50 px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-100 transition">
            Add New Advocate
          </button>
          <button className="rounded-lg bg-purple-50 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-100 transition">
            Generate Report
          </button>
          <button className="rounded-lg bg-yellow-50 px-4 py-3 text-sm font-medium text-yellow-600 hover:bg-yellow-100 transition">
            Platform Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
