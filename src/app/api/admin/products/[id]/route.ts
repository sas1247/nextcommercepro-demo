import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function toCentsFromLeiString(input: any): number | null {
  if (input === null || input === undefined) return null;
  const s = String(input).trim();
  if (!s) return null;

  const normalized = s.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;

  return Math.round(n * 100);
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅ IMPORTANT (params e Promise)
  const pid = String(id || "").trim();
  if (!pid) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const product = await prisma.product.findUnique({
    where: { id: pid },
    select: {
      id: true,
      title: true,
      slug: true,
      sku: true,
      shortDesc: true,
      description: true,
      price: true,
      priceOld: true,
      stock: true,
      inStock: true,
      image: true,
      isFeaturedDiscounts: true,
      isFeaturedBest: true,
      categoryId: true,
      persons: true,
      pieces: true,
      sheetType: true,
      modelType: true,
      size: true,
      places: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(product);
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅
  const pid = String(id || "").trim();
  if (!pid) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const body = await req.json().catch(() => ({} as any));

  const title = String(body?.title || "").trim();
  const sku = String(body?.sku || "").trim();
  const slug = body?.slug ? String(body.slug).trim() : null;

  const shortDesc = body?.shortDesc ? String(body.shortDesc).trim() : null;
  const description = body?.description ? String(body.description).trim() : null;

  const categoryId = String(body?.categoryId || "").trim();

  const price = toCentsFromLeiString(body?.priceLei);
  const priceOld = toCentsFromLeiString(body?.priceOldLei);

  const stock = Number.isFinite(Number(body?.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : 0;
  const inStock = typeof body?.inStock === "boolean" ? body.inStock : stock > 0;

  const image = body?.image ? String(body.image).trim() : null;

  const persons = body?.persons === "" || body?.persons == null ? null : Math.max(0, Math.floor(Number(body.persons)));
  const pieces  = body?.pieces  === "" || body?.pieces  == null ? null : Math.max(0, Math.floor(Number(body.pieces)));
  const places  = body?.places  === "" || body?.places  == null ? null : Math.max(0, Math.floor(Number(body.places)));

  const sheetType = body?.sheetType ? String(body.sheetType).trim() : null;
  const modelType = body?.modelType ? String(body.modelType).trim() : null;
  const size      = body?.size ? String(body.size).trim() : null;

  const isFeaturedDiscounts = !!body?.isFeaturedDiscounts;
  const isFeaturedBest = !!body?.isFeaturedBest;

  if (!title) return NextResponse.json({ error: 
"The title is mandatory." }, { status: 400 });
  if (!sku) return NextResponse.json({ error: "SKU is mandatory." }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: 
"Category is required." }, { status: 400 });
  if (price === null) return NextResponse.json({ error: 
"The price is mandatory (USD)."}, { status: 400 });

  // NOTE: translated template comment.
  const skuExists = await prisma.product.findFirst({
    where: { sku, NOT: { id: pid } },
    select: { id: true },
  });
  if (skuExists) return NextResponse.json({ error: "SKU already exists." }, { status: 409 });

  // category must exist
  const cat = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!cat) return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });

  const updated = await prisma.product.update({
    where: { id: pid },
    data: {
      title,
      sku,
      ...(slug ? { slug } : {}),
      shortDesc: shortDesc || null,
      description: description || null,

      categoryId,

      price,
      priceOld: priceOld ?? null,

      stock,
      inStock,

      image,

      persons,
      pieces,
      places,
      sheetType,
      modelType,
      size,

      isFeaturedDiscounts,
      isFeaturedBest,
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json({ ok: true, product: updated });
}

export async function DELETE(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params; // ✅
  const pid = String(id || "").trim();
  if (!pid) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  await prisma.product.delete({ where: { id: pid } });
  return NextResponse.json({ ok: true });
}