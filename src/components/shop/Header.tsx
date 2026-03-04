"use client";

import Link from "next/link";
import { Heart, Search, ShoppingBag, User, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import FavoritesBadge from "@/components/shop/FavoritesBadge";

type SearchItem = { id: string; title: string; price: number; slug: string };

export function Header() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const { count } = useCart();

  const [results, setResults] = useState<SearchItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const s = q.trim();
    if (!s) {
      setResults([]);
      return;
    }

    const t = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(s)}`, { cache: "no-store" });
        const data = await res.json();
        setResults((data?.items ?? []) as SearchItem[]);
      } catch (e) {
        console.error(e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(t);
  }, [q]);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur">
      {/* NOTE: translated template comment. */}
      <div className="mx-auto max-w-7xl px-4 py-3 md:flex md:items-center md:gap-4">
        {/* NOTE: translated template comment. */}
        <div className="flex items-center justify-between gap-3 md:flex-none">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt="NextCommerce Pro" className="h-10 w-auto" />
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">NextCommerce Pro</div>
              <div className="text-xs text-black/60">E-commerce template</div>
            </div>
          </Link>

          {/* PHONE (mobil only) */}
          <a
            href="tel:+10000000000"
            className="md:hidden inline-flex items-center gap-2 rounded-full
                       border border-black/10 bg-white px-3 py-1
                       text-xs font-semibold text-black/80
                       hover:bg-black/5 transition"
            aria-label="Call +1 000 000 0000"
          >
            <Phone className="h-4 w-4 text-black/60" />
            +1 000 000 0000
          </a>
        </div>

        {/* NOTE: translated template comment. */}
        <div className="relative mt-2 w-full md:mt-0 md:ml-2 md:flex-1">
          <div
            className={clsx(
              "flex items-center rounded-full border bg-white ring-premium",
              // NOTE: translated template comment.
              "px-3 h-10",
              // NOTE: translated template comment.
              "md:px-4 md:py-2 md:h-auto"
            )}
          >
            <Search className="h-4 w-4 text-black/50" />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setOpen(true);
              }}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              onFocus={() => setOpen(true)}
              placeholder="Search products..."
              className="ml-2 w-full bg-transparent text-sm outline-none"
            />
            <button
              className={clsx(
                "ml-2 rounded-full bg-premium text-on-premium font-semibold",
                // mobil: buton mai mic
                "px-3 h-8 text-[11px]",
                // NOTE: translated template comment.
                "md:px-4 md:py-2 md:h-auto md:text-xs"
              )}
            >
              Search
            </button>
          </div>

          {/* Autocomplete dropdown */}
          {open && results.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-2xl border bg-white shadow-2xl">
              {results.map((r) => (
                <Link
                  key={r.id}
                  href={`/produs/${r.slug}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-black/5"
                >
                  <span className="font-medium">{r.title}</span>
                  <span className="text-black/60">
                    {(r.price / 100).toFixed(2).replace(".", ",")} Lei
                  </span>
                </Link>
              ))}
            </div>
          )}

          {/* NOTE: translated template comment. */}
          {/* {open && loading && (
            <div className="absolute left-0 right-0 mt-2 rounded-2xl border bg-white px-4 py-3 text-sm text-black/60 shadow-2xl">
              Searching...
            </div>
          )} */}
        </div>

        {/* ICONS (desktop only) */}
        <nav className="hidden items-center gap-5 md:flex">
          <Link href="/wishlist" className="group flex items-center gap-2">
            <div className="relative">
              <Heart className="h-5 w-5" />

              <FavoritesBadge className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-premium text-[11px] text-on-premium" />
            </div>

            <div className="leading-tight">
              <div className="text-xs font-semibold">Wishlist</div>
              <div className="text-[11px] text-black/60">Add to wishlist</div>
            </div>
          </Link>

          <Link href="/account" className="group flex items-center gap-2">
            <User className="h-5 w-5" />
            <div className="leading-tight">
              <div className="text-xs font-semibold">My account</div>
              <div className="text-[11px] text-black/60">Sign in / Create account</div>
            </div>
          </Link>

          <Link href="/cart" className="group flex items-center gap-2">
            <div className="relative">
              <ShoppingBag className="h-5 w-5" />
              {/* badge - dinamic */}
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-premium text-[11px] text-on-premium">
                {count}
              </span>
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold">Cart</div>
              <div className="text-[11px] text-black/60">{count} products</div>
            </div>
          </Link>
        </nav>

        {/* PHONE (desktop only) */}
        <div className="hidden text-right lg:block">
          <div className="text-[11px] text-black/60">Phone orders</div>
          <a
            href="tel:+10000000000"
            className={clsx(
              "inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold",
              "bg-premium text-on-premium"
            )}
          >
            +1 000 000 0000
          </a>
        </div>
      </div>

      {/* MENIU CATEGORII (desktop only) */}
      <div className="hidden md:block border-t bg-white">
        <div className="mx-auto flex max-w-7xl items-center gap-6 overflow-x-auto px-4 py-2 text-sm">
          {[
            ["Category One", "category-one"],
            ["Category Two", "category-two"],
            ["Category Three", "category-three"],
            ["Category Four", "category-four"],
            ["Category Five", "category-five"],
            ["Category Six", "category-six"],
            ["Promotions", "promotions"],
            ["All products", "__all__"],
          ].map(([label, slug]) => {
            const href = slug === "__all__" ? "/produse" : `/categorie/${slug}`;
            const active = pathname === href;

            return (
              <Link
                key={slug}
                href={href}
                className={`whitespace-nowrap rounded-full px-3 py-1 transition ${
                  active
                    ? "bg-gradient-to-r from-black to-[#3533cd] text-white"
                    : "text-black/70 hover:bg-black/5 hover:text-black"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}