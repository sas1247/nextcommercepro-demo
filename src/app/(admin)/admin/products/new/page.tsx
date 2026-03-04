"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Cat = { id: string; name: string; slug: string };

export default function AdminNewProductPage() {
  const router = useRouter();

  const [cats, setCats] = useState<Cat[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [shortDesc, setShortDesc] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");

  const [priceLei, setPriceLei] = useState(""); // "259,99"
  const [priceOldLei, setPriceOldLei] = useState("");

  const [stock, setStock] = useState<number>(0);
  const [inStock, setInStock] = useState(true);

  const [image, setImage] = useState("");
  const [uploading, setUploading] = useState(false);

  // filtre
  const [persons, setPersons] = useState<string>("");
  const [pieces, setPieces] = useState<string>("");
  const [sheetType, setSheetType] = useState<string>("");
  const [modelType, setModelType] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [places, setPlaces] = useState<string>("");

  // featured
  const [isFeaturedDiscounts, setIsFeaturedDiscounts] = useState(false);
  const [isFeaturedBest, setIsFeaturedBest] = useState(false);

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCats() {
      setLoadingCats(true);
      try {
        const res = await fetch("/api/admin/categories", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (!res.ok) throw new Error(json?.error || "Error loading categories.");
        if (!cancelled) {
          setCats(json.items || []);
          if (!categoryId && json.items?.[0]?.id) setCategoryId(json.items[0].id);
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // NOTE: translated template comment.
  useEffect(() => {
    if (stock <= 0) setInStock(false);
    else setInStock(true);
  }, [stock]);

  const canSave = useMemo(() => {
    return title.trim() && sku.trim() && categoryId && priceLei.trim();
  }, [title, sku, categoryId, priceLei]);

  async function onSave() {
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

      const res = await fetch("/api/admin/products", {
        method: "POST",
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

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Catalogue</div>
          <div className="text-2xl font-semibold text-white">Add product</div>
          <div className="text-sm text-white/55 mt-1">Fill in, save, and the product appears instantly in the list.</div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/products"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Back
          </Link>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CARD: Info */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="text-sm font-semibold text-white">Product information</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Title *</div>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                placeholder="ex: Lenjerie Finet/Satin – Negru Elegant"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">SKU *</div>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                placeholder="ex: ASTA-FINET-0015"
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/60">Short description</div>
              <input
                value={shortDesc}
                onChange={(e) => setShortDesc(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
                placeholder="ex: Material premium, imprimeu elegant, set complet."
              />
            </div>

            <div className="space-y-1 md:col-span-2">
  <div className="text-xs text-white/60">Long description</div>
  <textarea
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    rows={6}
    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25 resize-none"
    placeholder="Write the full description (shown on the product page under “Description”)."
  />
</div>

            <div className="space-y-1 md:col-span-2">
              <div className="text-xs text-white/60">Categorie *</div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCats}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25
           [&>option]:bg-white [&>option]:text-black"
              >
                {cats.map((c) => (
                  <option
  key={c.id}
  value={c.id}
  className="bg-white text-black"
>
                    {c.name} ({c.slug})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* CARD: Price & stoc */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="text-sm font-semibold text-white">Price & Stoc</div>

          <div className="space-y-1">
            <div className="text-xs text-white/60">Price (USD) *</div>
            <input
              value={priceLei}
              onChange={(e) => setPriceLei(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="ex: 259,99"
            />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-white/60">Price vechi (USD)</div>
            <input
              value={priceOldLei}
              onChange={(e) => setPriceOldLei(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              placeholder="ex: 319,99"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Stoc</div>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(Math.max(0, Math.floor(Number(e.target.value))))}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">
Available</div>
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
              Featured: Reduceri
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

        {/* CARD: Filters */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="text-sm font-semibold text-white">Filters / Atribute</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Attribute: Persons</div>
              <input
                value={persons}
                onChange={(e) => setPersons(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                placeholder="1 / 2"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">Parts</div>
              <input
                value={pieces}
                onChange={(e) => setPieces(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                placeholder="3 / 4 / 6 / 8"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">Option</div>
              <input
                value={sheetType}
                onChange={(e) => setSheetType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                placeholder='elastic / fara'
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">
Exemplary</div>
              <input
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                placeholder='3d / imprimat / dungi / satinat'
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">Size</div>
              <input
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                placeholder="ex: 160x200"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">Attribute: Places</div>
              <input
                value={places}
                onChange={(e) => setPlaces(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
                placeholder="1 / 2 / 3 / 4"
              />
            </div>
          </div>
        </div>

        {/* CARD: Imagine */}
<div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
  <div className="text-sm font-semibold text-white">Main image</div>
  <div className="text-xs text-white/60">
    Select an image and it will upload automatically to Supabase.
  </div>

  <input
    type="file"
    accept="image/*"
    className="block w-full text-sm text-white"
    onChange={async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setErr(null);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const json = await res.json().catch(() => null);

        if (res.ok) {
          setImage(json.url);
        } else {
          setErr(json?.error || "Upload failed");
        }
      } catch (err: any) {
        setErr(err?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    }}
  />

  {uploading ? (
    <div className="text-xs text-white/60">Uploading image...</div>
  ) : null}

  {image ? (
    <div className="mt-2 rounded-2xl border border-white/10 bg-white/5 p-2">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
    </div>
  ) : null}
</div>
      </div>
    </div>
  );
}