import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: {
      isFeaturedBest: true,
      inStock: true,
    },
    take: 15,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      priceOld: true,
      stock: true,
      inStock: true,
      image: true,
    },
  });

  // NOTE: translated template comment.
  const filtered = products.filter((p) => p.stock > 0);

  return NextResponse.json({ items: filtered });
}
