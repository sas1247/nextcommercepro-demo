// src/app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { signUserJwt, authCookieName } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const email = String((body as any)?.email ?? "")
      .trim()
      .toLowerCase();

    const password = String((body as any)?.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, passwordHash: true },
    });

    // nu dezvăluim dacă email-ul există sau nu
    if (!user?.passwordHash) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json(
        { error: "Incorrect email or password." },
        { status: 401 }
      );
    }

    const token = await signUserJwt({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user: { id: user.id, email: user.email } });

    res.cookies.set(authCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (e) {
    console.error("LOGIN_ERROR:", e);
    return NextResponse.json({ error: "Authentication error." }, { status: 500 });
  }
}