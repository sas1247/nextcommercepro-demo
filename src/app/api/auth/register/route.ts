import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { signUserJwt, authCookieName } from "@/lib/jwt";
import { sendWelcomeEmail } from "@/lib/mailer";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });

        // NOTE: translated template comment.
    try {
      const featured = await prisma.product.findMany({
        where: { inStock: true },
        orderBy: [
          { isFeaturedBest: "desc" },
          { isFeaturedDiscounts: "desc" },
          { createdAt: "desc" },
        ],
        take: 4,
        select: { title: true, slug: true, price: true, image: true },
      });

      await sendWelcomeEmail(email, featured);
    } catch (err) {
      console.error("WELCOME_EMAIL_ERROR:", err);
    }

    const token = await signUserJwt({ userId: user.id, email: user.email });

    const res = NextResponse.json({ user }, { status: 201 });
    res.cookies.set(authCookieName(), token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 zile
    });
    return res;
  } catch (e: any) {
  console.error("REGISTER_ERROR:", e);

  const message =
    process.env.NODE_ENV !== "production"
      ? (e?.message || String(e))
      : "Registration error.";

  return NextResponse.json({ error: message }, { status: 500 });
}
}