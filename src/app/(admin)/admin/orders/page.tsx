"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type OrderRow = {
  id: string;
  orderNo: number;
  status: string;
  paymentMethod: string;
  total: number; // bani (centi)
  createdAt: string;
  itemsCount: number;
  customerName: string;
};

type ApiResponse = {
  items: OrderRow[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

const money = (centi: number) => (centi / 100).toFixed(2).replace(".", ",");

function statusLabel(s: string) {
  if (s === "NEW" || s === "PENDING") return "New";
  if (s === "PROCESSING") return "Processing";
  if (s === "FINALIZED") return "Finalized";
  if (s === "CANCELLED") return "Cancelled";
  return s;
}

export default function AdminOrdersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const queryKey = useMemo(() => `${page}:${q}`, [page, q]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const sp = new URLSearchParams();
        sp.set("page", String(page));
        sp.set("limit", "20");
        if (q.trim()) sp.set("q", q.trim());

        const res = await fetch(`/api/admin/orders?${sp.toString()}`, { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Error loading orders.");
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Unknown error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [queryKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <div className="text-sm text-white/60">Orders</div>
          <div className="text-xl font-semibold text-white">List of orders</div>
        </div>

        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search by name / email / phone / company..."
          className="w-full md:w-[420px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="grid grid-cols-[1.2fr_.8fr_.6fr_.6fr_.6fr_.6fr] gap-3 px-4 py-3 text-xs text-white/60 border-b border-white/10">
          <div>Order</div>
          <div>Customer</div>
          <div>Products</div>
          <div>Payment</div>
          <div>Status</div>
          <div className="text-right">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-white/70">Loading...</div>
        ) : err ? (
          <div className="px-4 py-8 text-sm text-red-300">{err}</div>
        ) : !data?.items?.length ? (
          <div className="px-4 py-8 text-sm text-white/70">No orders found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {data.items.map((o) => (
              <div key={o.id} className="grid grid-cols-[1.2fr_.8fr_.6fr_.6fr_.6fr_.6fr] gap-3 px-4 py-4 items-center">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white">#{o.orderNo}</div>
                  <div className="text-xs text-white/60">{new Date(o.createdAt).toLocaleString("en-US")}</div>
                  <div className="text-xs text-white/70 mt-1">
  Total: <span className="text-white font-semibold">{formatMoney(o.total)}</span>
</div>
                </div>

                <div className="text-sm text-white/85 line-clamp-1">{o.customerName}</div>
                <div className="text-sm text-white/85">{o.itemsCount}</div>
                <div className="text-sm text-white/85">{o.paymentMethod}</div>

                <div className="text-sm">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/85">
                    {statusLabel(o.status)}
                  </span>
                </div>

                <div className="text-right">
                  <Link
                    href={`/admin/orders/${o.id}`}
                    className="inline-flex rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data ? (
        <div className="flex items-center justify-between text-sm text-white/70">
          <div>Total: <span className="text-white font-semibold">{data.total}</span></div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 disabled:opacity-40"
              disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>←</button>
            <div className="text-xs text-white/70">
              Pagina <span className="text-white font-semibold">{data.page}</span> / {data.pages}
            </div>
            <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 disabled:opacity-40"
              disabled={page >= data.pages} onClick={() => setPage((p) => p + 1)}>→</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}