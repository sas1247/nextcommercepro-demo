"use client";

import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import FavoriteButton from "@/components/FavoriteButton";
import { formatMoney } from "@/lib/money";

type Item = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  image: string | null;
  inStock: boolean;
  stock: number;
  category?: { name: string; slug: string };

  // filtre (optional)
  persons?: number | null;
  pieces?: number | null;
  sheetType?: string | null;
  modelType?: string | null;
  size?: string | null;
  places?: number | null;
};

type ApiResponse = {
  items: Item[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

function toInt(v: string | null, fallback: number) {
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function parseList(v: string | null) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntList(v: string | null) {
  return parseList(v)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

function toggleNumber(list: number[], value: number) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

function toggleString(list: string[], value: string) {
  return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
}

export default function CategoryPage() {
  const params = useParams<{ slug: string }>();
  const sp = useSearchParams();
  const router = useRouter();
  const cart = useCart();

  const categorySlug = params?.slug || "";
  const isPaturi = categorySlug === "category-six";

  // ✅ mobile: we want default products (tab)
  const [mobileTab, setMobileTab] = useState<"products" | "filters">("products");

  // --- Read initial state from URL ---
  const page = Math.max(1, toInt(sp.get("page"), 1));
  const sort = sp.get("sort") || "newest";

  // NOTE: translated template comment.
  const limitRaw = toInt(sp.get("limit"), 0);
  const limitDesktopDefault = 24;
  const limitMobileDefault = 12;
  const limit = useMemo(() => {
    if (limitRaw > 0) return Math.min(48, Math.max(1, limitRaw));
    return limitMobileDefault; // NOTE: translated template comment.
  }, [limitRaw]);

  const min = Math.max(0, toInt(sp.get("min"), 0));
  const max = Math.max(min, toInt(sp.get("max"), 999999999));

  const personsInitial = parseIntList(sp.get("persons"));
  const piecesInitial = parseIntList(sp.get("pieces"));
  const placesInitial = parseIntList(sp.get("places"));

  const sheetInitial = parseList(sp.get("sheetType"));
  const modelInitial = parseList(sp.get("modelType"));
  const sizeInitial = parseList(sp.get("size"));

  // --- Controlled UI state (synced to URL) ---
  const [minInput, setMinInput] = useState<string>(min === 0 ? "" : String(min));
  const [maxInput, setMaxInput] = useState<string>(max === 999999999 ? "" : String(max));

  const [personsSel, setPersonsSel] = useState<number[]>(personsInitial);
  const [piecesSel, setPiecesSel] = useState<number[]>(piecesInitial);
  const [placesSel, setPlacesSel] = useState<number[]>(placesInitial);

  const [sheetSel, setSheetSel] = useState<string[]>(sheetInitial);
  const [modelSel, setModelSel] = useState<string[]>(modelInitial);
  const [sizeSel, setSizeSel] = useState<string[]>(sizeInitial);

  // keep inputs in sync when URL changes (back/forward)
  useEffect(() => {
    setMinInput(min === 0 ? "" : String(min));
    setMaxInput(max === 999999999 ? "" : String(max));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [min, max, categorySlug]);

  function pushUrl(next: {
    page?: number;
    min?: number;
    max?: number;
    sort?: string;
    limit?: number;
    persons?: number[];
    pieces?: number[];
    places?: number[];
    sheetType?: string[];
    modelType?: string[];
    size?: string[];
  }) {
    const q = new URLSearchParams();

    q.set("page", String(next.page ?? 1)); // 🔥 reset to 1 whenever we change filters
    q.set("sort", next.sort ?? sort);

    // NOTE: translated template comment.
    q.set("limit", String(next.limit ?? limit));

    const nextMin = typeof next.min === "number" ? next.min : min;
    const nextMax = typeof next.max === "number" ? next.max : max;

    q.set("min", String(nextMin));
    q.set("max", String(nextMax));

    const personsV = next.persons ?? personsSel;
    const piecesV = next.pieces ?? piecesSel;
    const placesV = next.places ?? placesSel;
    const sheetV = next.sheetType ?? sheetSel;
    const modelV = next.modelType ?? modelSel;
    const sizeV = next.size ?? sizeSel;

    if (personsV.length) q.set("persons", personsV.join(","));
    if (piecesV.length) q.set("pieces", piecesV.join(","));
    if (placesV.length) q.set("places", placesV.join(","));

    if (sheetV.length) q.set("sheetType", sheetV.join(","));
    if (modelV.length) q.set("modelType", modelV.join(","));
    if (sizeV.length) q.set("size", sizeV.join(","));

    router.push(`/categorie/${categorySlug}?${q.toString()}`);
  }

  // --- Build qs for API fetch (derived from URL) ---
  const qs = useMemo(() => {
    const q = new URLSearchParams();
    q.set("category", categorySlug);
    q.set("page", String(page));
    q.set("min", String(min));
    q.set("max", String(max));
    q.set("sort", sort);

    // ✅ limit din URL; default 12 pe mobil
    q.set("limit", String(limit));

    // read from URL (so it always matches)
    const personsQ = parseIntList(sp.get("persons"));
    const piecesQ = parseIntList(sp.get("pieces"));
    const placesQ = parseIntList(sp.get("places"));
    const sheetQ = parseList(sp.get("sheetType"));
    const modelQ = parseList(sp.get("modelType"));
    const sizeQ = parseList(sp.get("size"));

    if (personsQ.length) q.set("persons", personsQ.join(","));
    if (piecesQ.length) q.set("pieces", piecesQ.join(","));
    if (placesQ.length) q.set("places", placesQ.join(","));

    if (sheetQ.length) q.set("sheetType", sheetQ.join(","));
    if (modelQ.length) q.set("modelType", modelQ.join(","));
    if (sizeQ.length) q.set("size", sizeQ.join(","));

    return q.toString();
  }, [categorySlug, page, min, max, sort, limit, sp]);

  const [data, setData] = useState<ApiResponse>({
    items: [],
    page,
    pages: 1,
    total: 0,
    limit,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categorySlug) return;

    let alive = true;
    setLoading(true);

    fetch(`/api/products?${qs}`, { cache: "no-store" as RequestCache })
      .then(async (r) => (r.ok ? ((await r.json()) as ApiResponse) : null))
      .then((json) => {
        if (!alive) return;
        setData(
          json ?? {
            items: [],
            page,
            pages: 1,
            total: 0,
            limit,
          }
        );
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [categorySlug, qs, page, limit]);

  const title = categorySlug ? categorySlug.replaceAll("-", " ") : "Categorie";

  // price apply (from inputs)
  function applyPrice() {
    const nextMinLei = Math.max(0, toInt(minInput || null, 0));
    const nextMaxLeiRaw = toInt(maxInput || null, 999999999);
    const nextMaxLei = Math.max(nextMinLei, nextMaxLeiRaw);

    // 🔥 convertim LEI → BANI
    const nextMin = nextMinLei * 100;
    const nextMax = nextMaxLei === 999999999 ? 999999999 : nextMaxLei * 100;

    pushUrl({ min: nextMin, max: nextMax, page: 1 });
    setMobileTab("products"); // NOTE: translated template comment.
  }

  function resetAll() {
    setMinInput("");
    setMaxInput("");
    setPersonsSel([]);
    setPiecesSel([]);
    setPlacesSel([]);
    setSheetSel([]);
    setModelSel([]);
    setSizeSel([]);
    router.push(
      `/categorie/${categorySlug}?page=1&min=0&max=999999999&sort=${sort}&limit=${limit}`
    );
    setMobileTab("products");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black capitalize">{title}</h1>
          <p className="text-sm text-neutral-600">
            {loading ? "Loading..." : `${data.total} produse`}
          </p>
        </div>
      </div>

      {/* ✅ MOBILE TABS (doar pe mobil) */}
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setMobileTab("products")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold border border-black/10 transition ${
              mobileTab === "products"
                ? "bg-gradient-to-r from-black to-[#3533cd] text-white"
                : "bg-white text-black hover:bg-black/5"
            }`}
          >
            Produse
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("filters")}
            className={`rounded-xl px-3 py-2 text-sm font-semibold border border-black/10 transition ${
              mobileTab === "filters"
                ? "bg-gradient-to-r from-black to-[#3533cd] text-white"
                : "bg-white text-black hover:bg-black/5"
            }`}
          >
            Filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* SIDEBAR */}
        <aside
          className={[
            "rounded-2xl border border-black/10 bg-white p-4 h-fit",
            "lg:sticky lg:top-[120px]",
            // NOTE: translated template comment.
            mobileTab === "filters" ? "block" : "hidden md:block",
          ].join(" ")}
        >
          <div className="text-sm font-semibold mb-4">Filters</div>

          {/* NOTE: translated template comment. */}
          <div className="mb-5">
            <div className="text-xs font-semibold text-black/70 mb-2">Price</div>
            <div className="flex gap-2">
              <input
                value={minInput}
                onChange={(e) => setMinInput(e.target.value.replace(/[^\d]/g, ""))}
                className="w-1/2 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Min"
              />
              <input
                value={maxInput}
                onChange={(e) => setMaxInput(e.target.value.replace(/[^\d]/g, ""))}
                className="w-1/2 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Max"
              />
            </div>
            <button
              onClick={applyPrice}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-black to-[#3533cd] px-3 py-2 text-sm font-semibold text-white hover:opacity-95 transition"
            >
              Apply
            </button>
          </div>

          {!isPaturi ? (
            <>
              <FilterMultiNumber
                title="Attribute: Persons"
                options={[1, 2]}
                value={personsSel}
                onToggle={(v) => {
                  const next = toggleNumber(personsSel, v);
                  setPersonsSel(next);
                  pushUrl({ persons: next, page: 1 });
                }}
              />

              <FilterMultiNumber
                title="Attribute: Pieces"
                options={[3, 4, 6, 8]}
                value={piecesSel}
                onToggle={(v) => {
                  const next = toggleNumber(piecesSel, v);
                  setPiecesSel(next);
                  pushUrl({ pieces: next, page: 1 });
                }}
              />

              <FilterMultiString
                title="Options"
                options={[
                  { label: "Option B", value: "elastic" },
                  { label: "Option A", value: "fara" },
                ]}
                value={sheetSel}
                onToggle={(v) => {
                  const next = toggleString(sheetSel, v);
                  setSheetSel(next);
                  pushUrl({ sheetType: next, page: 1 });
                }}
              />
            </>
          ) : (
            <FilterMultiNumber
              title="Attribute: Places"
              options={[1, 2, 3, 4]}
              value={placesSel}
              onToggle={(v) => {
                const next = toggleNumber(placesSel, v);
                setPlacesSel(next);
                pushUrl({ places: next, page: 1 });
              }}
            />
          )}

          <FilterMultiString
            title="Model"
            options={[
              { label: "3D", value: "3d" },
              { label: "Imprimat", value: "imprimat" },
              { label: "Dungi", value: "dungi" },
              { label: "Satinat", value: "satinat" },
              { label: "Uni", value: "uni" },
            ]}
            value={modelSel}
            onToggle={(v) => {
              const next = toggleString(modelSel, v);
              setModelSel(next);
              pushUrl({ modelType: next, page: 1 });
            }}
          />

          <FilterMultiString
            title="Size"
            options={
              isPaturi
                ? [{ label: "200 x 230", value: "200x230" }]
                : [
                    { label: "140 x 200", value: "140x200" },
                    { label: "200 x 230", value: "200x230" },
                  ]
            }
            value={sizeSel}
            onToggle={(v) => {
              const next = toggleString(sizeSel, v);
              setSizeSel(next);
              pushUrl({ size: next, page: 1 });
            }}
          />

          <button
            onClick={resetAll}
            className="mt-4 w-full rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black hover:text-white transition"
          >
            Reset filters
          </button>
        </aside>

        {/* PRODUCT LIST */}
        <section className={mobileTab === "filters" ? "hidden md:block" : "block"}>
          {loading ? (
            <div className="text-sm text-neutral-600">Loading products...</div>
          ) : data.items.length === 0 ? (
            <div className="rounded-2xl border border-black/10 bg-white p-6 text-sm text-neutral-600">
              No products found for the selected filters.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {data.items.map((p) => (
                <article
                  key={p.id}
                  className="group rounded-2xl border border-black/10 bg-white overflow-hidden"
                >
                  <Link href={`/produs/${p.slug}`} className="block">
                    <div className="aspect-[4/5] overflow-hidden bg-neutral-50">
                      <img
                        src={p.image ?? "/products/placeholder.jpeg"}
                        alt={p.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                      />
                    </div>
                  </Link>

                  <div className="p-2.5 md:p-3">
                    <Link href={`/produs/${p.slug}`} className="block">
                      <h3 className="text-xs md:text-sm font-medium text-black line-clamp-2">
                        {p.title}
                      </h3>
                    </Link>

                    <div className="mt-1.5 md:mt-2 flex items-center gap-2">
                      <span className="text-xs md:text-sm font-semibold text-black">
                        {formatMoney(p.price)}
                      </span>
                      {p.priceOld ? (
                        <span className="text-[11px] md:text-xs text-neutral-500 line-through">
                          {formatMoney(p.priceOld)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2.5 md:mt-3 flex gap-2">
                      <button
                        onClick={() =>
                          cart.add(
                            {
                              id: p.id,
                              slug: p.slug,
                              title: p.title,
                              price: p.price,
                              priceOld: p.priceOld,
                              image: p.image,
                            },
                            1
                          )
                        }
                        className="flex-1 rounded-xl px-3 py-2 text-[11px] md:text-xs font-semibold text-white
                                   bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
                      >
                        Add
                      </button>

                      <FavoriteButton
                        productId={p.id}
                        className="w-9 md:w-10 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* PAGINARE */}
          {data.pages > 1 ? (
            <div className="flex items-center justify-center gap-2 pt-6">
              {Array.from({ length: data.pages }).map((_, i) => {
                const p = i + 1;

                // NOTE: translated template comment.
                const q = new URLSearchParams(sp.toString());
                q.set("page", String(p));

                // NOTE: translated template comment.
                if (!q.get("limit")) q.set("limit", String(limit));

                const href = `/categorie/${categorySlug}?${q.toString()}`;
                const active = p === data.page;

                return (
                  <Link
                    key={p}
                    href={href}
                    className={`rounded-xl px-3 py-2 text-sm border border-black/10 transition ${
                      active ? "bg-black text-white" : "bg-white text-black hover:bg-black hover:text-white"
                    }`}
                  >
                    {p}
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function FilterMultiNumber({
  title,
  options,
  value,
  onToggle,
}: {
  title: string;
  options: number[];
  value: number[];
  onToggle: (v: number) => void;
}) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold text-black/70 mb-2">{title}</div>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.includes(opt)} onChange={() => onToggle(opt)} />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function FilterMultiString({
  title,
  options,
  value,
  onToggle,
}: {
  title: string;
  options: { label: string; value: string }[];
  value: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="mb-5">
      <div className="text-xs font-semibold text-black/70 mb-2">{title}</div>
      <div className="space-y-2">
        {options.map((opt) => (
          <label key={opt.value} className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={value.includes(opt.value)} onChange={() => onToggle(opt.value)} />
            <span>{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}