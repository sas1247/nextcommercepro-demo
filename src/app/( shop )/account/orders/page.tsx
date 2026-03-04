"use client";

import * as React from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function statusLabel(s: string) {
  const x = String(s || "").toUpperCase();
  if (x === "PAID") return "Paid";
  if (x === "CANCELLED") return "Cancelled";
  if (x === "REFUNDED") return "Refunded";
  return "Processing";
}

export default function AccountOrdersPage() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [orders, setOrders] = React.useState<any[]>([]);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/account/orders", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as any)?.error || "Loading error.");
      setOrders(Array.isArray((data as any)?.orders) ? (data as any).orders : []);
    } catch (e: any) {
      setErr(e?.message || "Eroare.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-black/60">Loading…</div>;
  }

  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">My Orders</h1>
        <p className="mt-2 text-sm text-black/60">View your orders and their details.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/60 shadow-sm">
          You don't have any orders yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-3 border-b border-black/10 bg-black/[0.02] px-4 py-3 text-xs font-semibold text-black/70">
            <div className="col-span-3">Order #</div>
            <div className="col-span-3">Data</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Payment</div>
            <div className="col-span-2 text-right">Total</div>
          </div>

          {orders.map((o) => (
            <div key={o.id} className="grid grid-cols-12 gap-3 px-4 py-4 text-sm">
              <div className="col-span-3 font-semibold">#{o.orderNo}</div>
              <div className="col-span-3 text-black/70">{fmtDate(o.createdAt)}</div>
              <div className="col-span-2 text-black/80">{statusLabel(o.status)}</div>
              <div className="col-span-2 text-black/70">{o.paymentMethod === "CARD" ? "Card" : "Ramburs"}</div>
              <div className="col-span-2 text-right font-semibold">{formatMoney(o.total)}</div>

              <div className="col-span-12 -mt-1 text-xs text-black/50">{o.itemsCount ?? 0} produse</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}