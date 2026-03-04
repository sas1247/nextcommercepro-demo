"use client";

import { useEffect, useMemo, useState } from "react";

type Report = any;

const LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";
const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";

const nfMoney = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (cents: number) => nfMoney.format((Number(cents) || 0) / 100);

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function downloadText(filename: string, content: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export default function AdminReportsPage() {
  const today = useMemo(() => new Date(), []);
  const [from, setFrom] = useState(toYMD(today));
  const [to, setTo] = useState(toYMD(today));

  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const key = useMemo(() => `${from}:${to}`, [from, to]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    fetch(`/api/admin/reports?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      cache: "no-store" as RequestCache,
    })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error || "Error loading reports.");
        return j;
      })
      .then((j) => alive && setData(j))
      .catch((e: any) => alive && setErr(e?.message || "Error"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [key]);

  function quick(days: number) {
    const d2 = new Date();
    const d1 = new Date();
    d1.setDate(d2.getDate() - (days - 1));
    setFrom(toYMD(d1));
    setTo(toYMD(d2));
  }

  function exportOrdersCSV() {
    if (!data?.orders) return;

    const rows = [
      ["orderNo", "createdAt", "status", "paymentMethod", "name", "email", "phone", "itemsCount", "total"],
      ...data.orders.map((o: any) => [
        o.orderNo,
        new Date(o.createdAt).toLocaleString("en-US"),
        o.status,
        o.paymentMethod,
        o.name,
        o.email,
        o.phone,
        o.itemsCount,
        ((Number(o.total) || 0) / 100).toFixed(2).replace(".", ","),
      ]),
    ];

    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    downloadText(`raport-orders_${from}_${to}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportCustomersCSV() {
    if (!data?.topCustomers) return;

    const rows = [
      ["email", "name", "phone", "ordersCount", "productsCount", "totalSpent"],
      ...data.topCustomers.map((c: any) => [
        c.email,
        c.name,
        c.phone,
        c.ordersCount,
        c.productsCount,
        ((Number(c.totalSpent) || 0) / 100).toFixed(2).replace(".", ","),
      ]),
    ];

    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    downloadText(`raport-clienti_${from}_${to}.csv`, csv, "text/csv;charset=utf-8");
  }

  function exportProductsCSV() {
    if (!data?.topProducts) return;

    const rows = [
      ["title", "sku", "qty", "revenue"],
      ...data.topProducts.map((p: any) => [
        p.title,
        p.sku || "",
        p.qty,
        ((Number(p.revenue) || 0) / 100).toFixed(2).replace(".", ","),
      ]),
    ];

    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    downloadText(`raport-products_${from}_${to}.csv`, csv, "text/csv;charset=utf-8");
  }

  const k = data?.kpis;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Catalog</div>
          <div className="text-2xl font-semibold text-white">Reports</div>
          <div className="text-sm text-white/55 mt-1">Orders, sales, customers + CSV export.</div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => quick(1)}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
          >
            Today
          </button>
          <button
            onClick={() => quick(7)}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
          >
            7 days
          </button>
          <button
            onClick={() => quick(30)}
            className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
          >
            30 days
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-col md:flex-row md:items-end gap-3 md:justify-between">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Start</div>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">To</div>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportOrdersCSV}
              disabled={!data?.orders?.length}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition disabled:opacity-40"
            >
              Export orders (CSV)
            </button>
            <button
              onClick={exportCustomersCSV}
              disabled={!data?.topCustomers?.length}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition disabled:opacity-40"
            >
              Export customers (CSV)
            </button>
            <button
              onClick={exportProductsCSV}
              disabled={!data?.topProducts?.length}
              className="rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
              style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
            >
              Export products (CSV)
            </button>
          </div>
        </div>

        {loading ? <div className="mt-3 text-sm text-white/70">Loading...</div> : null}
        {err ? <div className="mt-3 text-sm text-red-200">{err}</div> : null}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Kpi title="Orders" value={k ? String(k.ordersCount) : "—"} />
        <Kpi title="Products sold" value={k ? String(k.itemsCount) : "—"} />
        <Kpi title="Sales" value={k ? money(k.revenue) : "—"} />
        <Kpi title="Medium card" value={k ? money(k.avgOrder) : "—"} />
      </div>

      {/* Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Status orders</div>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            {data?.statusCounts
              ? Object.entries(data.statusCounts).map(([s, n]: any) => (
                  <div key={s} className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/80">{s}</span>
                    <span className="font-semibold text-white">{n}</span>
                  </div>
                ))
              : <div className="text-white/60">—</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Payment method</div>
          <div className="mt-3 space-y-2 text-sm text-white/85">
            {data?.paymentCounts
              ? Object.entries(data.paymentCounts).map(([s, n]: any) => (
                  <div key={s} className="flex justify-between border-b border-white/10 pb-2">
                    <span className="text-white/80">{s}</span>
                    <span className="font-semibold text-white">{n}</span>
                  </div>
                ))
              : <div className="text-white/60">—</div>}
          </div>
        </div>
      </div>

      {/* Top tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Top products (by sales)</div>
          <div className="mt-3 divide-y divide-white/10">
            {(data?.topProducts || []).slice(0, 10).map((p: any, idx: number) => (
              <div key={p.key} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white font-semibold line-clamp-1">{idx + 1}. {p.title}</div>
                  <div className="text-xs text-white/60">SKU: {p.sku || "-"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white font-semibold">{money(p.revenue)}</div>
                  <div className="text-xs text-white/60">{p.qty} pcs</div>
                </div>
              </div>
            ))}
            {!data?.topProducts?.length ? <div className="py-3 text-sm text-white/60">—</div> : null}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">Top customers (by value)</div>
          <div className="mt-3 divide-y divide-white/10">
            {(data?.topCustomers || []).slice(0, 10).map((c: any, idx: number) => (
              <div key={c.email} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white font-semibold line-clamp-1">{idx + 1}. {c.name || "-"}</div>
                  <div className="text-xs text-white/60 line-clamp-1">{c.email}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white font-semibold">{money(c.totalSpent)}</div>
                  <div className="text-xs text-white/60">{c.ordersCount} orders • {c.productsCount} products</div>
                </div>
              </div>
            ))}
            {!data?.topCustomers?.length ? <div className="py-3 text-sm text-white/60">—</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-white/60">{title}</div>
      <div className="mt-2 text-xl font-semibold text-white">{value}</div>
    </div>
  );
}