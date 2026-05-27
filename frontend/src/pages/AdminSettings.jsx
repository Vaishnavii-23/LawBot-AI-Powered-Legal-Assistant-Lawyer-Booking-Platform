import { useState } from "react";
import { Save } from "lucide-react";

const AdminSettings = () => {
  const [message, setMessage] = useState(null);
  const [formState, setFormState] = useState({
    supportEmail: "support@lawbot.ai",
    notifyNewUser: true,
    notifyNewBooking: true,
    maintenanceMode: false,
  });

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setFormState((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setMessage(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setMessage("Settings saved locally. Wire to backend when ready.");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Admin</p>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Settings</h1>
            <p className="mt-2 text-sm text-slate-500">Configure notification and platform preferences.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="supportEmail" className="text-sm font-semibold text-slate-700">Support email</label>
              <input
                id="supportEmail"
                name="supportEmail"
                type="email"
                value={formState.supportEmail}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Notifications</p>
              <label className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="notifyNewUser"
                  checked={formState.notifyNewUser}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Notify when a new user signs up
              </label>
              <label className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="notifyNewBooking"
                  checked={formState.notifyNewBooking}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Notify when a new booking is created
              </label>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-700">Platform</p>
              <label className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  name="maintenanceMode"
                  checked={formState.maintenanceMode}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600"
                />
                Enable maintenance mode
              </label>
              <p className="mt-2 text-xs text-slate-400">Maintenance mode is UI-only until connected to backend.</p>
            </div>

            {message ? (
              <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-600">{message}</p>
            ) : null}

            <button
              type="submit"
              className="flex items-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
            >
              <Save size={16} />
              Save settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
