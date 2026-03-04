import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        select: {
          id: true,
          title: true,
          slug: true,
          price: true,
          priceOld: true,
          image: true,
          inStock: true,
        },
      },
    },
  });

  return NextResponse.json({ favorites });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const productId = String(body?.productId || "");
  if (!productId) return NextResponse.json({ error: "Missing productId." }, { status: 400 });

  await prisma.favorite.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId },
  });

  return NextResponse.json({ ok: true });
}