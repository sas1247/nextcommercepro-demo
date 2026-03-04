"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import FavoriteButton from "@/components/FavoriteButton";
import { formatMoney } from "@/lib/money";

type Product = {
  id: string;
  title: string;
  slug: string;
  shortDesc: string | null;
  description?: string | null; // ✅ NOU
  sku: string;
  price: number;
  priceOld: number | null;
  stock: number;
  inStock: boolean;
  image: string | null;
  category?: { name: string; slug: string };

  persons?: number | null;
  pieces?: number | null;
  sheetType?: string | null;
  modelType?: string | null;
  size?: string | null;
  places?: number | null;
};

type RelatedItem = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  image: string | null;
};

type ProductsApiResponse = {
  items: RelatedItem[];
  page: number;
  pages: number;
  total: number;
  limit: number;
};

export default function ProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug || "";
  const cart = useCart();

  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  const [zoom, setZoom] = useState(false);

  const [related, setRelated] = useState<RelatedItem[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);

    fetch(`/api/products/${slug}`, { cache: "no-store" as RequestCache })
      .then(async (r) => (r.ok ? ((await r.json()) as Product) : null))
      .then((json) => {
        if (!alive) return;
        setP(json);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  // NOTE: translated template comment.
  useEffect(() => {
    if (!p?.category?.slug) return;

    let alive = true;
    setRelatedLoading(true);

    const qs = new URLSearchParams();
    qs.set("category", p.category.slug);
    qs.set("page", "1");
    qs.set("limit", "12");
    qs.set("sort", "newest");
    qs.set("min", "0");
    qs.set("max", "999999999");

    fetch(`/api/products?${qs.toString()}`, { cache: "no-store" as RequestCache })
      .then(async (r) => (r.ok ? ((await r.json()) as ProductsApiResponse) : null))
      .then((json) => {
        if (!alive) return;
        const items = (json?.items ?? []).filter((x) => x.slug !== p.slug);
        setRelated(items);
      })
      .finally(() => {
        if (!alive) return;
        setRelatedLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [p?.category?.slug, p?.slug]);

  const priceLei = useMemo(() => (p ? (p.price / 100).toFixed(2).replace(".", ",") : ""), [p]);
  const priceOldLei = useMemo(
    () => (p?.priceOld ? (p.priceOld / 100).toFixed(2).replace(".", ",") : ""),
    [p]
  );

  if (loading) {
    return <div className="mx-auto max-w-7xl px-4 py-10 text-sm text-black/60">Loading product...</div>;
  }

  if (!p) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-2xl border border-black/10 bg-white p-6">
          <div className="text-lg font-semibold">Produs inexistent</div>
          <div className="mt-2 text-sm text-black/60">The link is no longer valid or the product was removed.</div>
          <Link href="/" className="mt-4 inline-flex rounded-xl bg-black px-4 py-2 text-sm font-semibold text-white">
            Back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 space-y-6">
      {/* breadcrumbs */}
      <div className="text-xs text-black/60">
        <Link href="/" className="hover:text-black">Home</Link>
        <span className="mx-2">/</span>
        {p.category ? (
          <>
            <Link href={`/categorie/${p.category.slug}`} className="hover:text-black">
              {p.category.name}
            </Link>
            <span className="mx-2">/</span>
          </>
        ) : null}
        <span className="text-black">{p.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        {/* IMAGE */}
        <div className="space-y-3">
          <button
            onClick={() => setZoom(true)}
            className="group relative w-full overflow-hidden rounded-3xl border border-black/10 bg-neutral-50"
            aria-label="Zoom imagine"
          >
            <div className="aspect-square max-h-[520px] w-full">
              <img
                src={p.image ?? "/products/placeholder.jpeg"}
                alt={p.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>

            <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-black shadow">
              Click for zoom
            </div>
          </button>

          {/* tags */}
          <div className="flex flex-wrap gap-2">
            {p.persons ? <Tag>{p.persons} pers.</Tag> : null}
            {p.pieces ? <Tag>{p.pieces} piese</Tag> : null}
            {p.sheetType ? <Tag>Attribute: {p.sheetType === "elastic" ? "elastic" : "option A"}</Tag> : null}
            {p.modelType ? <Tag>Model: {p.modelType}</Tag> : null}
            {p.size ? <Tag>Dim: {p.size.replace("x", " x ")}</Tag> : null}
          </div>
        </div>

        {/* INFO */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 space-y-4">
          <div>
            <h1 className="text-2xl font-semibold text-black">{p.title}</h1>
            {p.shortDesc ? <p className="mt-2 text-sm text-black/70">{p.shortDesc}</p> : null}
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-black/60">Product code: <span className="font-semibold text-black">{p.sku}</span></div>
            <div className={`text-xs font-semibold ${p.inStock ? "text-emerald-600" : "text-red-600"}`}>
              {p.inStock ? `In stock (${p.stock})` : "Out of stock"}
            </div>
          </div>

          {/* price */}
          {/* price */}
<div className="flex items-end gap-3">
  <div className="text-2xl font-semibold text-black">{formatMoney(p.price)}</div>
  {p.priceOld ? (
    <div className="text-sm text-black/40 line-through">{formatMoney(p.priceOld)}</div>
  ) : null}
</div>

          {/* free shipping note */}
          <div className="rounded-2xl border border-black/10 bg-neutral-50 p-3 text-sm">
            <span className="font-semibold">Free shipping</span> for orders over <span className="font-semibold">{formatMoney(40000)}</span>.
          </div>

          {/* qty + actions */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="text-sm font-semibold">
                                                   Amount</div>
              <div className="inline-flex items-center rounded-2xl border border-black/10 overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-sm hover:bg-black hover:text-white transition"
                >
                  -
                </button>
                <div className="w-12 text-center text-sm font-semibold">{qty}</div>
                <button
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="px-3 py-2 text-sm hover:bg-black hover:text-white transition"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
  disabled={!p.inStock}
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
      qty
    )
  }
  className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white
             bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition disabled:opacity-50"
>
  Add to cart
</button>

              <FavoriteButton
  productId={p.id}
  className="w-10 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
/>
            </div>

            <div className="text-[12px] text-black/60">
              Cash on delivery or online with card. Easy return.
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-semibold">✓</span>
                <span>Premium materials</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-semibold">✓</span>
                <span>Durable constructiony</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-semibold">✓</span>
                <span>Fast delivery</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-lg font-semibold">Description</div>
          <div className="mt-3 text-sm text-black/70 leading-relaxed">
            {p.description?.trim() || p.shortDesc?.trim()}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-lg font-semibold">Features</div>
          <ul className="mt-3 space-y-2 text-sm text-black/70">
            <li><span className="font-semibold text-black">Category:</span> {p.category?.name ?? "-"}</li>
            <li><span className="font-semibold text-black">Size:</span> {p.size ?? "-"}</li>
            <li><span className="font-semibold text-black">Model:</span> {p.modelType ?? "-"}</li>
            <li><span className="font-semibold text-black">Attribute:</span> {p.sheetType ?? "-"}</li>
            <li><span className="font-semibold text-black">Parts:</span> {p.pieces ?? "-"}</li>
            <li><span className="font-semibold text-black">Number of people:</span> {p.persons ?? "-"}</li>
          </ul>
        </div>
      </div>

      {/* ✅ Similar products */}
      <RelatedProductsCarousel
        title={p.category?.name ? `Similar products from ${p.category.name}` : "Similar products "}
        items={related}
        loading={relatedLoading}
      />

      {/* Zoom modal */}
      {zoom ? (
        <div
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setZoom(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="mx-auto max-w-5xl h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full overflow-hidden rounded-3xl bg-black">
              <img
                src={p.image ?? "/products/placeholder.jpeg"}
                alt={p.title}
                className="w-full max-h-[85vh] object-contain"
              />
              <button
                onClick={() => setZoom(false)}
                className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-2 text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/70">
      {children}
    </span>
  );
}

function RelatedProductsCarousel({
  title,
  items,
  loading,
}: {
  title: string;
  items: RelatedItem[];
  loading: boolean;
}) {
  const money = (centi: number) => (centi / 100).toFixed(2).replace(".", ",");

  if (loading) {
    return (
      <div className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="text-lg font-semibold">{title}</div>
        <div className="mt-2 text-sm text-black/60">Loading similar products...</div>
      </div>
    );
  }

  if (!items || items.length === 0) return null;

  return (
    <section className="rounded-3xl border border-black/10 bg-white p-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">{title}</div>
          <div className="mt-1 text-sm text-black/60">Other products from the same category</div>
        </div>
      </div>

      <div className="mt-4 flex gap-4 overflow-x-auto pb-3 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {items.map((x) => (
          <article
            key={x.id}
            className="min-w-[240px] max-w-[240px] rounded-2xl border border-black/10 bg-white overflow-hidden"
          >
            <Link href={`/produs/${x.slug}`} className="block">
              <div className="aspect-square bg-neutral-50 overflow-hidden">
                <img
                  src={x.image ?? "/products/placeholder.jpeg"}
                  alt={x.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.04]"
                />
              </div>
            </Link>

            <div className="p-3">
              <Link href={`/produs/${x.slug}`} className="block">
                <h3 className="text-sm font-medium text-black line-clamp-2">{x.title}</h3>
              </Link>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-black">
                {formatMoney(x.price)}
                </span>
                {x.priceOld ? (
                  <span className="text-xs text-black/40 line-through">
                {formatMoney(x.priceOld)}
                </span>
                ) : null}
              </div>

              <div className="mt-3">
                <Link
                  href={`/produs/${x.slug}`}
                  className="block rounded-xl px-3 py-2 text-xs font-semibold text-white
                             bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition text-center"
                >
                  
See product
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}