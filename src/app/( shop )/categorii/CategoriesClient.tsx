"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

type Cat = {
  title: string;
  slug: string;
  image: string;
  badge?: string; // e.g. "New"
  href: string;
};

// Demo categories (keep in sync with prisma/seed.js)
const CATEGORIES: Cat[] = [
  { title: "Category One", slug: "category-one", image: "/collections/category-1.jpeg", href: "/categorie/category-one" },
  { title: "Category Two", slug: "category-two", image: "/collections/category-2.jpeg", href: "/categorie/category-two" },
  { title: "Category Three", slug: "category-three", image: "/collections/category-3.jpeg", href: "/categorie/category-three" },
  { title: "Category Four", slug: "category-four", image: "/collections/category-4.jpeg", href: "/categorie/category-four", badge: "New" },
  { title: "Category Five", slug: "category-five", image: "/collections/category-5.jpeg", href: "/categorie/category-five", badge: "New" },
  { title: "Category Six", slug: "category-six", image: "/collections/category-6.jpeg", href: "/categorie/category-six" },
  { title: "Promotions", slug: "promotions", image: "/banners/banner-3.jpeg", href: "/categorie/promotions" },
  { title: "All products", slug: "all-products", image: "/banners/banner-1.jpeg", href: "/products" },
];

export default function CategoriesClient() {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return CATEGORIES;
    return CATEGORIES.filter((c) => c.title.toLowerCase().includes(s));
  }, [q]);

  return (
    <section className="max-w-7xl mx-auto px-4 pt-0 pb-6 md:py-10">
     

      <div className="mt-6 md:mt-0">
        <h1 className="text-2xl font-semibold text-black">All categories</h1>

        {/* NOTE: translated template comment. */}
        <Link
          href="/reducerile-lunii"
          className="mt-4 block rounded-2xl border border-black/10 bg-gradient-to-r from-[#f7d7d0] to-[#ffe7c7] p-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-black">Collections for you</div>
              <div className="text-xs text-black/70">
                Discover deals and curated collections
              </div>
            </div>
            <div className="text-2xl">🏷️</div>
          </div>
        </Link>

        {/* grid 2 coloane pe mobil */}
        <div className="mt-5 grid grid-cols-2 gap-4">
          {filtered.map((c) => (
            <Link
              key={c.slug}
              href={c.href}
              className="relative overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
            >
              <div className="aspect-[16/9] w-full overflow-hidden">
                <img
                  src={c.image}
                  alt={c.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="p-3">
                <div className="text-sm font-semibold text-black">{c.title}</div>
              </div>

              {c.badge ? (
                <div className="absolute right-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[11px] font-semibold text-white">
                  {c.badge}
                </div>
              ) : null}
            </Link>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 text-sm text-black/60">No categories found.</div>
        ) : null}
      </div>
    </section>
  );
}