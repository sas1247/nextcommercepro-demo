"use client";

import { useEffect, useMemo, useState } from "react";

type Coupon = any;

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

export default function AdminVouchersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: Coupon[]; total: number; page: number; pages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // create form
  const [code, setCode] = useState("");
  const [amountLei, setAmountLei] = useState("");
  const [minSubtotalLei, setMinSubtotalLei] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [usageLimit, setUsageLimit] = useState("1");
  const [isActive, setIsActive] = useState(true);
  const [creating, setCreating] = useState(false);

  const key = useMemo(() => `${page}:${q}`, [page, q]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);

    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("limit", "20");
    if (q.trim()) sp.set("q", q.trim());

    fetch(`/api/admin/coupons?${sp.toString()}`, { cache: "no-store" as RequestCache })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error || "Error loading vouchers.");
        return j;
      })
      .then((j) => alive && setData(j))
      .catch((e: any) => alive && setErr(e?.message || "Error"))
      .finally(() => alive && setLoading(false));

    return () => {
      alive = false;
    };
  }, [key]);

  async function createVoucher() {
    setCreating(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim() || undefined,
          amountLei: Number(String(amountLei).replace(",", ".")),
          minSubtotalLei: Number(String(minSubtotalLei || "0").replace(",", ".")) || 0,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : "",
          usageLimit: Number(usageLimit || "1"),
          isActive,
        }),
      });
      const j = await res.json().catch(() => null);
      if (!res.ok) throw new Error(j?.error || "Error la creare voucher.");

      // reset + reload list
      setCode("");
      setAmountLei("");
      setMinSubtotalLei("");
      setExpiresAt("");
      setUsageLimit("1");
      setIsActive(true);
      setPage(1);
      // NOTE: translated template comment.
      setData(null);
      window.location.reload();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(c: any) {
    setErr(null);
    const res = await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    const j = await res.json().catch(() => null);
    if (!res.ok) return setErr(j?.error || "Error la update.");
    // refresh list
    setData((prev) =>
      prev
        ? { ...prev, items: prev.items.map((x) => (x.id === c.id ? j.coupon : x)) }
        : prev
    );
  }

  async function remove(c: any) {
    if (!confirm(`Delete voucher ${c.code}?`)) return;
    setErr(null);
    const res = await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    const j = await res.json().catch(() => null);
    if (!res.ok) return setErr(j?.error || "Delete error.");
    setData((prev) => (prev ? { ...prev, items: prev.items.filter((x) => x.id !== c.id) } : prev));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Catalog</div>
          <div className="text-2xl font-semibold text-white">Voucher</div>
          <div className="text-sm text-white/55 mt-1">
            Create codes with value, validity, and minimum cart.
          </div>
        </div>

        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1); }}
          placeholder="Search by code..."
          className="w-full max-w-[360px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
        />
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {/* Create */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Create voucher</div>

        <div className="mt-3 grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2">
            <div className="text-xs text-white/60 mb-1">Code (optional)</div>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ex: NEXT10 (empty = auto)"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </div>

          <div>
            <div className="text-xs text-white/60 mb-1">Value (USD)</div>
            <input
              value={amountLei}
              onChange={(e) => setAmountLei(e.target.value)}
              placeholder="ex: 20"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </div>

          <div>
            <div className="text-xs text-white/60 mb-1">Min cart (USD)</div>
            <input
              value={minSubtotalLei}
              onChange={(e) => setMinSubtotalLei(e.target.value)}
              placeholder="ex: 300"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </div>

          <div>
            <div className="text-xs text-white/60 mb-1">Expires at</div>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={toYMD(new Date())}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </div>

          <div>
            <div className="text-xs text-white/60 mb-1">Usage limit</div>
            <input
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              placeholder="1"
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-white/80">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            Active
          </label>

          <button
            onClick={createVoucher}
            disabled={creating}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
          >
            {creating ? "Creating..." : "Generate voucher"}
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="flex items-start gap-4 px-4 py-3 text-xs text-white/60 border-b border-white/10">
          <div className="flex-1">Cod</div>
          <div className="w-[130px] text-left">Value</div>
          <div className="w-[140px] text-left">Min cart</div>
          <div className="w-[150px] text-left">Expires</div>
          <div className="w-[150px] text-left">Uses</div>
          <div className="w-[160px] flex justify-end">Actions</div>
        </div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-white/70">Loading...</div>
        ) : !data?.items?.length ? (
          <div className="px-4 py-8 text-sm text-white/70">No vouchers found.</div>
        ) : (
          <div className="divide-y divide-white/10">
            {data.items.map((c: any) => (
              <div key={c.id} className="flex items-center gap-4 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white">{c.code}</div>
                  <div className="text-xs text-white/60">
                    {c.isActive ? "Activ" : "Inactiv"}
                  </div>
                </div>

                <div className="w-[130px] text-sm text-white whitespace-nowrap">
                  {money(c.amount)} USD
                </div>
                <div className="w-[140px] text-sm text-white whitespace-nowrap">
                  {money(c.minSubtotal)} USD
                </div>
                <div className="w-[150px] text-sm text-white/85 whitespace-nowrap">
                  {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("ro-RO") : "—"}
                </div>
                <div className="w-[150px] text-sm text-white/85 whitespace-nowrap">
                  {c.usedCount}/{c.usageLimit}
                </div>

                <div className="w-[160px] flex justify-end gap-2">
                  <button
                    onClick={() => toggleActive(c)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => remove(c)}
                    className="rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-xs text-red-200 hover:bg-red-500/15 transition"
                  >
                    Remove
                  </button>
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