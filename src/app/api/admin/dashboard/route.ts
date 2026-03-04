import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const from = startOfToday();
    const to = endOfToday();

    // Orders today
    const ordersToday = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
      select: {
        total: true,
      },
    });

    const ordersCount = ordersToday.length;
    const salesToday = ordersToday.reduce((s, o) => s + Number(o.total || 0), 0);

    // Active products
    const activeProducts = await prisma.product.count({
      where: { inStock: true },
    });

    // NOTE: translated template comment.
    const lowStock = await prisma.product.count({
      where: {
        stock: { lte: 5 },
        inStock: true,
      },
    });

    return NextResponse.json({
      ordersToday: ordersCount,
      salesToday,
      activeProducts,
      lowStock,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Server error" },
      { status: 500 }
    );
  }
}