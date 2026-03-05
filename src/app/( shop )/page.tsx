export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";

import { HeroCarousel } from "@/components/shop/HeroCarousel";
import MonthlyDealsCarousel from "@/components/shop/MonthlyDealsCarousel";
import BestSellersCarousel from "@/components/shop/BestSellersCarousel";
import CollectionsGrid from "@/components/shop/CollectionsGrid";
import CollectionOneCarousel from "@/components/shop/CollectionOneCarousel";
import CollectionTwoCarousel from "@/components/shop/CollectionTwoCarousel";

type Item = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  image: string | null;
};

const selectItem = {
  id: true,
  title: true,
  slug: true,
  price: true,
  priceOld: true,
  image: true,
} as const;

async function getMonthlyDeals(): Promise<Item[]> {
  const products = await prisma.product.findMany({
    where: {
      priceOld: { not: null },
    },
    take: 15,
    orderBy: { updatedAt: "desc" },
    select: selectItem,
  });

  return products.filter((p) => (p.priceOld ?? 0) > p.price);
}

async function getBestSellers(): Promise<Item[]> {
  return prisma.product.findMany({
    take: 15,
    orderBy: { updatedAt: "desc" },
    select: selectItem,
  });
}

async function getCollectionOne(): Promise<Item[]> {
  return prisma.product.findMany({
    where: { category: { is: { slug: "category-one" } } },
    take: 15,
    orderBy: { updatedAt: "desc" },
    select: selectItem,
  });
}

async function getCollectionTwo(): Promise<Item[]> {
  return prisma.product.findMany({
    where: { category: { is: { slug: "category-two" } } },
    take: 15,
    orderBy: { updatedAt: "desc" },
    select: selectItem,
  });
}

const BUY_LINKS = {
  gumroad: "https://nextcommerce.itch.io/nexnextcommerce-pro",
  lemon: "https://nextcommerce.lemonsqueezy.com/checkout/buy/e86f8528-20fb-4c86-b5a7-2f5cbdc1b87b", 
  itch: "https://nextcommerce.itch.io/nexnextcommerce-pro",
};

export default async function HomePage() {
  const [monthly, best, collectionOne, collectionTwo] = await Promise.all([
    getMonthlyDeals(),
    getBestSellers(),
    getCollectionOne(),
    getCollectionTwo(),
  ]);

  return (
    <div className="space-y-2">
      {/* TOP BAR (Demo -> Buy dropdown) */}
      <div className="px-3 sm:px-4">
        <div className="rounded-2xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/40">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="text-sm font-semibold">NextCommerce Pro</div>
              <div className="text-xs text-muted-foreground">
                Full-stack Next.js e-commerce template • Storefront + Admin • Stripe • Coupons
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Buy dropdown */}
              <details className="group relative">
                <summary className="list-none cursor-pointer select-none rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 active:scale-[0.99]">
                  Buy Template ▾
                </summary>

                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-background shadow-lg">
                  <a
                    href={BUY_LINKS.gumroad}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-3 text-sm hover:bg-muted"
                  >
                    Gumroad
                  </a>
                  <a
                    href={BUY_LINKS.lemon}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-3 text-sm hover:bg-muted"
                  >
                    Lemon Squeezy
                  </a>
                  <a
                    href={BUY_LINKS.itch}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-4 py-3 text-sm hover:bg-muted"
                  >
                    itch.io
                  </a>
                </div>
              </details>

              {/* Optional: Admin demo link (kept simple) */}
              <a
                href="/admin"
                className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-muted active:scale-[0.99]"
              >
                Admin Demo
              </a>
            </div>
          </div>
        </div>
      </div>

      <HeroCarousel />
      <MonthlyDealsCarousel items={monthly} />
      <BestSellersCarousel items={best} />
      <CollectionsGrid />
      <CollectionOneCarousel items={collectionOne} />
      <CollectionTwoCarousel items={collectionTwo} />
    </div>
  );
}