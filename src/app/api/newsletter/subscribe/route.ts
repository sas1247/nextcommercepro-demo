import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendVoucherEmail } from "../../../../lib/mailer";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function makeCode() {
  // ex: ASTA20-9F3K2Q
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ASTA20-${rand}`;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ message: 
"Invalid email."}, { status: 400 });
  }

  // NOTE: translated template comment.
  const existing = await prisma.newsletterSubscriber.findUnique({
    where: { email },
    select: { voucherCode: true },
  });

  if (existing?.voucherCode) {
    return NextResponse.json({
      ok: true,
      code: existing.voucherCode,
      already: true,
    });
  }

  // NOTE: translated template comment.
  let code = makeCode();
  for (let i = 0; i < 5; i++) {
    const existsCoupon = await prisma.coupon.findUnique({
      where: { code },
      select: { id: true },
    });
    if (!existsCoupon) break;
    code = makeCode();
  }

  // NOTE: translated template comment.
  await prisma.coupon.create({
    data: {
      code,
      amount: 2000, // 20 USD
      minSubtotal: 30000, // 300 USD
      usageLimit: 1,
      usedCount: 0,
      isActive: true,
    },
  });

  // NOTE: translated template comment.
  await prisma.newsletterSubscriber.upsert({
    where: { email },
    update: { voucherCode: code },
    create: { email, voucherCode: code },
  });

  // 🔥 SEND REAL EMAIL WITH VOUCHER (SMTP)
  try {
    await sendVoucherEmail(email, code);
  } catch (err) {
    console.error("Error sending voucher email:", err);
    // NOTE: translated template comment.
  }

  return NextResponse.json({ ok: true, code });
}