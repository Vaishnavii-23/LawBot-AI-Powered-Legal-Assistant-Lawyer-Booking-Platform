import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-lg rounded-3xl border border-slate-200 bg-white px-10 py-12 shadow-soft">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">404</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">
          The page you are looking for does not exist or has moved. Let us get you back on track.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-700"
        >
          Return home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
