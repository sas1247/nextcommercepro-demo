import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNo: true,
      status: true,
      paymentMethod: true,
      total: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ orders });
}