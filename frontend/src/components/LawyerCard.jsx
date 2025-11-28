import { Link } from "react-router-dom";
import { formatINR } from "../lib/formatters.js";

const LawyerCard = ({ lawyer, onBook }) => {
  if (!lawyer) return null;

  const {
    id,
    full_name,
    city,
    specialization,
    experience_years,
    hourly_rate,
    average_rating,
    total_reviews
  } = lawyer;

  const displayName = full_name || lawyer.user?.full_name || "Verified Advocate";
  const ratingValue = average_rating ?? lawyer.avg_rating;
  const reviewCount = total_reviews ?? lawyer.review_count;

  const formattedRate = formatINR(hourly_rate);

  return (
    <div className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-soft transition hover:-translate-y-1 hover:shadow-lg">
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">{city}</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{displayName}</h3>
          <p className="mt-1 text-sm text-slate-600">{specialization}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm text-slate-500">
          <span className="rounded-full bg-brand-50 px-3 py-1 font-medium text-brand-700">
            {experience_years ?? 0}+ yrs experience
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600">
            {formattedRate === "—" ? "—" : `${formattedRate} / hour`}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          {ratingValue !== undefined && ratingValue !== null && !Number.isNaN(Number(ratingValue)) ? (
            <>
              <span className="flex items-center gap-1 text-brand-600">
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l2.67 6.78 7.33.6-5.56 4.72 1.72 7.15L12 17.77l-6.16 3.48 1.72-7.15-5.56-4.72 7.33-.6z" />
                </svg>
                {Number(ratingValue).toFixed(1)}
              </span>
              <span>({reviewCount ?? 0} reviews)</span>
            </>
          ) : (
            <span>No reviews yet</span>
          )}
        </div>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          to={`/lawyers/${id}`}
          className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
        >
          View Profile
        </Link>
        {onBook ? (
          <button
            type="button"
            onClick={() => onBook(lawyer)}
            className="flex-1 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
          >
            Book Consultation
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default LawyerCard;
