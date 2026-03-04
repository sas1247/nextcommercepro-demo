export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Commercial Terms</h1>
      <p className="mt-2 text-sm text-black/60">
        Information about orders, pricing, payments, and invoicing.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. Pricing</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Product prices are shown on the site and may be updated without prior notice. The final price is the one displayed at the time of checkout.
        </p>
        <h2 className="text-base font-semibold text-black">2. Payments</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          We offer online card payments (via Stripe) and/or cash on delivery (if enabled). Available payment methods are displayed during checkout.
        </p>
        <h2 className="text-base font-semibold text-black">3. Invoicing</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Billing details are provided by the customer at checkout (Individual / Company). Invoices may be delivered electronically where supported.
        </p>
        <h2 className="text-base font-semibold text-black">4. Stock</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Stock availability is indicative. In exceptional cases (stock differences), we will contact you for confirmation, replacement, or refund.
        </p>
      </div>
    </div>
  );
}
