const About = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 shadow-soft">
          <h1 className="text-3xl font-semibold text-slate-900">About LawBot</h1>
          <p className="mt-6 text-base leading-7 text-slate-600">
            LawBot was born from a simple observation: Indian citizens and founders often struggle to find reliable legal
            information before speaking to an advocate. We bring together responsible AI, trusted legal sources, and a
            curated marketplace of lawyers so you can move from doubt to clarity in minutes.
          </p>
          <div className="mt-10 space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-slate-900">AI with a human safety net</h2>
              <p className="mt-2 text-sm text-slate-600">
                Our AI assistant combines Retrieval-Augmented Generation (RAG) with policy-aligned prompts. Answers are
                grounded in Indian statutes, judgments, and verified legal guides. Every response reminds you to confirm
                important decisions with a real lawyer, so you never rely on AI alone.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Verified advocates across India</h2>
              <p className="mt-2 text-sm text-slate-600">
                We onboard lawyers who demonstrate clear practice experience, strong references, and transparent pricing.
                Profiles include ratings, reviews, languages, and hourly rates so you can choose the right counsel.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Security and privacy</h2>
              <p className="mt-2 text-sm text-slate-600">
                Documents you upload stay encrypted in our secure storage and are used only to improve responses for your
                matters. You can delete files any time. We comply with reasonable safeguards inspired by Indian data
                protection guidelines.
              </p>
            </section>
            <section>
              <h2 className="text-xl font-semibold text-slate-900">Our mission</h2>
              <p className="mt-2 text-sm text-slate-600">
                Make legal guidance in India more accessible, empathetic, and actionable. Whether you need clarity on a
                family dispute, tenancy issue, or startup compliance, LawBot accompanies you from first question to
                expert consultation.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
