import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      priceOld: { not: null },
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      priceOld: true,
      stock: true,
      inStock: true,
      image: true,
      isFeaturedDiscounts: true,
      category: { select: { name: true, slug: true } },
    },
  });

  const sorted = products
    .filter((p) => p.priceOld !== null && p.priceOld > p.price)
    .sort((a, b) => {
      const da = (a.priceOld ?? 0) - a.price;
      const db = (b.priceOld ?? 0) - b.price;
      return db - da;
    })
    .slice(0, 15);

  return NextResponse.json({ items: sorted });
}
