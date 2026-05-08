import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setStatus({ type: "success", text: "Thanks! Our team will get back soon." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 rounded-3xl border border-slate-200 bg-white p-10 shadow-soft md:grid-cols-[1.2fr,0.8fr]">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">Contact LawBot</h1>
            <p className="mt-3 text-sm text-slate-600">
              We are crafting LawBot with your feedback. Share ideas, partnership proposals, or issues and we will
              respond within two business days.
            </p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">Name</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Ananya Rao"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700">Message</label>
                <textarea
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  required
                  className="mt-2 w-full rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
                  placeholder="Tell us how we can help."
                />
              </div>
              {status ? (
                <p
                  className={`rounded-2xl px-4 py-2 text-sm font-medium ${
                    status.type === "success" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {status.text}
                </p>
              ) : null}
              <button
                type="submit"
                className="rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
              >
                Send message
              </button>
            </form>
          </div>
          <div className="rounded-3xl bg-slate-900 p-6 text-sm text-brand-100">
            <h2 className="text-lg font-semibold text-white">Need immediate help?</h2>
            <p className="mt-2 text-brand-100">
              LawBot is informational. If you face urgent danger, please contact emergency services or approach a local
              police station.
            </p>
            <div className="mt-6 space-y-3">
              <p className="font-semibold text-white">For legal escalation:</p>
              <ul className="space-y-2 text-brand-100">
                <li>• National Legal Services Authority (NALSA)</li>
                <li>• Local District Legal Services Authority</li>
                <li>• Nearest police station (dial 112)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
