export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Data Protection (GDPR)</h1>
      <p className="mt-2 text-sm text-black/60">
        Information about your rights and how data is processed.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. Controller</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          The data controller is NextCommerce Pro (add your legal identification details here).
        </p>
        <h2 className="text-base font-semibold text-black">2. Your rights</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Access, rectification, erasure ("right to be forgotten"), restriction, portability, objection, and withdrawal of consent.
        </p>
        <h2 className="text-base font-semibold text-black">3. Contact</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          For data requests: support@example.com.
        </p>
      </div>
    </div>
  );
}
