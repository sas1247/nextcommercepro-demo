export default function Page() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-black">Shipping & Delivery</h1>
      <p className="mt-2 text-sm text-black/60">
        Delivery details, costs, and timelines.
      </p>

      <div className="mt-6 space-y-6 rounded-3xl border border-black/10 bg-white p-6">
        <h2 className="text-base font-semibold text-black">1. Delivery method</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Delivery is handled by courier. The cost and estimate are shown at checkout before placing the order.
        </p>
        <h2 className="text-base font-semibold text-black">2. Shipping cost</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Shipping cost is calculated at checkout. If a free-shipping rule is configured (e.g., above a certain subtotal), it is applied automatically.
        </p>
        <h2 className="text-base font-semibold text-black">3. Delivery timeline</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Delivery time depends on product availability and the courier. During peak periods (campaigns/holidays), delays may occur.
        </p>
        <h2 className="text-base font-semibold text-black">4. Package inspection</h2>
        <p className="mt-2 text-sm text-black/70 whitespace-pre-line">
          Please check package integrity on delivery. If you notice damage, request a damage report from the courier.
        </p>
      </div>
    </div>
  );
}
