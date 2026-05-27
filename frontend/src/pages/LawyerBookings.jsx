import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext.jsx";
import { fetchLawyerProfile } from "../store/slices/lawyerProfileSlice.js";
import { loadLawyerBookings } from "../store/slices/lawyerBookingsSlice.js";

const sortBookings = (items) => {
  const list = Array.isArray(items) ? [...items] : [];
  return list.sort((a, b) => {
    const aDate = new Date(`${a.date} ${a.time || "00:00"}`);
    const bDate = new Date(`${b.date} ${b.time || "00:00"}`);
    return aDate - bDate;
  });
};

const LawyerBookings = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.lawyerProfile);
  const { items, loading, error } = useSelector((state) => state.lawyerBookings);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLawyerProfile(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (profile?.id) {
      dispatch(loadLawyerBookings(profile.id));
    }
  }, [dispatch, profile?.id]);

  const sorted = useMemo(() => sortBookings(items), [items]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Bookings</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Your upcoming consultations</h1>
          <p className="mt-4 max-w-2xl text-sm text-brand-100">Review confirmed sessions and stay on top of client meetings.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          {loading ? (
            <p className="text-sm text-slate-500">Loading bookings…</p>
          ) : null}
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
          ) : null}
          {!loading && !error ? (
            sorted.length ? (
              <div className="space-y-4">
                {sorted.map((booking) => (
                  <div key={booking.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-slate-800">Booking #{booking.id}</p>
                      <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600">
                        {booking.status || "scheduled"}
                      </span>
                    </div>
                    <div className="mt-2 grid gap-2 text-slate-600 sm:grid-cols-2">
                      <p>Date: {booking.date}</p>
                      <p>Time: {booking.time || "—"}</p>
                      <p>Client ID: {booking.user_id || "—"}</p>
                      <p>Fee: {booking.fee || booking.amount || "—"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">No bookings yet.</p>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LawyerBookings;
