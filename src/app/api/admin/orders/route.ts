import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
  const limit = Math.min(100, Math.max(10, toInt(url.searchParams.get("limit"), 20)));
  const q = (url.searchParams.get("q") || "").trim();

  const where =
    q.length > 0
      ? {
          OR: [
            { pfName: { contains: q, mode: "insensitive" as const } },
            { pfEmail: { contains: q, mode: "insensitive" as const } },
            { pfPhone: { contains: q, mode: "insensitive" as const } },
            { pjCompany: { contains: q, mode: "insensitive" as const } },
            { pjEmail: { contains: q, mode: "insensitive" as const } },
            { couponCode: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

  const [total, items] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        orderNo: true,
        status: true,
        paymentMethod: true,
        total: true,
        createdAt: true,
        personType: true,
        pfName: true,
        pjCompany: true,
        items: { select: { id: true } }, // NOTE: translated template comment.
      },
    }),
  ]);

  const mapped = items.map((o) => ({
    ...o,
    itemsCount: o.items.length,
    customerName:
      o.personType === "PJ"
        ? o.pjCompany || "-"
        : o.pfName || "-",
  }));

  return NextResponse.json({
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
    limit,
    items: mapped,
  });
}