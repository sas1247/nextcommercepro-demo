import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const ids: string[] = Array.isArray(body?.ids) ? body.ids.map(String) : [];

  // NOTE: translated template comment.
  if (ids.length) {
    await prisma.favorite.createMany({
      data: ids.map((productId) => ({ userId: user.id, productId })),
      skipDuplicates: true,
    });
  }

  // NOTE: translated template comment.
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  return NextResponse.json({ ids: favs.map((f) => f.productId) });
}