import { getBaseUrl } from "@/lib/baseUrl";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import MonthlyDealsCarousel from "@/components/shop/MonthlyDealsCarousel";
import BestSellersCarousel from "@/components/shop/BestSellersCarousel";
import CollectionsGrid from "@/components/shop/CollectionsGrid";
import CollectionOneCarousel from "@/components/shop/CollectionOneCarousel";
import CollectionTwoCarousel from "@/components/shop/CollectionTwoCarousel";

async function getMonthlyDeals() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/monthly-deals`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
}

async function getBestSellers() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/best-sellers`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
}

async function getCollectionOne() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/collection-one`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
}

async function getCollectionTwo() {
  const baseUrl = await getBaseUrl();
  const res = await fetch(`${baseUrl}/api/products/collection-two`, {
    cache: "no-store",
  });
  if (!res.ok) return { items: [] };
  return res.json();
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
      <MonthlyDealsCarousel items={monthly.items} />
      <BestSellersCarousel items={best.items} />
      <CollectionsGrid />
      <CollectionOneCarousel items={collectionOne.items} />
      <CollectionTwoCarousel items={collectionTwo.items} />
    </div>
  );
}
