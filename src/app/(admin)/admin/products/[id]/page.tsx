"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Cat = { id: string; name: string; slug: string };

type Product = {
  id: string;
  title: string;
  slug: string;
  sku: string;
  shortDesc: string | null;
  description: string | null;
  categoryId: string;

  price: number; // cents
  priceOld: number | null; // cents

  stock: number;
  inStock: boolean;

  image: string | null;

  persons: number | null;
  pieces: number | null;
  sheetType: string | null;
  modelType: string | null;
  size: string | null;
  places: number | null;

  isFeaturedDiscounts: boolean;
  isFeaturedBest: boolean;
};

function centsToLeiString(cents: number | null | undefined) {
  if (!cents && cents !== 0) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [cats, setCats] = useState<Cat[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // fields
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [priceLei, setPriceLei] = useState("");
  const [priceOldLei, setPriceOldLei] = useState("");

  const [stock, setStock] = useState<number>(0);
  const [inStock, setInStock] = useState<boolean>(true);

  const [image, setImage] = useState("");

  const [persons, setPersons] = useState<string>("");
  const [pieces, setPieces] = useState<string>("");
  const [sheetType, setSheetType] = useState<string>("");
  const [modelType, setModelType] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [places, setPlaces] = useState<string>("");

  const [isFeaturedDiscounts, setIsFeaturedDiscounts] = useState(false);
  const [isFeaturedBest, setIsFeaturedBest] = useState(false);

  // 1) load categories
  useEffect(() => {
    let cancelled = false;
    async function loadCats() {
      setLoadingCats(true);
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Error loading categories.");
        if (!cancelled) setCats(json.items || []);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Unknown error.");
      } finally {
        if (!cancelled) setLoadingCats(false);
      }
    }
    loadCats();
    return () => {
      cancelled = true;
    };
  }, []);

  // 2) load product + populate form
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function loadProduct() {
      setErr(null);
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/products/${id}`, { cache: "no-store" });
        const json = (await res.json().catch(() => null)) as Product | any;
        if (!res.ok) throw new Error(json?.error || "Error loading product.");

        const p: Product = json;

        if (cancelled) return;

        setTitle(p.title || "");
        setSku(p.sku || "");
        setSlug(p.slug || "");
        setShortDesc(p.shortDesc || "");
        setDescription(p.description || "");
        setCategoryId(p.categoryId || "");

        setPriceLei(centsToLeiString(p.price));
        setPriceOldLei(p.priceOld ? centsToLeiString(p.priceOld) : "");

        setStock(Number.isFinite(p.stock) ? p.stock : 0);
        setInStock(!!p.inStock);

        setImage(p.image || "");

        setPersons(p.persons == null ? "" : String(p.persons));
        setPieces(p.pieces == null ? "" : String(p.pieces));
        setSheetType(p.sheetType || "");
        setModelType(p.modelType || "");
        setSize(p.size || "");
        setPlaces(p.places == null ? "" : String(p.places));

        setIsFeaturedDiscounts(!!p.isFeaturedDiscounts);
        setIsFeaturedBest(!!p.isFeaturedBest);
      } catch (e: any) {
        if (!cancelled) setErr(e?.message || "Unknown error.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const canSave = useMemo(() => {
    return title.trim() && sku.trim() && categoryId && priceLei.trim();
  }, [title, sku, categoryId, priceLei]);

  async function onSave() {
    if (!id) return;
    setErr(null);

    if (!canSave) {
      setErr("Required: Title, SKU, Category, Price.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        sku,
        slug: slug.trim() ? slug.trim() : null,

        shortDesc: shortDesc.trim() ? shortDesc.trim() : null,
        description: description.trim() ? description.trim() : null,

        categoryId,

        priceLei,
        priceOldLei: priceOldLei.trim() ? priceOldLei : null,

        stock,
        inStock,

        image: image.trim() ? image.trim() : null,

        persons: persons === "" ? null : Number(persons),
        pieces: pieces === "" ? null : Number(pieces),
        sheetType: sheetType.trim() ? sheetType.trim() : null,
        modelType: modelType.trim() ? modelType.trim() : null,
        size: size.trim() ? size.trim() : null,
        places: places === "" ? null : Number(places),

        isFeaturedDiscounts,
        isFeaturedBest,
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Error la salvare.");

      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Unknown error.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this product? This action is irreversible.")) return;

    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Delete error.");

      router.push("/admin/products");
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Unknown error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Catalog</div>
          <div className="text-2xl font-semibold text-white">Edit product</div>
          <div className="text-sm text-white/55 mt-1">Edit, save, and changes appear instantly on the site.</div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Back
          </Link>

          <button
            onClick={onDelete}
            disabled={saving}
            className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm text-red-200 hover:bg-red-500/15 transition disabled:opacity-40"
          >
            Remove
          </button>

          <button
            onClick={onSave}
            disabled={saving || !canSave}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-8 text-sm text-white/70">
          Loading product...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Info */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="text-sm font-semibold text-white">Product information</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-white/60">Title *</div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">SKU *</div>
                <input
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="text-xs text-white/60">Slug (optional)</div>
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="text-xs text-white/60">Short description</div>
                <input
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="text-xs text-white/60">Long description</div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25 resize-none"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="text-xs text-white/60">Category *</div>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  disabled={loadingCats}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25
                             [&>option]:bg-white [&>option]:text-black"
                >
                  {cats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.slug})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Price & stock */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="text-sm font-semibold text-white">Price & Stoc</div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">Price (USD) *</div>
              <input
                value={priceLei}
                onChange={(e) => setPriceLei(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">Old price (USD)</div>
              <input
                value={priceOldLei}
                onChange={(e) => setPriceOldLei(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-white/60">Stock</div>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Math.max(0, Math.floor(Number(e.target.value))))}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">Available</div>
                <button
                  type="button"
                  onClick={() => setInStock((v) => !v)}
                  className={`w-full rounded-2xl border px-4 py-2 text-sm transition ${
                    inStock
                      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                      : "border-red-400/30 bg-red-400/10 text-red-200"
                  }`}
                >
                  {inStock ? "In stock" : "Stoc 0"}
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={isFeaturedDiscounts}
                  onChange={(e) => setIsFeaturedDiscounts(e.target.checked)}
                />
                Featured: Discounts
              </label>

              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={isFeaturedBest}
                  onChange={(e) => setIsFeaturedBest(e.target.checked)}
                />
                Featured: Best
              </label>
            </div>
          </div>

          {/* Filters */}
          <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
            <div className="text-sm font-semibold text-white">Filters / Atribute</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <div className="text-xs text-white/60">Attribute: Persons</div>
                <input
                  value={persons}
                  onChange={(e) => setPersons(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">Parts</div>
                <input
                  value={pieces}
                  onChange={(e) => setPieces(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">Options</div>
                <input
                  value={sheetType}
                  onChange={(e) => setSheetType(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">Model</div>
                <input
                  value={modelType}
                  onChange={(e) => setModelType(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">Size</div>
                <input
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <div className="text-xs text-white/60">Attribute: Places</div>
                <input
                  value={places}
                  onChange={(e) => setPlaces(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
            <div className="text-sm font-semibold text-white">Main image</div>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              placeholder="/products/p1.jpeg sau https://..."
            />

            {image ? (
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt="" className="w-full h-40 object-cover rounded-xl" />
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}