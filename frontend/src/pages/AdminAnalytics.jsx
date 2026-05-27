import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Activity, Users, Calendar, AlertCircle } from "lucide-react";
import { fetchAdminBookingRequests, fetchAdminStats } from "../lib/apiClient.js";

const StatCard = ({ label, value, icon: Icon, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-slate-900">{value ?? "—"}</p>
      </div>
      <div className={`rounded-xl p-3 ${accent}`}>
        <Icon size={18} />
      </div>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, requestsRes] = await Promise.all([
        fetchAdminStats(),
        fetchAdminBookingRequests(),
      ]);
      setStats(statsRes);
      setRequests(Array.isArray(requestsRes) ? requestsRes : []);
    } catch (err) {
      setError(err.message || "Unable to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const statusBreakdown = useMemo(() => {
    const counts = { pending: 0, accepted: 0, rejected: 0, other: 0 };
    requests.forEach((item) => {
      const status = (item.status || "").toLowerCase();
      if (status === "pending") counts.pending += 1;
      else if (status === "accepted") counts.accepted += 1;
      else if (status === "rejected") counts.rejected += 1;
      else counts.other += 1;
    });
    return counts;
  }, [requests]);

  const recentRequests = useMemo(() => {
    const list = [...requests];
    return list
      .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
      .slice(0, 6);
  }, [requests]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">Analytics</h1>
              <p className="mt-2 text-sm text-slate-500">Key platform metrics and request activity.</p>
            </div>
            <button
              type="button"
              onClick={handleRefresh}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw size={15} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total users"
              value={stats?.total_users}
              icon={Users}
              accent="bg-blue-100 text-blue-600"
            />
            <StatCard
              label="Total advocates"
              value={stats?.total_advocates}
              icon={Users}
              accent="bg-purple-100 text-purple-600"
            />
            <StatCard
              label="Bookings"
              value={stats?.total_bookings}
              icon={Calendar}
              accent="bg-emerald-100 text-emerald-600"
            />
            <StatCard
              label="Pending requests"
              value={stats?.pending_requests}
              icon={AlertCircle}
              accent="bg-amber-100 text-amber-600"
            />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-sm font-semibold text-slate-700">Recent booking requests</h2>
              {loading ? (
                <p className="mt-4 text-sm text-slate-500">Loading requests…</p>
              ) : recentRequests.length ? (
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-semibold text-slate-900">Request #{request.id}</p>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {request.status || "pending"}
                        </span>
                      </div>
                      <div className="mt-2 grid gap-2 sm:grid-cols-2">
                        <p>User ID: {request.user_id}</p>
                        <p>Lawyer ID: {request.lawyer_id}</p>
                        <p>Date: {request.preferred_date || "—"}</p>
                        <p>Time: {request.preferred_time || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-slate-500">No booking requests found.</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-700">Request status breakdown</h2>
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span>Pending</span>
                  <span className="font-semibold text-slate-900">{statusBreakdown.pending}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span>Accepted</span>
                  <span className="font-semibold text-slate-900">{statusBreakdown.accepted}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span>Rejected</span>
                  <span className="font-semibold text-slate-900">{statusBreakdown.rejected}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white px-3 py-2">
                  <span>Other</span>
                  <span className="font-semibold text-slate-900">{statusBreakdown.other}</span>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-400">Refresh to keep status counts up to date.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
