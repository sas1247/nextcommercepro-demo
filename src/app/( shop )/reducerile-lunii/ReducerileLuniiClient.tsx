"use client";

import ProductCard from "@/components/shop/ProductCard";

type Item = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  image: string | null;
  inStock: boolean;
  stock: number;
  category?: { name: string; slug: string };
};

export default function ReducerileLuniiClient({ items }: { items: Item[] }) {
  if (!items?.length) {
    return (
      <div className="rounded-2xl border bg-white p-6 text-sm text-black/70">
        No active deals at the moment.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => (
        <ProductCard key={item.id} item={item} />
      ))}
    </div>
  );
}