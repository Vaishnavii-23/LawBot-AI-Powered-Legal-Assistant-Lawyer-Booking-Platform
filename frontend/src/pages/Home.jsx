import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chat");
    }
  }, [isAuthenticated, navigate]);

  const handlePrimaryCta = () => {
    navigate("/chat");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-brand-50/60">
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1 text-sm font-semibold text-brand-700">
              ⚡ AI-Powered Legal Platform
            </span>
            <h1 className="font-serif text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Your trusted legal partner for every decisive moment.
            </h1>
            <p className="text-lg leading-8 text-slate-600">
              Navigate Indian law with confidence. LawBot blends AI guidance, curated statutes, and verified advocates so you
              can understand your rights, plan the next move, and speak with the right lawyer in minutes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handlePrimaryCta}
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                {isAuthenticated ? "Open Chat" : "Start Chat Now"}
              </button>
              <Link
                to="/lawyers"
                className="rounded-full border border-slate-200 px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:border-brand-600 hover:text-brand-600"
              >
                Browse Advocates
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm text-slate-500 sm:grid-cols-3">
              {[{
                metric: "30k+",
                label: "Individuals guided through decisive legal moments"
              }, {
                metric: "1,200+",
                label: "Verified advocates across metros and Tier-II cities"
              }, {
                metric: "4.8 / 5",
                label: "Average advocate rating from verified consultations"
              }].map((item) => (
                <div key={item.metric}>
                  <p className="font-serif text-2xl font-semibold text-slate-900">{item.metric}</p>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -translate-x-10 translate-y-10 rounded-3xl bg-brand-100/50 blur-3xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl">
              <img
                src="https://images.pexels.com/photos/5668772/pexels-photo-5668772.jpeg"
                alt="Indian lawyer working at desk"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-semibold text-slate-900">How LawBot Works</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              title: "Ask in plain language",
              description:
                "Describe your situation. LawBot translates it into legal terms and highlights rights relevant to Indian law."
            },
            {
              title: "Review tailored guidance",
              description:
                "Receive step-by-step next moves, safety tips, and a clear summary of applicable acts, sections, and remedies."
            },
            {
              title: "Talk to a verified advocate",
              description:
                "Browse curated lawyers, schedule a consultation, and keep all chats, bookings, and documents in one place."
            }
          ].map((item) => (
            <div key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
              <h3 className="font-serif text-xl font-semibold text-slate-900">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-serif text-3xl font-semibold text-slate-900">Why families and founders trust LawBot</h2>
              <p className="mt-4 text-base text-slate-600">
                Built for India, LawBot keeps you informed before you take major decisions. Whether it is matrimonial issues,
                tenancy disputes, or business compliance, we bridge the gap between information and expert counsel.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {[{
                title: "Context-aware AI",
                description: "Powered by your uploaded documents, Indian statutes, and authoritative guides."
              },
              {
                title: "Verified advocates",
                description: "Every lawyer profile shows experience, practice focus, reviews, and rate transparency."
              },
              {
                title: "Seamless bookings",
                description: "Pick a slot, add notes, and receive reminders. Lawyers manage schedules inside LawBot."
              },
              {
                title: "Secure workspace",
                description: "Documents stay encrypted and accessible for future queries and follow-ups."
              }].map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                  <h3 className="text-lg font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 text-center sm:px-6 lg:px-8">
        <h2 className="font-serif text-3xl font-semibold text-slate-900">Categories we cover</h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600">
          From personal matters to business-critical decisions, LawBot recognises key domains across Indian law so your
          questions reach the right expertise faster.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {["Family Law", "Property & Rent", "Criminal Law", "Employment & Labour", "Cyber Law", "Motor Vehicle", "Women's Rights", "Consumer Protection", "Startup & Corporate", "Intellectual Property"].map((category) => (
            <span
              key={category}
              className="rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 shadow-soft/30"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-brand-600 px-8 py-12 text-white shadow-soft">
          <h2 className="font-serif text-3xl font-semibold">Lawyers, grow with LawBot</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-brand-100">
            Join a curated marketplace of advocates helping clients across India. Manage your profile, track bookings,
            respond to reviews, and stay visible to users searching by city, specialization, and experience.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/register"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-brand-600 transition hover:bg-brand-100"
            >
              Create a Lawyer Account
            </Link>
            {user?.role === "lawyer" ? (
              <Link
                to="/lawyer/dashboard"
                className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Go to Dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
