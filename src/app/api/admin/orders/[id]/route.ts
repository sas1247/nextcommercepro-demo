import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function getIdFromCtx(ctx: any) {
  return Promise.resolve(ctx?.params).then((p) => String(p?.id || "").trim());
}

export async function GET(req: Request, ctx: any) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = await getIdFromCtx(ctx);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { title: true, sku: true, slug: true, image: true } },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(order);
}

export async function PUT(req: Request, ctx: any) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = await getIdFromCtx(ctx);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));

  // ce updatezi tu acum (minim):
  const status = body?.status ? String(body.status).trim() : undefined;

  const updated = await prisma.order.update({
    where: { id },
    data: {
      ...(status ? { status } : {}),
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({ ok: true, order: updated });
}

export async function DELETE(req: Request, ctx: any) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = await getIdFromCtx(ctx);
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // NOTE: translated template comment.
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}