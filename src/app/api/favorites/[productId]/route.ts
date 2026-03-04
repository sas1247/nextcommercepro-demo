import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Neautorizat." }, { status: 401 });

    const { productId: raw } = await params; // ✅ IMPORTANT: await params
    const productId = String(raw || "").trim();

    if (!productId) return NextResponse.json({ error: "Missing productId." }, { status: 400 });

    // NOTE: translated template comment.
    const result = await prisma.favorite.deleteMany({
      where: { userId: user.id, productId },
    });

    return NextResponse.json({ ok: true, deleted: result.count });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Error removing favorite.", details: e?.message || String(e) },
      { status: 500 }
    );
  }
}