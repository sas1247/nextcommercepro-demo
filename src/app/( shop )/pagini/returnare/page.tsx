export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Returns Policy</h1>
      <p className="mt-2 text-sm text-black/60">
        Returns policy and required steps.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. General conditions</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Products can be returned in accordance with applicable law. To be accepted, items should be in good condition, unused, and with original packaging where applicable.
        </p>
        <h2 className="text-base font-semibold text-black">2. How to start a return</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Contact support@example.com with: order number, product(s), optional reason, and contact details.
        </p>
        <h2 className="text-base font-semibold text-black">3. Refunds</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Refunds are issued after receiving and inspecting returned items, using the same payment method where possible.
        </p>
      </div>
    </div>
  );
}
