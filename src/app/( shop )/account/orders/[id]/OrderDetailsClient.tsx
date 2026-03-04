"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatMoney } from "@/lib/money";

function fmt(d: string | Date) {
  const dt = typeof d === "string" ? new Date(d) : d;
  return dt.toLocaleString("en-US", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailsClient({ id }: { id?: string }) {
  const params = useParams();

  // ✅ ia id din prop sau direct din URL
  const orderId =
    (id && String(id)) ||
    (typeof (params as any)?.id === "string" ? String((params as any).id) : "");

  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [order, setOrder] = React.useState<any>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      if (!orderId) throw new Error("Missing id.");

      const res = await fetch(`/api/account/orders/${orderId}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) throw new Error((data as any)?.error || "Loading error.");

      setOrder((data as any).order);
    } catch (e: any) {
      setErr(e?.message || "Loading error.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-6 text-sm text-black/60">Loading…</div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{err}</div>
        <Link href="/account/orders" className="mt-4 inline-flex text-sm font-semibold hover:underline">
          ← Back to orders
        </Link>
      </main>
    );
  }

  if (!order) return null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order.orderNo}</h1>
          <div className="mt-1 text-sm text-black/60">{fmt(order.createdAt)}</div>
        </div>
        <Link
          href="/account/orders"
          className="rounded-xl border border-black/10 bg-white px-4 py-2 text-sm font-semibold hover:bg-black/[0.03]"
        >
          ← Back
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        {/* products */}
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-sm font-semibold">Products</div>

          <div className="mt-4 space-y-3">
            {(order.items || []).map((it: any) => (
              <div key={it.id} className="flex items-center gap-3 rounded-2xl border border-black/10 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={it.image ?? "/products/placeholder.jpeg"}
                  alt={it.title}
                  className="h-14 w-14 rounded-xl object-cover bg-neutral-50"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold line-clamp-1">{it.title}</div>
                  <div className="mt-1 text-xs text-black/60">
                    {it.qty} x {formatMoney(it.price)}
                  </div>
                </div>
                <div className="text-sm font-semibold">{formatMoney(it.price * it.qty)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* sumar */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 h-fit">
          <div className="text-sm font-semibold">Sumar</div>

          <div className="mt-4 space-y-2 text-sm">
            <Row label="Status" value={order.status === "PENDING" ? "Processing" : order.status} />
            <Row label="Payment" value={order.paymentMethod === "COD" ? "Ramburs" : "Card"} />
            <div className="h-px bg-black/10 my-2" />
            <Row label="Subtotal" value={formatMoney(order.subtotal)} />
            <Row label="Discount" value={formatMoney(order.discount ?? 0)} />
            <Row label="Transport" value={formatMoney(order.shipping ?? 0)} />
            <div className="h-px bg-black/10 my-2" />
            <Row label="Total" value={<span className="font-semibold">{formatMoney(order.total)}</span>} />
          </div>

          {order.notes ? (
            <div className="mt-4 rounded-2xl border border-black/10 bg-neutral-50 p-3 text-sm">
              <div className="text-xs font-semibold text-black/60">Notes</div>
              <div className="mt-1">{order.notes}</div>
            </div>
          ) : null}
        </div>
      </div>
    </main>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-black/60">{label}</span>
      <span>{value}</span>
    </div>
  );
}