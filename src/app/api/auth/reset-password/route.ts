import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "../../../../lib/prisma";
import bcrypt from "bcryptjs";

function sha256(x: string) {
  return crypto.createHash("sha256").update(x).digest("hex");
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = String((body as any)?.token ?? "").trim();
    const newPassword = String((body as any)?.password ?? "");

    if (!token) return NextResponse.json({ ok: false, message: "Missing token." }, { status: 400 });
    if (newPassword.length < 6)
      return NextResponse.json({ ok: false, message: "Password must be at least 6 characters." }, { status: 400 });

    const tokenHash = sha256(token);

    const rec = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!rec) return NextResponse.json({ ok: false, message: "Token invalid." }, { status: 400 });
    if (rec.expiresAt < new Date()) {
      // NOTE: translated template comment.
      await prisma.passwordResetToken.delete({ where: { tokenHash } });
      return NextResponse.json({ ok: false, message: "Token expirat. Cere unul nou." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: rec.userId },
      data: { passwordHash },
    });

    // NOTE: translated template comment.
    await prisma.passwordResetToken.delete({ where: { tokenHash } });

    return NextResponse.json({ ok: true, message: "Password changed. You can sign in now." });
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return NextResponse.json({ ok: false, message: "Eroare server." }, { status: 500 });
  }
}