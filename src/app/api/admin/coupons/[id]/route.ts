import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function toInt(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const body = await req.json().catch(() => ({} as any));

    const patch: any = {};

    if (body.amountLei != null) {
      const amountLei = Number(body.amountLei);
      if (!Number.isFinite(amountLei) || amountLei <= 0) {
        return NextResponse.json({ error: "Valoarea voucherului trebuie > 0." }, { status: 400 });
      }
      patch.amount = Math.round(amountLei * 100);
    }

    if (body.minSubtotalLei != null) {
      const minSubtotalLei = Number(body.minSubtotalLei);
      if (!Number.isFinite(minSubtotalLei) || minSubtotalLei < 0) {
        return NextResponse.json({ error: "Invalid minimum cart value." }, { status: 400 });
      }
      patch.minSubtotal = Math.round(minSubtotalLei * 100);
    }

    if (body.usageLimit != null) patch.usageLimit = Math.max(1, toInt(body.usageLimit, 1));
    if (body.isActive != null) patch.isActive = !!body.isActive;

    if (body.expiresAt !== undefined) {
      const s = String(body.expiresAt || "").trim();
      if (!s) patch.expiresAt = null;
      else {
        const d = new Date(s);
        if (!Number.isFinite(d.getTime())) {
          return NextResponse.json({ error: "Invalid expiration date." }, { status: 400 });
        }
        patch.expiresAt = d;
      }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: patch,
    });

    return NextResponse.json({ coupon: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}