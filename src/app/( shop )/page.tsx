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

function BuyCard() {
  const gumroad = "https://nextcommerce.gumroad.com/l/nextcommercepro";
  const lemon =
    "https://nextcommerce.lemonsqueezy.com/checkout/buy/e86f8528-20fb-4c86-b5a7-2f5cbdc1b87b";
  const itch = "https://nextcommerce.itch.io/nexnextcommerce-pro";

  return (
    <section className="px-4">
      <div className="mx-auto max-w-6xl">
        <div className="relative rounded-2xl border bg-white shadow-sm">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />

          <div className="flex flex-col gap-4 p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700">
                <span className="inline-block size-2 rounded-full bg-emerald-500" />
                Launch week price
              </div>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <div className="text-base font-semibold text-gray-900">Price:</div>

                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-gray-500 line-through">$79</span>
                  <span className="text-2xl font-bold tracking-tight text-gray-900">$59</span>
                </div>

                <span className="text-sm text-gray-500">one-time purchase</span>
              </div>

              <p className="text-sm text-gray-600">
                Choose your preferred marketplace to purchase the template.
              </p>

              <p className="text-xs text-gray-500">
                Includes a full-featured Admin Dashboard for managing products, orders, customers, coupons and email marketing. Full source code included in the purchase.
              </p>
            </div>

            <div className="flex items-center gap-3 md:justify-end">
              <details className="group relative">
                <summary className="flex cursor-pointer list-none items-center justify-center gap-2 rounded-xl border bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800">
                  Buy
                  <span className="transition group-open:rotate-180">▾</span>
                </summary>

                <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bg-white shadow-lg">
                  <a
                    href={gumroad}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    Gumroad
                  </a>
                  <a
                    href={lemon}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    Lemon Squeezy
                  </a>
                  <a
                    href={itch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 text-sm text-gray-800 hover:bg-gray-50"
                  >
                    itch.io
                  </a>
                </div>
              </details>

              <a
                href="https://nextcommercepro-demo-a3ch5zkpk-sas1247s-projects.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border px-4 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
              >
                Live demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [monthly, best, collectionOne, collectionTwo] = await Promise.all([
    getMonthlyDeals(),
    getBestSellers(),
    getCollectionOne(),
    getCollectionTwo(),
  ]);

  return (
    <div className="space-y-4">
      <HeroCarousel />

      {/* ✅ Nice-looking centered pricing + Buy dropdown */}
      <BuyCard />

      <MonthlyDealsCarousel items={monthly} />
      <BestSellersCarousel items={best} />
      <CollectionsGrid />
      <CollectionOneCarousel items={collectionOne} />
      <CollectionTwoCarousel items={collectionTwo} />
    </div>
  );
}