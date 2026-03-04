export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Cookie Policy</h1>
      <p className="mt-2 text-sm text-black/60">
        Information about cookies and similar technologies.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. What are cookies?</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Cookies are small files stored in your browser to improve the experience, remember preferences, and analyze traffic.
        </p>
        <h2 className="text-base font-semibold text-black">2. What we use</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          We may use essential cookies (site functionality), performance/analytics cookies, and marketing cookies (if enabled).
        </p>
        <h2 className="text-base font-semibold text-black">3. Your choices</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          You can control cookies in your browser settings or via the Cookie Settings page.
        </p>
      </div>
    </div>
  );
}
