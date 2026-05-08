import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { Eye, EyeOff } from "lucide-react";

const cityOptions = [
  "Ahmedabad",
  "Bengaluru",
  "Chandigarh",
  "Chennai",
  "Delhi",
  "Hyderabad",
  "Kolkata",
  "Mumbai",
  "Pune"
];

const specializationOptions = [
  "Family Law",
  "Criminal Law",
  "Property / Rent Law",
  "Labour / Employment Law",
  "Cyber Law",
  "Motor Vehicle Law",
  "Women's Rights",
  "Mental Health Law"
];

const Register = () => {
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "user",
    city: "",
    specialization: "",
    experience_years: "",
    hourly_rate: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    if (formData.role === "lawyer") {
      const city = formData.city.trim();
      const specialization = formData.specialization.trim();
      const experience = Number(formData.experience_years);
      const hourly = Number(formData.hourly_rate);

      if (!city || !specialization) {
        setError("Please choose a city and specialization for lawyer signups.");
        return;
      }

      if (!Number.isFinite(experience) || experience < 0) {
        setError("Experience must be a non-negative number.");
        return;
      }

      if (!Number.isFinite(hourly) || hourly <= 0) {
        setError("Hourly rate must be greater than zero.");
        return;
      }
    }

    setLoading(true);
    try {
      await signup({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role: formData.role,
        lawyer_profile:
          formData.role === "lawyer"
            ? {
                city: formData.city.trim(),
                specialization: formData.specialization.trim(),
                experience_years: Number(formData.experience_years),
                hourly_rate: Number(formData.hourly_rate)
              }
            : undefined
      });
    } catch (err) {
      setError(err.message || "Unable to create account");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden flex-1 flex-col justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-white px-16 lg:flex">
        <div className="max-w-md space-y-6">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-brand-700 shadow-soft">
            <span className="h-2 w-2 rounded-full bg-brand-500" /> Trusted Legal Guidance
          </div>
          <h1 className="text-4xl font-semibold text-slate-900">
            Join LawBot and connect with clients seeking expert legal help.
          </h1>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-brand-400" /> Showcase your specialization and years of practice.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-brand-400" /> Receive appointment requests tailored to your expertise.
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-brand-400" /> Manage bookings and reviews in one dashboard.
            </li>
          </ul>
        </div>
      </div>
      <div className="flex w-full max-w-2xl flex-1 items-center justify-center px-6 py-10 lg:px-12">
        <div className="w-full rounded-3xl border border-slate-200 bg-white px-8 py-8 shadow-soft">
        <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-100 text-2xl">⚖️</span>
            <h2 className="text-2xl font-semibold text-slate-900">Create your LawBot account</h2>
          <p className="text-sm text-slate-600">
            Join as a user seeking legal guidance or a lawyer offering consultations.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="full_name" className="text-sm font-semibold text-slate-700">
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              required
              value={formData.full_name}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="Priya Sharma"
            />
          </div>
          <div>
            <label htmlFor="email" className="text-sm font-semibold text-slate-700">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative mt-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-2.5 pr-12 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                placeholder="Min. 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label htmlFor="role" className="text-sm font-semibold text-slate-700">
              I want to register as
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="user">User</option>
              <option value="lawyer">Lawyer</option>
            </select>
          </div>
          {formData.role === "lawyer" ? (
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Lawyer details</p>
              <div>
                <label htmlFor="city" className="text-sm font-semibold text-slate-700">
                  City
                </label>
                <select
                  id="city"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="" disabled>
                    Select city
                  </option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="specialization" className="text-sm font-semibold text-slate-700">
                  Specialization
                </label>
                <select
                  id="specialization"
                  name="specialization"
                  required
                  value={formData.specialization}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  <option value="" disabled>
                    Select specialization
                  </option>
                  {specializationOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="experience_years" className="text-sm font-semibold text-slate-700">
                  Years of experience
                </label>
                <input
                  id="experience_years"
                  name="experience_years"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={formData.experience_years}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="5"
                />
              </div>
              <div>
                <label htmlFor="hourly_rate" className="text-sm font-semibold text-slate-700">
                  Hourly rate (₹)
                </label>
                <input
                  id="hourly_rate"
                  name="hourly_rate"
                  type="number"
                  min="0"
                  step="100"
                  required
                  value={formData.hourly_rate}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="1500"
                />
              </div>
            </div>
          ) : null}
          {error ? (
            <p className="rounded-2xl bg-rose-50 px-4 py-2 text-sm font-medium text-rose-600">{error}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Log in
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
