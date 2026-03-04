"use client";

import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type Item = {
  id: string;
  title: string;
  slug: string;
  price: number; // cents (e.g. 21999)
  priceOld: number | null;
  image: string | null;
};

export default function MonthlyDealsCarousel({ items = [] }: { items?: Item[] }) {
  const pageSize = 5;
  const cart = useCart();

  const pages = useMemo(() => {
    const out: Item[][] = [];
    for (let i = 0; i < items.length; i += pageSize) out.push(items.slice(i, i + pageSize));
    return out.slice(0, 3); // 15 products = 3 pages
  }, [items]);


  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (pages.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % pages.length), 4000);
    return () => clearInterval(t);
  }, [pages.length]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="flex items-end justify-between gap-3 mb-4 md:mb-5">
        <div className="min-w-0">
          <h2 className="text-lg md:text-2xl font-semibold text-black leading-tight">
            Monthly deals
          </h2>
          <p className="text-xs md:text-sm text-neutral-600 mt-1">
            Top picks, now at special prices
          </p>
        </div>

        <Link
          href="/reducerile-lunii"
          className="shrink-0 inline-flex items-center justify-center rounded-xl
                     px-3 py-2 md:px-4 md:py-2
                     text-xs md:text-sm font-medium
                     whitespace-nowrap
                     border border-black/10 bg-white text-black
                     hover:text-white
                     hover:bg-gradient-to-r hover:from-black hover:to-[#3533cd]
                     transition-all duration-300"
        >
          View more
        </Link>
      </div>

      {/* Mobile: horizontal scroller */}
      <div className="md:hidden">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex gap-3 snap-x snap-mandatory">
            {items.slice(0, 15).map((p) => (
              <article
                key={p.id}
                className="snap-start shrink-0 w-[48%] rounded-2xl border border-black/10 bg-white overflow-hidden"
              >
                <a href={`/produs/${p.slug}`} className="block relative">
                  <div className="aspect-[4/5] overflow-hidden bg-neutral-50">
                    <img
                      src={p.image ?? "/products/placeholder.jpg"}
                      alt={p.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </a>

                <div className="p-2.5">
                  <a href={`/produs/${p.slug}`} className="block">
                    <h3 className="text-xs font-medium text-black line-clamp-2">
                      {p.title}
                    </h3>
                  </a>

                  <div className="mt-1.5 flex items-center gap-2">
                    <span className="text-xs font-semibold text-black">
                      {formatMoney(p.price)}
                    </span>
                    {p.priceOld ? (
                      <span className="text-[11px] text-neutral-500 line-through">
                        {formatMoney(p.priceOld)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-xl px-2.5 py-2 text-[11px] font-semibold text-white
                                 bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
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
                    >
                      Add
                    </button>

                    <FavoriteButton
                      productId={p.id}
                      className="w-9 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Desktop carousel */}
      <div className="hidden md:block">
        <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white">
          <div
            className="flex transition-transform duration-500"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {pages.map((page, pi) => (
              <div key={pi} className="w-full shrink-0 p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {page.map((p) => (
                    <article
                      key={p.id}
                      className="group rounded-2xl border border-black/10 bg-white overflow-hidden"
                    >
                      <a href={`/produs/${p.slug}`} className="block relative">
                        <div className="aspect-[4/5] overflow-hidden bg-neutral-50">
                          <img
                            src={p.image ?? "/products/placeholder.jpg"}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                          />
                        </div>
                      </a>

                      <div className="p-3">
                        <a href={`/produs/${p.slug}`} className="block">
                          <h3 className="text-sm font-medium text-black line-clamp-2">
                            {p.title}
                          </h3>
                        </a>

                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm font-semibold text-black">
                            {formatMoney(p.price)}
                          </span>
                          {p.priceOld ? (
                            <span className="text-xs text-neutral-500 line-through">
                              {formatMoney(p.priceOld)}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white
                                       bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
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
                          >
                            Add to cart
                          </button>

                          <FavoriteButton
                            productId={p.id}
                            className="w-10 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
                          />
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 pb-4">
            {pages.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-2.5 w-2.5 rounded-full transition ${
                  index === i ? "bg-black" : "bg-black/20"
                }`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}