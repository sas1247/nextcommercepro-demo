import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyUnsubToken } from "@/lib/unsubscribe";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const token = url.searchParams.get("t") || "";
  const email = verifyUnsubToken(token);

  if (!email) {
    return new NextResponse("Link invalid.", { status: 400 });
  }

  // NOTE: translated template comment.
  await prisma.newsletterSubscriber
    .update({ where: { email }, data: { voucherCode: null } }) // NOTE: translated template comment.
    .catch(() => {});

  // NOTE: translated template comment.
  return new NextResponse(
    `Te-ai dezabonat cu succes (${email}).`,
    { status: 200, headers: { "Content-Type": "text/plain; charset=utf-8" } }
  );
}