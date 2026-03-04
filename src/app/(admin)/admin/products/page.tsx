"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Item = {
  id: string;
  title: string;
  slug: string;
  sku: string | null;
  price: number; // NOTE: translated template comment.
  priceOld: number | null;
  stock: number;
  inStock: boolean;
  image: string | null;
  createdAt: string;
  category?: { name: string; slug: string } | null;
};

type ApiResponse = {
  items: Item[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

const LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";
const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";

const nfMoney = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function toUnit(v: number) {
  if (!Number.isFinite(v)) return 0;
  return v > 9999 ? v / 100 : v;
}

function formatMoney(v: number) {
  return nfMoney.format(toUnit(v));
}

export default function AdminProductsPage() {
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

        const res = await fetch(`/api/admin/products?${sp.toString()}`, {
          cache: "no-store",
        });
        const json = await res.json().catch(() => null);

        if (!res.ok) throw new Error(json?.error || "Error loading products.");
        if (!cancelled) setData(json);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Unknown error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [queryKey]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
        <div>
          <div className="text-sm text-white/60">Catalog</div>
          <div className="text-xl font-semibold text-white">Products</div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search by title / SKU / slug..."
            className="w-full md:w-[360px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25"
          />
          <Link
            href="/admin/products/new"
            className="shrink-0 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
            style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
          >
            + Add
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        {/* NOTE: translated template comment. */}
<div className="flex items-start gap-6 px-4 py-3 text-xs text-white/60 border-b border-white/10">
  <div className="flex-1 flex items-start gap-3 min-w-0">Products</div>
  <div className="w-[140px] pt-1 text-left">Price</div>
  <div className="w-[120px] pt-1">Stock</div>
  <div className="w-[120px] flex justify-end pt-1">Actions</div>
</div>

        {loading ? (
          <div className="px-4 py-8 text-sm text-white/70">Loading...</div>
        ) : err ? (
          <div className="px-4 py-8 text-sm text-red-300">{err}</div>
        ) : !data?.items?.length ? (
          <div className="px-4 py-8 text-sm text-white/70">No products found.</div>
        ) : (
          // NOTE: translated template comment.
          <div className="divide-y divide-white/10">
            {data.items.map((p) => (
              <div key={p.id} className="flex items-start gap-6 px-4 py-4">
                {/* NOTE: translated template comment. */}
                <div className="flex-1 flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-xl border border-white/10 bg-white/10 overflow-hidden shrink-0">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>

                  {/* EXACT ca poza 2 */}
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white line-clamp-1">{p.title}</div>

                    <div className="mt-0.5 text-xs text-white/70 leading-5 line-clamp-1">
                      {p.category?.name ? `${p.category.name} • ` : ""}
                      {p.sku ? `SKU: ${p.sku}` : ""}
                    </div>

                    <div className="text-xs text-white/45 line-clamp-1">/{p.slug}</div>
                  </div>
                </div>

                {/* NOTE: translated template comment. */}
                <div className="w-[140px] pt-1 text-left">
                  {p.priceOld ? (
                    <div className="text-xs text-white/45 line-through whitespace-nowrap">
                      {formatMoney(p.priceOld)}
                    </div>
                  ) : (
                    <div className="text-xs text-white/45">&nbsp;</div>
                  )}

                  <div className="text-sm font-semibold text-white whitespace-nowrap">
                    {formatMoney(p.price)}
                  </div>
                </div>

                {/* NOTE: translated template comment. */}
                <div className="w-[120px] pt-1">
                  <div className="text-sm text-white whitespace-nowrap">
                    {p.stock}{" "}
                    <span className={`text-xs ${p.inStock ? "text-emerald-300" : "text-red-300"}`}>
                      {p.inStock ? "in stock" : "out of stock"}
                    </span>
                  </div>
                </div>

                {/* NOTE: translated template comment. */}
                <div className="w-[120px] flex justify-end pt-1">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/85 hover:bg-white/10 transition"
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