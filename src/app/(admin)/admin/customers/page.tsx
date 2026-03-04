"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type Row = {
  id: string; // email
  email: string;
  name: string;
  phone: string;
  lastAddress: string;
  ordersCount: number;
  productsCount: number;
  totalSpent: number; // centi
  lastOrderAt: string;
};

type Api = {
  items: Row[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

const money = (centi: number) => (centi / 100).toFixed(2).replace(".", ",");

export default function AdminClientsPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<Api | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const key = useMemo(() => `${page}:${q}`, [page, q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", "20");
    if (q.trim()) sp.set("q", q.trim());

    fetch(`/api/admin/customers?${sp.toString()}`, { cache: "no-store" as RequestCache })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error || "Error loading customers.");
        return j as Api;
      })
      .then((j) => alive && setData(j))
      .catch((e: any) => alive && setErr(e?.message || "Error"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [key]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <div className="text-sm text-white/60">Catalog</div>
          <div className="text-xl font-semibold text-white">Customers</div>
        </div>

        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name / email / phone..."
          className="w-full md:w-[420px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
        />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-start gap-6 px-4 py-3 text-xs text-white/60 border-b border-white/10">
          <div className="flex-1 min-w-0">Customer</div>
          <div className="w-[120px]">Orders</div>
          <div className="w-[120px]">Products</div>
          <div className="w-[160px]">Value</div>
          <div className="w-[120px] flex justify-end">Details</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-white/70">Loading...</div>
        ) : err ? (
          <div className="px-4 py-8 text-sm text-red-300">{err}</div>
        ) : !data?.items?.length ? (
          <div className="px-4 py-8 text-sm text-white/70">No customers found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {data.items.map((c) => (
              <div key={c.id} className="flex items-start gap-6 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white line-clamp-1">{c.name}</div>
                  <div className="mt-0.5 text-xs text-white/70 line-clamp-1">{c.email}</div>
                  <div className="text-xs text-white/45 line-clamp-1">{c.phone} • {c.lastAddress}</div>
                </div>

                <div className="w-[120px] pt-1 text-sm text-white">{c.ordersCount}</div>
                <div className="w-[120px] pt-1 text-sm text-white">{c.productsCount}</div>
                <div className="w-[160px] pt-1 text-sm font-semibold text-white whitespace-nowrap">
  {formatMoney(c.totalSpent || 0)}
</div>

                <div className="w-[120px] flex justify-end pt-1">
                  <Link
                    href={`/admin/customers/${encodeURIComponent(c.email)}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
                  >
                    
                   Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {data ? (
        <div className="flex items-center justify-between text-sm text-white/70">
          <div>
            Total: <span className="text-white font-semibold">{data.total}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 disabled:opacity-40"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              ←
            </button>
            <div className="text-xs text-white/70">
              Page <span className="text-white font-semibold">{data.page}</span> / {data.pages}
            </div>
            <button
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 disabled:opacity-40"
              disabled={page >= data.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              →
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}