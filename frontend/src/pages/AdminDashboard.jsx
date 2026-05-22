import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  Users,
  BarChart3,
  AlertCircle,
  TrendingUp,
  Trash2,
  RefreshCw,
  Calendar,
} from "lucide-react";
import {
  fetchAdminStats,
  fetchAdminUsers,
  fetchAdminAdvocates,
  deleteAdminUser,
  deleteAdminAdvocate,
} from "../lib/apiClient.js";

// ------ Skeleton loader ------
const Skeleton = ({ className = "" }) => (
  <div className={`animate-pulse rounded bg-slate-200 ${className}`} />
);

// ------ Stat card ------
const StatCard = ({ label, value, icon: Icon, color, loading }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft flex flex-col gap-4">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {loading ? (
          <Skeleton className="mt-2 h-9 w-20" />
        ) : (
          <p className="mt-2 text-3xl font-bold text-slate-900">{value ?? "—"}</p>
        )}
      </div>
      <div className={`rounded-xl p-3 ${color}`}>
        <Icon size={22} />
      </div>
    </div>
    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${color.replace("bg-", "bg-").replace(/text-\S+/, "")} opacity-60 transition-all duration-700`}
        style={{ width: loading ? "20%" : "100%" }}
      />
    </div>
  </div>
);

// ------ User/Advocate row ------
const PersonRow = ({ person, roleLabel, accentClass, onDelete, loading }) => (
  <div className="flex items-center justify-between rounded-xl bg-slate-50 hover:bg-slate-100 transition px-3 py-2.5">
    <div className="flex items-center gap-3">
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${accentClass} text-sm font-bold`}
      >
        {(person.full_name || person.email)?.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">
          {person.full_name || "—"}
        </p>
        <p className="text-xs text-slate-500 truncate">{person.email}</p>
      </div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
      <span className="text-xs font-medium capitalize bg-green-50 text-green-700 border border-green-100 px-2 py-0.5 rounded-full">
        {roleLabel}
      </span>
      <button
        onClick={() => onDelete(person.id)}
        className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        title={`Delete ${roleLabel}`}
        aria-label={`Delete ${person.email}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);

// ------ Main component ------
const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [advocates, setAdvocates] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingAdvocates, setLoadingAdvocates] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshed, setLastRefreshed] = useState(null);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const data = await fetchAdminStats();
      setStats(data);
    } catch (err) {
      setError("Failed to load platform stats.");
    } finally {
      setLoadingStats(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch {
      // silent — stats covers overall error
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadAdvocates = async () => {
    setLoadingAdvocates(true);
    try {
      const data = await fetchAdminAdvocates();
      setAdvocates(data);
    } catch {
      // silent
    } finally {
      setLoadingAdvocates(false);
    }
  };

  const refreshAll = () => {
    setError(null);
    loadStats();
    loadUsers();
    loadAdvocates();
    setLastRefreshed(new Date());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user? This action cannot be undone.")) return;
    try {
      await deleteAdminUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setStats((prev) => prev ? { ...prev, total_users: prev.total_users - 1 } : prev);
    } catch {
      alert("Could not delete user. Please try again.");
    }
  };

  const handleDeleteAdvocate = async (id) => {
    if (!window.confirm("Delete this advocate? This action cannot be undone.")) return;
    try {
      await deleteAdminAdvocate(id);
      setAdvocates((prev) => prev.filter((a) => a.id !== id));
      setStats((prev) => prev ? { ...prev, total_advocates: prev.total_advocates - 1 } : prev);
    } catch {
      alert("Could not delete advocate. Please try again.");
    }
  };

  const statCards = [
    {
      label: "Total Users",
      value: stats?.total_users,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Advocates",
      value: stats?.total_advocates,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Bookings",
      value: stats?.total_bookings,
      icon: Calendar,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Pending Requests",
      value: stats?.pending_requests,
      icon: AlertCircle,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-slate-500">
            Welcome back,{" "}
            <span className="font-semibold text-slate-700">
              {user?.full_name || user?.email}
            </span>
            . Here's your live platform overview.
          </p>
        </div>
        <button
          id="admin-refresh-btn"
          onClick={refreshAll}
          className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 hover:text-brand-600 transition-colors"
        >
          <RefreshCw size={15} className={loadingStats ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => (
          <StatCard key={s.label} {...s} loading={loadingStats} />
        ))}
      </div>

      {/* Users & Advocates */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Users</h2>
            <span className="text-xs text-slate-400 tabular-nums">{users.length} total</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loadingUsers ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-44" />
                  </div>
                </div>
              ))
            ) : users.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No users found.</p>
            ) : (
              users.slice(0, 10).map((u) => (
                <PersonRow
                  key={u.id}
                  person={u}
                  roleLabel="user"
                  accentClass="bg-blue-100 text-blue-600"
                  onDelete={handleDeleteUser}
                />
              ))
            )}
          </div>
          <button
            id="admin-view-all-users-btn"
            onClick={() => navigate("/admin/users")}
            className="mt-4 w-full rounded-xl bg-blue-50 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
          >
            View All Users
          </button>
        </div>

        {/* Recent Advocates */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Advocates</h2>
            <span className="text-xs text-slate-400 tabular-nums">{advocates.length} total</span>
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {loadingAdvocates ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-2.5 w-44" />
                  </div>
                </div>
              ))
            ) : advocates.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No advocates found.</p>
            ) : (
              advocates.slice(0, 10).map((a) => (
                <PersonRow
                  key={a.id}
                  person={a}
                  roleLabel="advocate"
                  accentClass="bg-purple-100 text-purple-600"
                  onDelete={handleDeleteAdvocate}
                />
              ))
            )}
          </div>
          <button
            id="admin-view-all-advocates-btn"
            onClick={() => navigate("/admin/advocates")}
            className="mt-4 w-full rounded-xl bg-purple-50 px-4 py-2 text-sm font-medium text-purple-600 hover:bg-purple-100 transition"
          >
            View All Advocates
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-base font-semibold text-slate-900 mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            id="admin-action-users"
            onClick={() => navigate("/admin/users")}
            className="rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-600 hover:bg-blue-100 transition"
          >
            Manage Users
          </button>
          <button
            id="admin-action-advocates"
            onClick={() => navigate("/admin/advocates")}
            className="rounded-xl bg-green-50 px-4 py-3 text-sm font-medium text-green-600 hover:bg-green-100 transition"
          >
            Manage Advocates
          </button>
          <button
            id="admin-action-bookings"
            onClick={() => navigate("/admin/bookings")}
            className="rounded-xl bg-purple-50 px-4 py-3 text-sm font-medium text-purple-600 hover:bg-purple-100 transition"
          >
            All Bookings
          </button>
          <button
            id="admin-action-analytics"
            onClick={() => navigate("/admin/analytics")}
            className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-600 hover:bg-amber-100 transition"
          >
            Analytics
          </button>
        </div>
      </div>

      {lastRefreshed && (
        <p className="text-xs text-slate-400 text-right">
          Last refreshed: {lastRefreshed.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
};

export default AdminDashboard;
