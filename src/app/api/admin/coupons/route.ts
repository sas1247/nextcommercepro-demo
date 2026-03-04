import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function genCode(len = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function toInt(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
    const limit = Math.min(50, Math.max(1, toInt(url.searchParams.get("limit"), 20)));
    const q = (url.searchParams.get("q") || "").trim().toUpperCase();

    const where = q ? { code: { contains: q, mode: "insensitive" as any } } : {};

    const [items, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
      limit,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({} as any));

    const amountLei = Number(body.amountLei ?? 0);
    const minSubtotalLei = Number(body.minSubtotalLei ?? 0);
    const usageLimit = toInt(body.usageLimit, 1);
    const isActive = body.isActive !== false;

    const expiresAtRaw = (body.expiresAt || "").trim();
    const expiresAt = expiresAtRaw ? new Date(expiresAtRaw) : null;
    if (expiresAt && !Number.isFinite(expiresAt.getTime())) {
      return NextResponse.json({ error: "Invalid expiration date." }, { status: 400 });
    }

    if (!Number.isFinite(amountLei) || amountLei <= 0) {
      return NextResponse.json({ error: "Valoarea voucherului trebuie > 0." }, { status: 400 });
    }

    const amount = Math.round(amountLei * 100); // bani
    const minSubtotal = Math.max(0, Math.round(minSubtotalLei * 100));

    let code = String(body.code || "").trim().toUpperCase();
    if (!code) code = genCode(8);

    // NOTE: translated template comment.
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.coupon.findUnique({ where: { code } });
      if (!exists) break;
      code = genCode(8);
    }

    const created = await prisma.coupon.create({
      data: {
        code,
        amount,
        minSubtotal,
        isActive,
        expiresAt: expiresAt || undefined,
        usageLimit,
      },
    });

    return NextResponse.json({ coupon: created });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}