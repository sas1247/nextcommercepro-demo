export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Terms & Conditions</h1>
      <p className="mt-2 text-sm text-black/60">
        General rules for using the site and placing orders.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. Acceptance</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          By using the site, you agree to these terms. We may update content and functionality over time.
        </p>
        <h2 className="text-base font-semibold text-black">2. Orders</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          An order is considered valid after confirmation (on screen/email), depending on store settings.
        </p>
        <h2 className="text-base font-semibold text-black">3. Limitations</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Images are for presentation purposes. Minor differences may occur depending on screen/device.
        </p>
        <h2 className="text-base font-semibold text-black">4. Contact</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          For questions: support@example.com.
        </p>
      </div>
    </div>
  );
}
