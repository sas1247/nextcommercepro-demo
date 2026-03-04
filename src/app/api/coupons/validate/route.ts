import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { formatMoney } from "@/lib/money";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body?.code ?? "").trim().toUpperCase();
  const subtotal = Number(body?.subtotal ?? 0); // cents

  if (!code) {
    return NextResponse.json(
      { valid: false, message: "Invalid code." },
      { status: 400 }
    );
  }

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) {
    return NextResponse.json(
      { valid: false, message: "Code is inactive or does not exist." },
      { status: 400 }
    );
  }

  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) {
    return NextResponse.json(
      { valid: false, message: "Code expired." },
      { status: 400 }
    );
  }

  if (coupon.usedCount >= coupon.usageLimit) {
    return NextResponse.json(
      { valid: false, message: "Code usage limit reached." },
      { status: 400 }
    );
  }

  if (subtotal < coupon.minSubtotal) {
    return NextResponse.json(
      {
        valid: false,
        message: `Code valid starting from ${formatMoney(coupon.minSubtotal)}.`,
        minSubtotal: coupon.minSubtotal,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    valid: true,
    code: coupon.code,
    amount: coupon.amount, // cents
    minSubtotal: coupon.minSubtotal,
    message: "Code applied successfully.",
  });
}