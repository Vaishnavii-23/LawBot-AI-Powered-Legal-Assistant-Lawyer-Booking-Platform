import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  fetchLawyerBookings,
  fetchLawyerRequests,
  fetchLawyerReviews,
  fetchLawyers,
  fetchUsers,
  upsertLawyerProfile,
  updateBookingRequestStatus
} from "../lib/apiClient.js";
import { CITY_OPTIONS, SPECIALIZATION_OPTIONS } from "../data/options.js";
import { formatINR } from "../lib/formatters.js";

const emptyProfile = {
  city: "",
  specialization: "",
  experience_years: "",
  hourly_rate: "",
  bio: ""
};

const LawyerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(emptyProfile);
  const [bookings, setBookings] = useState([]);
  const [requests, setRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [clientsLookup, setClientsLookup] = useState({});
  const [loading, setLoading] = useState(true);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [requestError, setRequestError] = useState(null);
  const [requestActionPending, setRequestActionPending] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [clientsError, setClientsError] = useState(null);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const lawyerList = await fetchLawyers({ user_id: user.id, page_size: 10 });
        const items = Array.isArray(lawyerList)
          ? lawyerList
          : lawyerList?.items || lawyerList?.results || [];
        const found = items.find((item) => item.user_id === user.id) || null;
        if (found) {
          setProfile(found);
          setProfileForm({
            city: found.city || "",
            specialization: found.specialization || "",
            experience_years: found.experience_years ?? "",
            hourly_rate: found.hourly_rate ?? "",
            bio: found.bio || ""
          });
          const [bookingsRes, reviewsRes] = await Promise.all([
            fetchLawyerBookings(found.id),
            fetchLawyerReviews(found.id)
          ]);
          const normalisedBookings = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.items || [];
          const sortedBookings = [...normalisedBookings].sort((a, b) => {
            const aDate = new Date(`${a.date} ${a.time || "00:00"}`);
            const bDate = new Date(`${b.date} ${b.time || "00:00"}`);
            return aDate - bDate;
          });
          setBookings(sortedBookings);
          setReviews(Array.isArray(reviewsRes) ? reviewsRes.slice(0, 6) : []);
        } else {
          setProfile(null);
          setProfileForm(emptyProfile);
          setBookings([]);
          setReviews([]);
        }
      } catch (err) {
        setError(err.message || "Unable to load lawyer dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [user?.id]);

  useEffect(() => {
    if (!profile?.id) {
      setRequests([]);
      setRequestsLoading(false);
      setRequestError(null);
      return;
    }

    const loadRequests = async () => {
      setRequestsLoading(true);
      setRequestError(null);
      try {
        const response = await fetchLawyerRequests(profile.id);
        const normalized = Array.isArray(response) ? response : response?.items || [];
        setRequests(normalized);
      } catch (err) {
        setRequestError(err.message || "Unable to load booking requests");
        setRequests([]);
      } finally {
        setRequestsLoading(false);
      }
    };

    loadRequests();
  }, [profile?.id]);

  useEffect(() => {
    let active = true;
    const loadClients = async () => {
      try {
        const users = await fetchUsers();
        if (!active) return;
        const lookup = {};
        (Array.isArray(users) ? users : []).forEach((item) => {
          lookup[item.id] = item;
        });
        setClientsLookup(lookup);
      } catch (err) {
        if (active) {
          setClientsLookup({});
          setClientsError(err.message || "Unable to load client directory");
        }
      }
    };
    loadClients();
    return () => {
      active = false;
    };
  }, []);

  const upcomingBookings = useMemo(() => bookings.slice(0, 5), [bookings]);
  const pendingRequests = useMemo(
    () => requests.filter((request) => request.status === "pending"),
    [requests]
  );

  const handleRequestAction = async (requestId, status) => {
    if (!requestId || !status) return;
    setRequestActionPending(true);
    setRequestError(null);
    try {
      const updated = await updateBookingRequestStatus(requestId, status);
      setRequests((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      if (status === "accepted" && profile?.id) {
        const bookingsRes = await fetchLawyerBookings(profile.id);
        const normalisedBookings = Array.isArray(bookingsRes) ? bookingsRes : bookingsRes?.items || [];
        const sorted = [...normalisedBookings].sort((a, b) => {
          const aDate = new Date(`${a.date} ${a.time || "00:00"}`);
          const bDate = new Date(`${b.date} ${b.time || "00:00"}`);
          return aDate - bDate;
        });
        setBookings(sorted);
      }
    } catch (err) {
      setRequestError(err.message || "Unable to update request");
    } finally {
      setRequestActionPending(false);
    }
  };

  const handleProfileChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSave = async (event) => {
    event.preventDefault();
    if (!user?.id) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const payload = {
        user_id: user.id,
        city: profileForm.city,
        specialization: profileForm.specialization,
        experience_years: Number(profileForm.experience_years) || 0,
        hourly_rate: Number(profileForm.hourly_rate) || 0,
        bio: profileForm.bio
      };
      const updated = await upsertLawyerProfile(payload);
      setProfile(updated);
      setMessage("Profile saved successfully.");
    } catch (err) {
      setError(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-soft">
            <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Lawyer workspace</p>
            <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Welcome, {user?.full_name || "Lawyer"}</h1>
            <p className="mt-4 max-w-2xl text-sm text-brand-100">
              Keep your profile impeccable, manage consultations, and respond to reviews. LawBot highlights your
              expertise to the right clients.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
              Loading your lawyer dashboard…
            </div>
          ) : null}

          {error ? (
            <div className="rounded-3xl bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-soft">
              {error}
            </div>
          ) : null}

          {!loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">Practice snapshot</h2>
                  {profile ? (
                    <div className="mt-4 space-y-2 text-sm text-slate-600">
                      <p className="font-semibold text-slate-800">{user?.full_name}</p>
                      {profile.city ? <p>{profile.city}</p> : null}
                      {profile.specialization ? (
                        <p className="text-xs uppercase tracking-wide text-brand-600">{profile.specialization}</p>
                      ) : null}
                      <p>
                        Experience: <span className="font-medium text-slate-800">{profile.experience_years ?? 0} yrs</span>
                      </p>
                      <p>
                        Rate: <span className="font-medium text-slate-800">{formatINR(profile.hourly_rate)}</span>
                      </p>
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-slate-500">
                      Complete your profile to appear in search results and receive targeted enquiries.
                    </p>
                  )}
                </div>

                <form
                  onSubmit={handleProfileSave}
                  className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Update public profile</h2>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </div>
                  {message ? (
                    <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-600">{message}</p>
                  ) : null}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-semibold text-slate-700">City</label>
                      <select
                        name="city"
                        value={profileForm.city}
                        onChange={handleProfileChange}
                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="">Select city</option>
                        {CITY_OPTIONS.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Specialization</label>
                      <select
                        name="specialization"
                        value={profileForm.specialization}
                        onChange={handleProfileChange}
                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                      >
                        <option value="">Select specialization</option>
                        {SPECIALIZATION_OPTIONS.map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Experience (years)</label>
                      <input
                        name="experience_years"
                        type="number"
                        min="0"
                        value={profileForm.experience_years}
                        onChange={handleProfileChange}
                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700">Hourly rate (₹)</label>
                      <input
                        name="hourly_rate"
                        type="number"
                        min="0"
                        step="0.5"
                        value={profileForm.hourly_rate}
                        onChange={handleProfileChange}
                        className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700">Short bio</label>
                    <textarea
                      name="bio"
                      rows={4}
                      value={profileForm.bio}
                      onChange={handleProfileChange}
                      className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                      placeholder="Describe your practice, approach, and languages."
                    />
                  </div>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Incoming requests</h2>
                    <p className="text-xs text-slate-400">
                      {requestsLoading ? "Refreshing…" : `${pendingRequests.length} pending`}
                    </p>
                  </div>
                  {requestError ? (
                    <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">{requestError}</p>
                  ) : null}
                  <div className="mt-4 space-y-4">
                    {pendingRequests.length ? (
                      pendingRequests.map((request) => {
                        const client = clientsLookup[request.user_id] || request.user;
                        return (
                          <div
                            key={request.id}
                            className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-5 text-sm text-slate-600 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="space-y-1">
                              <p className="text-sm font-semibold text-slate-900">
                                {client?.full_name || `User #${request.user_id}`}
                              </p>
                              <p className="text-xs uppercase tracking-wide text-brand-600">Pending review</p>
                              <p className="text-xs text-slate-500">
                                {request.preferred_date ? `${request.preferred_date} · ` : ""}
                                {request.preferred_time || "Preferred time not specified"}
                              </p>
                              {request.notes ? (
                                <p className="text-xs text-slate-500">Notes: {request.notes}</p>
                              ) : null}
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                disabled={requestActionPending}
                                onClick={() => handleRequestAction(request.id, "accepted")}
                                className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Accept
                              </button>
                              <button
                                type="button"
                                disabled={requestActionPending}
                                onClick={() => handleRequestAction(request.id, "rejected")}
                                className="rounded-full border border-rose-500 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                        No new enquiries right now. Once clients contact you, their requests will show here for action.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-900">Upcoming bookings</h2>
                    <p className="text-xs text-slate-400">
                      {clientsError ? clientsError : "Synced with client portal"}
                    </p>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {upcomingBookings?.length ? (
                      upcomingBookings.map((booking) => {
                        const client = clientsLookup[booking.user_id];
                        return (
                          <div key={booking.id} className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
                            <p className="font-semibold text-slate-800">{client?.full_name || `Client #${booking.user_id}`}</p>
                            <p className="text-xs uppercase tracking-wide text-brand-600">{client?.role === "user" ? "Client" : client?.role}</p>
                            <p className="mt-2 text-xs text-slate-500">{booking.date} · {booking.time}</p>
                            <p className="mt-2">Status: <span className="font-medium text-brand-600">{booking.status}</span></p>
                            {booking.notes ? <p className="mt-3 text-xs text-slate-500">Notes: {booking.notes}</p> : null}
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                        No bookings yet. Once clients schedule consultations, they will appear here.
                      </p>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
                  <h2 className="text-lg font-semibold text-slate-900">Recent reviews</h2>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    {reviews?.length ? (
                      reviews.map((review) => {
                        const client = clientsLookup[review.user_id];
                        return (
                          <div key={review.id} className="rounded-2xl border border-slate-200 p-5 text-sm text-slate-600">
                            <div className="flex items-center gap-2 text-amber-600">
                              <span className="font-semibold">{review.rating} / 5</span>
                              <span className="text-slate-400">•</span>
                              <span className="text-slate-500">{client?.full_name || `Client #${review.user_id}`}</span>
                            </div>
                            <p className="mt-2 text-xs text-slate-500">Booking #{review.booking_id}</p>
                            {review.comment ? (
                              <p className="mt-3 text-sm text-slate-600">“{review.comment}”</p>
                            ) : null}
                          </div>
                        );
                      })
                    ) : (
                      <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                        Reviews from clients will show up here after their consultations.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LawyerDashboard;
