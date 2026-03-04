import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";

export async function GET() {
  const category = await prisma.category.findUnique({
    where: { slug: "category-four" },
    select: { id: true },
  });

  if (!category) {
    return NextResponse.json({ items: [] });
  }

  const items = await prisma.product.findMany({
    where: {
      categoryId: category.id,
      inStock: true,
    },
    orderBy: { createdAt: "desc" },
    take: 15,
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
      priceOld: true,
      image: true,
      stock: true,
      inStock: true,
    },
  });

  return NextResponse.json({ items });
}
