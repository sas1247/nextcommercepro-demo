export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Privacy Policy</h1>
      <p className="mt-2 text-sm text-black/60">
        How we collect and use your data.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. What we collect</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          We may collect data such as name, phone, email, billing/shipping address, and order-related information.
        </p>
        <h2 className="text-base font-semibold text-black">2. Why we collect it</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          We use data to process orders, deliver products, issue invoices, provide support, and (if subscribed) send newsletters.
        </p>
        <h2 className="text-base font-semibold text-black">3. Security & retention</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          We take reasonable measures to secure data and retain it only as long as needed, in line with legal obligations.
        </p>
        <h2 className="text-base font-semibold text-black">4. Your rights</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          You have the right of access, rectification, erasure, restriction, portability, and objection, as applicable under GDPR.
        </p>
      </div>
    </div>
  );
}
