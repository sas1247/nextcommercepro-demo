"use client";

import * as React from "react";
import { getLocalFavIds, removeLocalFav } from "@/lib/favorites-client";
import { formatMoney } from "@/lib/money";

export default function WishlistPage() {
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [favorites, setFavorites] = React.useState<any[]>([]);
  const [serverMode, setServerMode] = React.useState(false);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      // 1) logged-in mode: server favorites
      const res = await fetch("/api/favorites", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));

      if (res.ok && Array.isArray((data as any)?.favorites)) {
        setServerMode(true);
        setFavorites((data as any).favorites || []);
        return;
      }

      // 2) guest: localStorage
      setServerMode(false);

      const ids = getLocalFavIds();
      if (!ids.length) {
        setFavorites([]);
        return;
      }

      const r2 = await fetch("/api/products/by-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });

      const d2 = await r2.json().catch(() => ({}));
      if (!r2.ok) throw new Error((d2 as any)?.error || "Error loading products.");

      const products = Array.isArray((d2 as any)?.products) ? (d2 as any).products : [];
      setFavorites(products.map((p: any) => ({ product: p })));
    } catch (e: any) {
      setErr(e?.message || "Loading error.");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();

    const onFav = () => load();
    window.addEventListener("asta:favorites", onFav);

    const onStorage = (e: StorageEvent) => {
      if (e.key === "asta_fav_ids") load();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("asta:favorites", onFav);
      window.removeEventListener("storage", onStorage);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function remove(productId: string) {
    try {
      removeLocalFav(productId);
    } catch {
      // ignore
    }

    if (serverMode) {
      try {
        await fetch(`/api/favorites/${productId}`, { method: "DELETE" });
      } catch {
        // ignore
      }
    }

    await load();
  }

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-black/60">Loading…</div>
      </main>
    );
  }

  if (err) {
    return (
      <main className="min-h-[calc(100vh-80px)] bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{err}</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-80px)] bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-10">
        <div className="mb-4 md:mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-black">My wishlist</h1>
          <p className="mt-1 md:mt-2 text-sm text-black/60">Products you saved for later.</p>
        </div>

        {favorites.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-black/60 shadow-sm">
            You don't have any favorites yet.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {favorites.map((f) => {
              const p = f.product;
              return (
                <div key={p.id} className="rounded-2xl border border-black/10 bg-white p-3 md:p-4 shadow-sm">
                  <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-black/[0.03]">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-black/40">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="mt-2 md:mt-3">
                    <div className="text-[13px] md:text-sm font-semibold text-black line-clamp-2">{p.title}</div>
                    <div className="mt-1 text-[13px] md:text-sm text-black">
                      {formatMoney(p.price)}{" "}
                      {p.priceOld ? (
                        <span className="ml-2 text-black/40 line-through">{formatMoney(p.priceOld)}</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 md:mt-4 flex flex-col md:flex-row gap-2">
                    <a
                      href={`/produs/${p.slug}`}
                      className="w-full md:flex-1 rounded-xl border border-black/10 bg-white px-3 py-2.5 md:px-4 md:py-3 text-center text-[13px] md:text-sm font-semibold text-black hover:bg-black/[0.03]"
                    >
                      View product
                    </a>
                    <button
                      type="button"
                      onClick={() => remove(p.id)}
                      className="w-full md:w-auto rounded-xl bg-gradient-to-r from-black to-[#3533cd] px-3 py-2.5 md:px-4 md:py-3 text-[13px] md:text-sm font-semibold text-white hover:opacity-95"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}