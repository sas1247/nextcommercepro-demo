"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

type Slide = {
  id: string;
  desktopImage: string;
mobileImage: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;

  ctaLabel: string;
  href: string;

  cta2Label?: string;
  href2?: string;
};

export function HeroCarousel() {
  const slides: Slide[] = useMemo(
    () => [
      {
        id: "s1",
        desktopImage: "/banners/banner-1.jpeg",
        mobileImage: "/banners/mobile-1.jpeg",
        eyebrow: "Current deals", // NOTE: translated template comment.
        title: "Monthly deals",
        subtitle: "Top picks, now at special prices.",
        ctaLabel: "View deals",
        href: "/reducerile-lunii",
        cta2Label: "Promotions",
        href2: "/categorie/promotions",
      },
      {
        id: "s2",
        desktopImage: "/banners/banner-2.jpeg",
        mobileImage: "/banners/mobile-2.jpeg",
        eyebrow: "Collection",
        title: "Category Two",
        subtitle: "Premium, comfort, durability.",
        ctaLabel: "View collection",
        href: "/categorie/category-two",
        cta2Label: "Promotions",
        href2: "/categorie/promotions",
      },
      {
        id: "s3",
        desktopImage: "/banners/banner-3.jpeg",
        mobileImage: "/banners/mobile-3.jpeg",
        eyebrow: "Premium",
        title: "Category Five",
        subtitle: "Hotel-style look, luxurious feel, flawless finish.",
        ctaLabel: "View category",
        href: "/categorie/category-five",
        cta2Label: "Promotions",
        href2: "/categorie/promotions",
      },
      {
        id: "s4",
        desktopImage: "/banners/banner-4.jpeg",
        mobileImage: "/banners/mobile-4.jpeg",
        eyebrow: "Comfort",
        title: "Category Six",
        subtitle: "Comfort, warmth, and style.",
        ctaLabel: "View collection",
        href: "/categorie/category-six",
        cta2Label: "Promotions",
        href2: "/categorie/promotions",
      },
    ],
    []
  );

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    // NOTE: translated template comment.
    const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
    const delay = isMobile ? 3500 : 4500;

    const t = setInterval(() => {
      setIdx((v) => (v + 1) % slides.length);
    }, delay);

    return () => clearInterval(t);
  }, [slides.length]);

  const go = (next: number) => {
    const n = (next + slides.length) % slides.length;
    setIdx(n);
  };

  const active = slides[idx];

  return (
    <section className="relative overflow-hidden rounded-[28px] border bg-white ring-premium">
      {/* container */}
      {/* NOTE: translated template comment. */}
      <div className="relative h-[240px] w-full sm:h-[420px] lg:h-[480px]">
        <>
  {/* Desktop */}
  <Image
    src={active.desktopImage}
    alt={active.title}
    fill
    priority
    className="hidden md:block object-cover"
  />

  {/* Mobile */}
  <Image
    src={active.mobileImage}
    alt={active.title}
    fill
    priority
    className="block md:hidden object-cover"
  />
</>

        {/* overlay gradient + blur */}
        <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px]" />

        {/* content */}
        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="px-4 sm:px-6">
            <div className="max-w-2xl text-white mx-auto">
              {active.eyebrow && (
                <div className="mb-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-[11px] sm:text-xs font-semibold backdrop-blur">
                  {active.eyebrow}
                </div>
              )}

              {/* ✅ mobil: titlu mai mic; desktop identic */}
              <h2 className="text-2xl font-semibold leading-tight sm:text-4xl">
                {active.title}
              </h2>

              {/* NOTE: translated template comment. */}
              {active.subtitle && (
                <p className="mt-2 sm:mt-3 max-w-lg text-xs sm:text-base text-white/85 mx-auto">
                  {active.subtitle}
                </p>
              )}

              {/* NOTE: translated template comment. */}
              <div className="mt-4 sm:mt-6 flex items-center justify-center gap-3 sm:gap-4">
                {/* buton outline (cum ai cerut) */}
                <Link
                  href={active.href}
                  className="inline-flex items-center justify-center rounded-full border border-white/80 bg-transparent
                             px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-semibold text-white
                             hover:bg-white hover:text-black transition"
                >
                  {active.ctaLabel}
                </Link>

                {/* accent button gradient */}
                <Link
                  href={active.href2 ?? "/categorie/promotii"}
                  className="inline-flex items-center justify-center rounded-full bg-premium
                             px-4 py-2 text-xs sm:px-6 sm:py-3 sm:text-sm font-semibold text-on-premium ring-premium"
                >
                  {active.cta2Label ?? "Promotions"}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* arrows */}
        {/* NOTE: translated template comment. */}
        <button
          type="button"
          onClick={() => go(idx - 1)}
          className="hidden sm:block absolute left-4 top-1/2 -translate-y-1/2 rounded-full border bg-white/75 p-2 backdrop-blur hover:bg-white"
          aria-label="Anterior"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(idx + 1)}
          className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 rounded-full border bg-white/75 p-2 backdrop-blur hover:bg-white"
          aria-label="Next"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* dots */}
        <div className="absolute bottom-3 sm:bottom-4 left-0 right-0 flex justify-center gap-2">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setIdx(i)}
              className={clsx(
                "h-2.5 w-2.5 rounded-full border border-white/70 transition",
                i === idx ? "bg-white" : "bg-white/25 hover:bg-white/50"
              )}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}