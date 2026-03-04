import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import { sendPasswordResetEmail } from "../../../../lib/mailer";

function sha256(x: string) {
  return crypto.createHash("sha256").update(x).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String((body as any)?.email ?? "").trim().toLowerCase();

    // NOTE: translated template comment.
    const okResponse = NextResponse.json({
      ok: true,
      message: "If the email exists, you will receive a reset link in a few minutes.",
    });

    if (!email) return NextResponse.json({ ok: false, message: "Missing email." }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // NOTE: translated template comment.
    if (!user) return okResponse;

    // token brut (se trimite pe email)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

    // NOTE: translated template comment.
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    });

    // NOTE: translated template comment.
    await prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash, expiresAt },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const link = `${siteUrl}/reset-password?token=${rawToken}`;

    // trimitem email
    await sendPasswordResetEmail(user.email, { link });

    return okResponse;
  } catch (err) {
    console.error("REQUEST PASSWORD RESET ERROR:", err);
    return NextResponse.json({ ok: true, message: "If the email exists, you will receive a reset link." });
  }
}