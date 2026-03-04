import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (!q) return NextResponse.json({ items: [] });

  const items = await prisma.product.findMany({
    where: {
      OR: [
        { title: { contains: q } },
        { slug: { contains: q } },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      price: true,
    },
    take: 8,
  });

  return NextResponse.json({ items });
}