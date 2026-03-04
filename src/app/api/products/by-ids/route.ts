import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const idsRaw = (body as any)?.ids;

    const ids: string[] = Array.isArray(idsRaw) ? idsRaw.map(String) : [];
    if (!ids.length) return NextResponse.json({ products: [] });

    const products = await prisma.product.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, slug: true, price: true, priceOld: true, image: true },
    });

    // NOTE: translated template comment.
    const map = new Map(products.map((p) => [p.id, p]));
    const ordered = ids.map((id) => map.get(id)).filter(Boolean);

    return NextResponse.json({ products: ordered });
  } catch {
    return NextResponse.json({ error: "Error loading products." }, { status: 500 });
  }
}