import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { createBookingRequest, fetchLawyerById, fetchLawyerReviews } from "../lib/apiClient.js";
import { formatINR } from "../lib/formatters.js";

const LawyerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [lawyer, setLawyer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: "", time: "", notes: "" });
  const [bookingMessage, setBookingMessage] = useState(null);

  useEffect(() => {
    const loadLawyer = async () => {
      setLoading(true);
      setError(null);
      try {
        const [lawyerRes, reviewsRes] = await Promise.all([
          fetchLawyerById(id),
          fetchLawyerReviews(id)
        ]);
        setLawyer(lawyerRes);
        setReviews(reviewsRes || []);
      } catch (err) {
        setError(err.message || "Unable to fetch lawyer details");
      } finally {
        setLoading(false);
      }
    };
    loadLawyer();
  }, [id]);

  const handleBookingSubmit = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: `/lawyers/${id}` } } });
      return;
    }
    if (!user?.id) return;
    try {
      setBookingMessage({ type: "loading", text: "Sending booking request…" });
      await createBookingRequest({
        user_id: user.id,
        lawyer_id: Number(id),
        preferred_date: bookingForm.date,
        preferred_time: bookingForm.time,
        notes: bookingForm.notes
      });
      setBookingMessage({ type: "success", text: "Booking request sent. The lawyer will confirm shortly." });
    } catch (err) {
      setBookingMessage({ type: "error", text: err.message || "Unable to create booking" });
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="rounded-3xl bg-white px-6 py-4 text-sm text-slate-500 shadow-soft">Loading lawyer details…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="rounded-3xl bg-rose-50 px-6 py-4 text-sm font-medium text-rose-600 shadow-soft">{error}</p>
      </div>
    );
  }

  if (!lawyer) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="rounded-3xl bg-white px-6 py-4 text-sm text-slate-500 shadow-soft">Lawyer not found.</p>
      </div>
    );
  }

  const displayName = lawyer.full_name || lawyer.user?.full_name || "Verified Advocate";
  const hourlyRateDisplay = formatINR(lawyer.hourly_rate);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{lawyer.city}</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">{displayName}</h1>
              <p className="mt-2 text-base text-slate-600">{lawyer.specialization}</p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
                  {lawyer.experience_years ?? 0}+ years experience
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                  {hourlyRateDisplay === "—" ? "—" : `${hourlyRateDisplay} / hour`}
                </span>
                {lawyer.average_rating ? (
                  <span className="rounded-full bg-amber-50 px-3 py-1 font-medium text-amber-700">
                    ⭐ {lawyer.average_rating.toFixed(1)} ({lawyer.total_reviews} reviews)
                  </span>
                ) : null}
              </div>
              <p className="mt-6 text-sm leading-6 text-slate-600 whitespace-pre-line">{lawyer.bio}</p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Client reviews</h2>
              <div className="mt-6 space-y-5">
                {reviews?.length ? (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-slate-200 p-5">
                      <div className="flex items-center gap-2 text-sm text-amber-600">
                        <span className="font-semibold">Rating {review.rating}/5</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">Booking #{review.booking_id}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-600">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">
                    Reviews will appear after clients share feedback.
                  </p>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">Book this lawyer</h2>
              <p className="mt-2 text-sm text-slate-600">
                Share your preferred date and time. The lawyer will confirm or suggest alternatives.
              </p>
              <form onSubmit={handleBookingSubmit} className="mt-6 space-y-5">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Preferred date</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.date}
                    onChange={(event) => setBookingForm((prev) => ({ ...prev, date: event.target.value }))}
                    placeholder="23/11/2026"
                    className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Preferred time</label>
                  <input
                    type="text"
                    required
                    value={bookingForm.time}
                    onChange={(event) => setBookingForm((prev) => ({ ...prev, time: event.target.value }))}
                    placeholder="6pm"
                    className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">Notes (optional)</label>
                  <textarea
                    rows={3}
                    value={bookingForm.notes}
                    onChange={(event) => setBookingForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Briefly describe your case or question"
                    className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                {bookingMessage ? (
                  <p
                    className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                      bookingMessage.type === "success"
                        ? "bg-emerald-50 text-emerald-600"
                        : bookingMessage.type === "error"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {bookingMessage.text}
                  </p>
                ) : null}
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                  {isAuthenticated ? "Send booking request" : "Log in to book"}
                </button>
              </form>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h3 className="text-lg font-semibold text-slate-900">Need help choosing?</h3>
              <p className="mt-2 text-sm text-slate-600">
                Use the AI chat to describe your matter. LawBot classifies the category and recommends relevant lawyers.
              </p>
              <button
                type="button"
                onClick={() => navigate("/chat")}
                className="mt-4 w-full rounded-full border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50"
              >
                Ask LawBot for guidance
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default LawyerDetail;
