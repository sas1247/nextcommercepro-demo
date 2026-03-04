import Link from "next/link";

type Props = {
  searchParams: {
    orderNo?: string;
    order?: string;
  };
};

export default function SuccessPage({ searchParams }: Props) {
  // nou: orderNo
  const orderNo = searchParams?.orderNo;

  // vechi: order id (fallback)
  const orderId = searchParams?.order;

  const prettyOrderNo = orderNo ? `ASTA${orderNo}` : null;

  const shortId =
    orderId && orderId.length > 10 ? `${orderId.slice(0, 6)}...${orderId.slice(-4)}` : orderId ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-3xl border border-black/10 bg-white p-8">
        <div className="text-2xl font-semibold">Thank you!</div>

        <div className="mt-2 text-sm text-black/60">
          Your order has been placed.
          {prettyOrderNo ? (
            <>
              {" "}
              Order number: <span className="font-semibold text-black">{prettyOrderNo}</span>
            </>
          ) : shortId ? (
            <>
              {" "}
              Order number: <span className="font-semibold text-black">{shortId}</span>
            </>
          ) : null}
        </div>

        <div className="mt-4 rounded-2xl border border-black/10 bg-neutral-50 p-4 text-sm text-black/70">
          You will receive an email shortly with your order details and confirmation.
        </div>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-black to-[#3533cd]"
        >
          Back to store
        </Link>
      </div>
    </div>
  );
}