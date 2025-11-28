const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-slate-200 bg-white/90 text-sm text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="space-y-1">
          <p>© {currentYear} LawBot. All rights reserved.</p>
          <p className="text-xs text-slate-400">General guidance only – not legal advice. Please consult a qualified lawyer.</p>
        </div>
        <div className="flex flex-col items-start gap-2 text-xs sm:items-end">
          <a href="mailto:support@lawbot.in" className="transition hover:text-brand-600">
            support@lawbot.in
          </a>
          <div className="flex gap-5 text-sm">
            <a href="#" className="transition hover:text-brand-600">
              Terms
            </a>
            <a href="#" className="transition hover:text-brand-600">
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
