import { useEffect, useMemo, useState } from "react";
import { RefreshCw } from "lucide-react";
import { fetchAdminBookings } from "../lib/apiClient.js";

const SkeletonRow = () => (
  <div className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded-full bg-slate-200" />
    </div>
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      <div className="h-2.5 w-32 rounded bg-slate-200" />
      <div className="h-2.5 w-28 rounded bg-slate-200" />
      <div className="h-2.5 w-40 rounded bg-slate-200" />
      <div className="h-2.5 w-28 rounded bg-slate-200" />
    </div>
  </div>
);

const AdminBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Unable to load bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadBookings();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return bookings.filter((booking) => {
      const statusMatch = statusFilter === "all" || booking.status === statusFilter;
      if (!statusMatch) return false;
      if (!value) return true;
      return [
        booking.id,
        booking.user_id,
        booking.lawyer_id,
        booking.date,
        booking.time,
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(value));
    });
  }, [bookings, query, statusFilter]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900">All Bookings</h1>
              <p className="mt-2 text-sm text-slate-500">Monitor platform-wide consultations in one place.</p>
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

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by booking, user, or lawyer ID"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100 sm:max-w-sm"
            />
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <span className="text-xs text-slate-400">{filtered.length} bookings</span>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <div className="mt-6 space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <SkeletonRow key={index} />)
            ) : filtered.length ? (
              filtered.map((booking) => (
                <div key={booking.id} className="rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">Booking #{booking.id}</p>
                    <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                      {booking.status || "pending"}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-2 text-slate-600 sm:grid-cols-2">
                    <p>User ID: {booking.user_id}</p>
                    <p>Lawyer ID: {booking.lawyer_id}</p>
                    <p>Date: {booking.date}</p>
                    <p>Time: {booking.time}</p>
                    <p>Request ID: {booking.booking_request_id || "—"}</p>
                    <p>Notes: {booking.notes || "—"}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                No bookings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBookings;
