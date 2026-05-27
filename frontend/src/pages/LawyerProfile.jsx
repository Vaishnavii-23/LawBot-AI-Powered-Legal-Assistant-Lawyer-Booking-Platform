import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../contexts/AuthContext.jsx";
import { CITY_OPTIONS, SPECIALIZATION_OPTIONS } from "../data/options.js";
import { fetchLawyerProfile, saveLawyerProfile } from "../store/slices/lawyerProfileSlice.js";
import { formatINR } from "../lib/formatters.js";

const LawyerProfile = () => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const { profile, loading, error, saving, saveError } = useSelector((state) => state.lawyerProfile);
  const [formState, setFormState] = useState({
    city: "",
    specialization: "",
    experience_years: "",
    hourly_rate: "",
    bio: "",
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchLawyerProfile(user.id));
    }
  }, [dispatch, user?.id]);

  useEffect(() => {
    if (!profile) {
      setFormState({
        city: "",
        specialization: "",
        experience_years: "",
        hourly_rate: "",
        bio: "",
      });
      return;
    }
    setFormState({
      city: profile.city || "",
      specialization: profile.specialization || "",
      experience_years: profile.experience_years ?? "",
      hourly_rate: profile.hourly_rate ?? "",
      bio: profile.bio || "",
    });
  }, [profile]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setMessage(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id) return;
    setMessage(null);
    const payload = {
      user_id: user.id,
      city: formState.city,
      specialization: formState.specialization,
      experience_years: Number(formState.experience_years) || 0,
      hourly_rate: Number(formState.hourly_rate) || 0,
      bio: formState.bio,
    };
    const result = await dispatch(saveLawyerProfile(payload));
    if (saveLawyerProfile.fulfilled.match(result)) {
      setMessage("Profile updated successfully.");
    }
  };

  const preview = useMemo(() => ({
    city: formState.city || "City not set",
    specialization: formState.specialization || "Specialization not set",
    experience: Number(formState.experience_years) || 0,
    rate: Number(formState.hourly_rate) || 0,
  }), [formState]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 px-8 py-10 text-white shadow-soft">
          <p className="text-sm uppercase tracking-[0.3em] text-brand-200">Lawyer profile</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-4xl">Your public profile</h1>
          <p className="mt-4 max-w-2xl text-sm text-brand-100">
            Keep your profile accurate so clients can discover you and book the right consultation.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Profile details</h2>
              {loading ? <span className="text-xs text-slate-400">Loading…</span> : null}
            </div>
            {error ? (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{error}</p>
            ) : null}
            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="city" className="text-sm font-semibold text-slate-700">City</label>
                <select
                  id="city"
                  name="city"
                  value={formState.city}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select city</option>
                  {CITY_OPTIONS.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="specialization" className="text-sm font-semibold text-slate-700">Specialization</label>
                <select
                  id="specialization"
                  name="specialization"
                  value={formState.specialization}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATION_OPTIONS.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="experience_years" className="text-sm font-semibold text-slate-700">Years of experience</label>
                  <input
                    id="experience_years"
                    name="experience_years"
                    type="number"
                    min="0"
                    step="1"
                    value={formState.experience_years}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
                <div>
                  <label htmlFor="hourly_rate" className="text-sm font-semibold text-slate-700">Hourly rate</label>
                  <input
                    id="hourly_rate"
                    name="hourly_rate"
                    type="number"
                    min="0"
                    step="1"
                    value={formState.hourly_rate}
                    onChange={handleChange}
                    className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formState.bio}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </div>
            </div>
            {saveError ? (
              <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-2 text-sm text-rose-600">{saveError}</p>
            ) : null}
            {message ? (
              <p className="mt-4 rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{message}</p>
            ) : null}
            <button
              type="submit"
              disabled={saving}
              className="mt-6 w-full rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? "Saving…" : "Save profile"}
            </button>
          </form>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-900">Profile preview</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="text-base font-semibold text-slate-900">{user?.full_name || "Lawyer"}</p>
                <p className="text-xs uppercase tracking-wide text-brand-600">{preview.specialization}</p>
                <p>{preview.city}</p>
                <p>Experience: <span className="font-medium text-slate-800">{preview.experience} yrs</span></p>
                <p>Rate: <span className="font-medium text-slate-800">{formatINR(preview.rate)}</span></p>
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="text-lg font-semibold text-slate-900">Visibility tips</h2>
              <ul className="mt-3 space-y-3 text-sm text-slate-600">
                <li>Keep specialization updated to appear in the right searches.</li>
                <li>Add a short bio to build trust with prospective clients.</li>
                <li>Set a realistic hourly rate to convert more bookings.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LawyerProfile;
