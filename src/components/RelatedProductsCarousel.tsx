"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { formatMoney } from "@/lib/money";

type Item = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  image: string | null;
};

export default function RelatedProductsCarousel({
  title = "Related products",
  items,
}: {
  title?: string;
  items: Item[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const canShow = useMemo(() => items && items.length > 0, [items]);
  if (!canShow) return null;

  const scrollBy = (dx: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dx, behavior: "smooth" });
  };

  return (
    <section className="mt-10">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          <p className="text-sm text-black/60">Other products from the same category</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scrollBy(-520)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black hover:text-white transition"
            aria-label="Back"
          >
            ←
          </button>
          <button
            onClick={() => scrollBy(520)}
            className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm hover:bg-black hover:text-white transition"
            aria-label="Next"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={ref}
        className="mt-4 flex gap-4 overflow-x-auto pb-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth"
      >
        {items.map((p) => (
          <article
            key={p.id}
            className="min-w-[240px] max-w-[240px] rounded-2xl border border-black/10 bg-white overflow-hidden"
          >
            <Link href={`/produs/${p.slug}`} className="block">
              <div className="aspect-square bg-neutral-50 overflow-hidden">
                <img
                  src={p.image ?? "/products/placeholder.jpeg"}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.04]"
                />
              </div>
            </Link>

            <div className="p-3">
              <Link href={`/produs/${p.slug}`} className="block">
                <h3 className="text-sm font-medium text-black line-clamp-2">{p.title}</h3>
              </Link>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm font-semibold text-black">{formatMoney(p.price)}</span>
                {p.priceOld ? (
                  <span className="text-xs text-black/40 line-through">{formatMoney(p.priceOld)}</span>
                ) : null}
              </div>

              <div className="mt-3 flex gap-2">
                <Link
                  href={`/produs/${p.slug}`}
                  className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white
                             bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition text-center"
                >
                  View product
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}