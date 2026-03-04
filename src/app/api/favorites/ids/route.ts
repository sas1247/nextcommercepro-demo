import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ ids: [] });

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    select: { productId: true },
  });

  return NextResponse.json({ ids: favs.map((f) => f.productId) });
}