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

export default async function HomePage() {
  const [monthly, best, collectionOne, collectionTwo] = await Promise.all([
    getMonthlyDeals(),
    getBestSellers(),
    getCollectionOne(),
    getCollectionTwo(),
  ]);

  return (
    <div className="space-y-2">
      <HeroCarousel />
      <MonthlyDealsCarousel items={monthly} />
      <BestSellersCarousel items={best} />
      <CollectionsGrid />
      <CollectionOneCarousel items={collectionOne} />
      <CollectionTwoCarousel items={collectionTwo} />
    </div>
  );
}