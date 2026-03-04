import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

  const id = String(params.id || "");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: {
      items: {
        select: {
          id: true,
          title: true,
          slug: true,
          image: true,
          price: true,
          qty: true,
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });

  return NextResponse.json({ order });
}