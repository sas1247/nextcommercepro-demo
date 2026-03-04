"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

function setParam(url: URL, key: string, value?: string) {
  if (!value) url.searchParams.delete(key);
  else url.searchParams.set(key, value);
}

export default function CategoryFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const current = useMemo(() => {
    return {
      min: sp.get("min") ?? "",
      max: sp.get("max") ?? "",
      sort: sp.get("sort") ?? "newest",
    };
  }, [sp]);

  const [min, setMin] = useState(current.min);
  const [max, setMax] = useState(current.max);
  const [sort, setSort] = useState(current.sort);

  function apply() {
    const url = new URL(window.location.href);

    // NOTE: translated template comment.
    setParam(url, "page", "1");

    setParam(url, "min", min.trim() || undefined);
    setParam(url, "max", max.trim() || undefined);
    setParam(url, "sort", sort || "newest");

    router.push(`${pathname}?${url.searchParams.toString()}`);
  }

  function clearAll() {
    router.push(`${pathname}`);
  }

  return (
    <aside className="sticky top-24 space-y-6">
      <div className="rounded-2xl border border-black/10 bg-white p-4">
        <h3 className="text-sm font-semibold text-black">Filters</h3>

        <div className="mt-4">
          <label className="text-xs font-medium text-neutral-600">Price (bani)</label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <input
              value={min}
              onChange={(e) => setMin(e.target.value)}
              placeholder="Min (ex: 15000)"
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3533cd]/30"
            />
            <input
              value={max}
              onChange={(e) => setMax(e.target.value)}
              placeholder="Max (ex: 30000)"
              className="w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3533cd]/30"
            />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">
            * NOTE: filters use cents internally (money×100).
          </p>
        </div>

        <div className="mt-5">
          <label className="text-xs font-medium text-neutral-600">Sortare</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="mt-2 w-full rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#3533cd]/30"
          >
            <option value="newest">Cele mai noi</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="discount">Discount mare</option>
          </select>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={apply}
            className="flex-1 rounded-xl px-3 py-2 text-sm font-semibold text-white
                       bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
          >
            Apply
          </button>
          <button
            onClick={clearAll}
            className="rounded-xl px-3 py-2 text-sm font-semibold border border-black/10 hover:bg-black hover:text-white transition"
          >
            Reset
          </button>
        </div>
      </div>

      {/* NOTE: translated template comment. */}
    </aside>
  );
}