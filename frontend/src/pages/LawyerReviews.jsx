import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext.jsx";
import { fetchLawyerProfile } from "../store/slices/lawyerProfileSlice.js";
import { loadLawyerReviews } from "../store/slices/lawyerReviewsSlice.js";

const LawyerReviews = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { profile } = useSelector((state) => state.lawyerProfile);
  const { items, loading, error } = useSelector((state) => state.lawyerReviews);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLawyerProfile(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (profile?.id) {
      dispatch(loadLawyerReviews(profile.id));
    }
  }, [dispatch, profile?.id]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Reviews</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Client feedback</h1>
          <p className="mt-4 max-w-2xl text-sm text-brand-100">See what clients think about your consultations.</p>
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
          {loading ? <p className="text-sm text-slate-500">Loading reviews…</p> : null}
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
          ) : null}
          {!loading && !error ? (
            items.length ? (
              <div className="space-y-4">
                {items.map((review) => (
                  <div key={review.id} className="rounded-2xl border border-slate-200 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-800">Client #{review.user_id || "—"}</p>
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                        {review.rating ? `${review.rating} / 5` : "No rating"}
                      </span>
                    </div>
                    <p className="mt-3 text-slate-600">{review.comment || "No feedback provided."}</p>
                    <p className="mt-2 text-xs text-slate-400">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ""}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-slate-100 px-4 py-6 text-center text-sm text-slate-500">No reviews yet.</p>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default LawyerReviews;
