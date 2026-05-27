import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  fetchChatSessions,
  fetchLawyerById,
  fetchUserBookings
} from "../lib/apiClient.js";

const formatDateTime = (value) => {
  if (!value) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [chatSessions, setChatSessions] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lawyerLookup, setLawyerLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      setLoading(true);
      setError(null);
      try {
        const [sessionsRes, bookingsRes] = await Promise.all([
          fetchChatSessions(user.id),
          fetchUserBookings(user.id)
        ]);
        const normalisedSessions = Array.isArray(sessionsRes) ? sessionsRes : sessionsRes?.items || [];
        const normalisedBookings = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.items || [];
        setChatSessions(normalisedSessions);
        const sortedBookings = [...normalisedBookings].sort((a, b) => {
          const aDate = new Date(`${a.date} ${a.time || "00:00"}`);
          const bDate = new Date(`${b.date} ${b.time || "00:00"}`);
          return aDate - bDate;
        });
        setBookings(sortedBookings);
      } catch (err) {
        setError(err.message || "Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    if (!bookings?.length) {
      setLawyerLookup({});
      return;
    }
    let active = true;
    const uniqueLawyerIds = Array.from(new Set(bookings.map((booking) => booking.lawyer_id).filter(Boolean)));
    if (!uniqueLawyerIds.length) {
      setLawyerLookup({});
      return;
    }

    const loadLawyers = async () => {
      try {
        const entries = await Promise.all(
          uniqueLawyerIds.map(async (lawyerId) => {
            try {
              const details = await fetchLawyerById(lawyerId);
              return [lawyerId, details];
            } catch (err) {
              console.error("Unable to fetch lawyer", lawyerId, err);
              return [lawyerId, null];
            }
          })
        );
        if (!active) return;
        setLawyerLookup(Object.fromEntries(entries));
      } catch (err) {
        console.error("Failed to prepare lawyer lookup", err);
        if (active) {
          setLawyerLookup({});
        }
      }
    };

    loadLawyers();
    return () => {
      active = false;
    };
  }, [bookings]);

  const nextBooking = useMemo(() => {
    if (!bookings?.length) return null;
    return bookings[0];
  }, [bookings]);

  const upcomingBookings = useMemo(() => bookings.slice(0, 3), [bookings]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-4 rounded-3xl bg-brand-600 px-8 py-10 text-white shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Welcome back</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">Hi, {user?.full_name?.split(" ")[0] || "there"} 👋</h1>
            <p className="max-w-xl text-sm text-brand-100">
              Continue your legal journey with quick access to chat, advocate discovery, and upcoming consultations.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/chat"
                className="rounded-full bg-white px-6 py-3 text-center text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
              >
                Resume AI Chat
              </Link>
              <Link
                to="/lawyers"
                className="rounded-full border border-white/40 px-6 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore Advocates
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
              Loading your dashboard…
            </div>
          ) : null}

          {error ? (
            <div className="rounded-3xl bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-soft">
              {error}
            </div>
          ) : null}

          {!loading && !error ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Recent chat sessions</h2>
                    <Link to="/chat" className="text-sm font-semibold text-brand-600">
                      View all
                    </Link>
                  </div>
                  <div className="mt-6 space-y-4">
                    {chatSessions?.length ? (
                      chatSessions.map((session) => (
                        <div key={session.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                          <p className="font-semibold text-slate-800">{session.title || "Untitled session"}</p>
                          <p className="mt-1 text-slate-500">Last activity: {formatDateTime(session.last_activity_at)}</p>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                        Start your first conversation to see it here.
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">Next booking</h2>
                  {nextBooking ? (
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">
                        {lawyerLookup[nextBooking.lawyer_id]?.full_name || lawyerLookup[nextBooking.lawyer_id]?.user?.full_name || `Lawyer #${nextBooking.lawyer_id}`}
                      </p>
                      {lawyerLookup[nextBooking.lawyer_id]?.specialization ? (
                        <p className="text-xs uppercase tracking-wide text-brand-600">
                          {lawyerLookup[nextBooking.lawyer_id]?.specialization}
                        </p>
                      ) : null}
                      <p>Date: {nextBooking.date}</p>
                      <p>Time: {nextBooking.time}</p>
                      <p>Status: <span className="font-medium text-brand-600">{nextBooking.status}</span></p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">No bookings yet. Book a lawyer to see it here.</p>
                  )}
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Upcoming consultations</h2>
                    <Link to="/lawyers" className="text-sm font-semibold text-brand-600">
                      Book new
                    </Link>
                  </div>
                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    {upcomingBookings?.length ? (
                      upcomingBookings.map((booking) => {
                        const lawyerDetails = lawyerLookup[booking.lawyer_id];
                        const lawyerName = lawyerDetails?.full_name || lawyerDetails?.user?.full_name || `Lawyer #${booking.lawyer_id}`;
                        return (
                          <div key={booking.id} className="rounded-2xl border border-slate-200 px-4 py-3">
                            <p className="font-semibold text-slate-800">{lawyerName}</p>
                            <p className="text-xs uppercase tracking-wide text-brand-600">
                              {lawyerDetails?.specialization || "Consultation"}
                            </p>
                            <p className="mt-2 text-xs text-slate-500">{booking.date} · {booking.time}</p>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                        Your scheduled consultations will appear here.
                      </p>
                    )}
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">Quick links</h2>
                  <ul className="mt-4 space-y-3 text-sm text-brand-600">
                    <li>
                      <Link to="/chat" className="hover:underline">
                        Ask LawBot another question
                      </Link>
                    </li>
                    <li>
                      <Link to="/lawyers" className="hover:underline">
                        Browse advocates by specialization
                      </Link>
                    </li>
                    <li>
                      <Link to="/contact" className="hover:underline">
                        Contact support
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
