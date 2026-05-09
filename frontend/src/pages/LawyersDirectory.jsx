import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import LawyerCard from "../components/LawyerCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { CITY_OPTIONS, SPECIALIZATION_OPTIONS } from "../data/options.js";
import { createBookingRequest, fetchLawyers } from "../lib/apiClient.js";

const initialFilters = {
  city: "",
  specialization: "",
  min_experience: "",
  max_hourly_rate: "",
  min_rating: ""
};

const LawyersDirectory = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const deriveFiltersFromParams = () => {
    const next = { ...initialFilters };
    (Object.keys(initialFilters)).forEach((key) => {
      const value = searchParams.get(key);
      if (value) {
        next[key] = value;
      }
    });
    return next;
  };

  const initialFiltersFromQuery = deriveFiltersFromParams();
  const initialPageFromQuery = Number.parseInt(searchParams.get("page") || "1", 10);
  const safeInitialPage = Number.isNaN(initialPageFromQuery) || initialPageFromQuery < 1 ? 1 : initialPageFromQuery;

  const [filters, setFilters] = useState(initialFiltersFromQuery);
  const [appliedFilters, setAppliedFilters] = useState(initialFiltersFromQuery);
  const [page, setPage] = useState(safeInitialPage);
  const pageSize = 9;
  const [lawyers, setLawyers] = useState([]);
  const [totalCount, setTotalCount] = useState(null);
  const [lastPageCount, setLastPageCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [bookingPayload, setBookingPayload] = useState({ date: "", time: "", notes: "" });
  const [bookingStatus, setBookingStatus] = useState(null);

  const totalToDisplay = useMemo(() => {
    if (totalCount != null) {
      return totalCount;
    }
    return lawyers.length;
  }, [totalCount, lawyers.length]);

  const hasMore = useMemo(() => {
    if (totalCount != null) {
      return lawyers.length < totalCount;
    }
    return lastPageCount === pageSize;
  }, [lawyers.length, lastPageCount, pageSize, totalCount]);

  const numericFilterKeys = new Set(["min_experience", "max_hourly_rate", "min_rating"]);

  const buildQueryParams = (targetPage = page) => {
    const payload = {
      page: targetPage,
      page_size: pageSize
    };
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const trimmed = String(value).trim();
      if (trimmed === "") return;
      if (numericFilterKeys.has(key)) {
        const numeric = Number(trimmed);
        if (Number.isNaN(numeric)) return;
        payload[key] = numeric;
      } else {
        payload[key] = trimmed;
      }
    });
    return payload;
  };

  const syncUrlParams = (nextFilters, nextPage) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      const trimmed = String(value).trim();
      if (trimmed === "") return;
      params.set(key, trimmed);
    });
    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }
    setSearchParams(params);
  };

  const loadLawyers = async ({ append = false, targetPage } = {}) => {
    const pageToFetch = targetPage ?? page;
    if (append) {
      setIsLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      const response = await fetchLawyers(buildQueryParams(pageToFetch));

      let items = [];
      let total = null;
      if (Array.isArray(response)) {
        items = response;
        total = response.length;
      } else if (Array.isArray(response?.items)) {
        items = response.items;
        total = response.total ?? response.count ?? response.total_count ?? null;
      } else if (Array.isArray(response?.results)) {
        items = response.results;
        total = response.total ?? response.count ?? response.total_count ?? null;
      }

      setLastPageCount(items.length);
      setTotalCount(total ?? null);
      setLawyers((prev) => (append ? [...prev, ...items] : items));
    } catch (err) {
      setError(err.message || "Unable to load lawyers");
      if (!append) {
        setLawyers([]);
      }
      setLastPageCount(0);
    } finally {
      if (append) {
        setIsLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const append = page > 1;
    loadLawyers({ append, targetPage: page });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, appliedFilters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleResetFilters = () => {
    const resetFilters = { ...initialFilters };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setPage(1);
    setLawyers([]);
    setTotalCount(null);
    setLastPageCount(0);
    syncUrlParams(resetFilters, 1);
  };

  const handleFiltersSubmit = (event) => {
    event.preventDefault();
    const snapshot = { ...filters };
    setAppliedFilters(snapshot);
    setPage(1);
    setLawyers([]);
    setTotalCount(null);
    setLastPageCount(0);
    syncUrlParams(snapshot, 1);
  };

  const handleBook = (lawyer) => {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: { pathname: "/lawyers" } } });
      return;
    }
    setSelectedLawyer(lawyer);
    setBookingStatus(null);
    setBookingPayload({ date: "", time: "", notes: "" });
  };

  const submitBooking = async (event) => {
    event.preventDefault();
    if (!selectedLawyer || !user?.id) return;
    try {
      setBookingStatus({ type: "loading", message: "Sending request…" });
      const payload = {
        user_id: user.id,
        lawyer_id: selectedLawyer.id,
        preferred_date: bookingPayload.date,
        preferred_time: bookingPayload.time,
        notes: bookingPayload.notes
      };
      await createBookingRequest(payload);
      setBookingStatus({
        type: "success",
        message: "Request sent to the lawyer. You will be notified once they respond."
      });
    } catch (err) {
      setBookingStatus({ type: "error", message: err.message || "Unable to create booking" });
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    syncUrlParams(appliedFilters, nextPage);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10">
          <div className="rounded-3xl bg-white p-8 shadow-soft">
            <h1 className="text-3xl font-semibold text-slate-900">Find the right advocate</h1>
            <p className="mt-3 max-w-2xl text-sm text-slate-600">
              Filter by city, practice area, experience, pricing, and ratings to discover verified lawyers on LawBot.
            </p>
            <form onSubmit={handleFiltersSubmit} className="mt-8 grid gap-5 md:grid-cols-3">
              <div>
                <label className="text-sm font-semibold text-slate-700">City</label>
                <select
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">All cities</option>
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
                  value={filters.specialization}
                  onChange={handleFilterChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">All specialisations</option>
                  {SPECIALIZATION_OPTIONS.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Minimum experience (years)</label>
                <input
                  name="min_experience"
                  type="number"
                  min="0"
                  value={filters.min_experience}
                  onChange={handleFilterChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Maximum hourly rate (₹k)</label>
                <input
                  name="max_hourly_rate"
                  type="number"
                  min="0"
                  value={filters.max_hourly_rate}
                  onChange={handleFilterChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Minimum rating</label>
                <input
                  name="min_rating"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={filters.min_rating}
                  onChange={handleFilterChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                  Apply filters
                </button>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-brand-600 hover:text-brand-600"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>

          {loading ? (
            <div className="rounded-3xl bg-white p-6 text-center text-sm text-slate-500 shadow-soft">
              Loading advocates…
            </div>
          ) : null}

          {error ? (
            <div className="rounded-3xl bg-rose-50 p-6 text-sm font-medium text-rose-600 shadow-soft">{error}</div>
          ) : null}

          {!loading && !error ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-medium text-slate-600">
                  {totalToDisplay || 0} lawyer{(totalToDisplay || 0) === 1 ? "" : "s"} found
                </p>
                <span className="text-xs font-semibold uppercase tracking-wide text-brand-500">
                  Real-time data from backend
                </span>
              </div>
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {lawyers.length ? (
                  lawyers.map((lawyer) => (
                    <LawyerCard key={lawyer.id || lawyer.lawyer_id} lawyer={{
                      id: lawyer.id || lawyer.lawyer_id,
                      full_name: lawyer.full_name || lawyer.user?.full_name,
                      city: lawyer.city,
                      specialization: lawyer.specialization,
                      experience_years: lawyer.experience_years,
                      hourly_rate: lawyer.hourly_rate,
                      average_rating: lawyer.average_rating ?? lawyer.avg_rating,
                      total_reviews: lawyer.total_reviews ?? lawyer.review_count
                    }} onBook={handleBook} />
                  ))
                ) : (
                  <p className="col-span-full rounded-3xl bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
                    No advocates match these filters yet. Adjust your search or check back soon.
                  </p>
                )}
              </div>
              {hasMore ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="rounded-full border border-brand-600 px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      {selectedLawyer ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Book {selectedLawyer.full_name || "this lawyer"}</h2>
                <p className="mt-1 text-sm text-slate-600">Share preferred time and a short note.</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLawyer(null)}
                className="rounded-full border border-slate-200 p-2 text-slate-500"
              >
                <span className="sr-only">Close</span>
                ×
              </button>
            </div>
            <form onSubmit={submitBooking} className="mt-6 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Preferred date</label>
                <input
                  type="date"
                  required
                  value={bookingPayload.date}
                  onChange={(event) => setBookingPayload((prev) => ({ ...prev, date: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Preferred time</label>
                <input
                  type="time"
                  required
                  value={bookingPayload.time}
                  onChange={(event) => setBookingPayload((prev) => ({ ...prev, time: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Notes (optional)</label>
                <textarea
                  rows={3}
                  value={bookingPayload.notes}
                  onChange={(event) => setBookingPayload((prev) => ({ ...prev, notes: event.target.value }))}
                  placeholder="Briefly describe your matter"
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
              {bookingStatus?.message ? (
                <p
                  className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                    bookingStatus.type === "success"
                      ? "bg-emerald-50 text-emerald-600"
                      : bookingStatus.type === "error"
                      ? "bg-rose-50 text-rose-600"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {bookingStatus.message}
                </p>
              ) : null}
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
                >
                  Confirm booking
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLawyer(null)}
                  className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default LawyersDirectory;
