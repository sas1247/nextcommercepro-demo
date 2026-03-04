import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function toCentsFromLeiString(input: any): number | null {
  if (input === null || input === undefined) return null;
  const s = String(input).trim();
  if (!s) return null;

  // NOTE: translated template comment.
  const normalized = s.replace(/\s/g, "").replace(",", ".");
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;

  return Math.round(n * 100);
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // diacritice
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

async function ensureUniqueSlug(base: string) {
  let slug = base || "produs";
  let i = 2;
  while (true) {
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (!exists) return slug;
    slug = `${base}-${i++}`;
  }
}

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
  const limit = Math.min(100, Math.max(5, toInt(url.searchParams.get("limit"), 20)));
  const q = (url.searchParams.get("q") || "").trim();

  const where =
    q.length > 0
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { sku: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        sku: true,
        price: true,
        priceOld: true,
        stock: true,
        inStock: true,
        image: true,
        createdAt: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  return NextResponse.json({
    page,
    pages: Math.max(1, Math.ceil(total / limit)),
    total,
    limit,
    items,
  });
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({} as any));

  const title = String(body?.title || "").trim();
  const sku = String(body?.sku || "").trim();
  const shortDesc = body?.shortDesc ? String(body.shortDesc).trim() : null;
  const description = body?.description ? String(body.description).trim() : null; // ✅ NOU

  const categoryId = String(body?.categoryId || "").trim();

  // price/priceOld come as a string USD (ex "259.99") or number
  const price = toCentsFromLeiString(body?.priceLei);
  const priceOld = toCentsFromLeiString(body?.priceOldLei);

  const stock = Number.isFinite(Number(body?.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : 0;
  const inStock =
    typeof body?.inStock === "boolean" ? body.inStock : stock > 0 ? true : false;

  const isFeaturedDiscounts = !!body?.isFeaturedDiscounts;
  const isFeaturedBest = !!body?.isFeaturedBest;

  const persons =
    body?.persons === "" || body?.persons === null || body?.persons === undefined
      ? null
      : Math.max(0, Math.floor(Number(body.persons)));

  const pieces =
    body?.pieces === "" || body?.pieces === null || body?.pieces === undefined
      ? null
      : Math.max(0, Math.floor(Number(body.pieces)));

  const sheetType = body?.sheetType ? String(body.sheetType).trim() : null;
  const modelType = body?.modelType ? String(body.modelType).trim() : null;
  const size = body?.size ? String(body.size).trim() : null;

  const places =
    body?.places === "" || body?.places === null || body?.places === undefined
      ? null
      : Math.max(0, Math.floor(Number(body.places)));

  const image = body?.image ? String(body.image).trim() : null;

  if (!title) return NextResponse.json({ error: "The title is mandatory." }, { status: 400 });
  if (!sku) return NextResponse.json({ error: 
"SKU is mandatory." }, { status: 400 });
  if (!categoryId) return NextResponse.json({ error: "Category is required." }, { status: 400 });
  if (price === null) return NextResponse.json({ error: "The price is mandatory (USD)." }, { status: 400 });
  if (price < 0) return NextResponse.json({ error: "Price invalid." }, { status: 400 });

  // category must exist
  const cat = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!cat) return NextResponse.json({ error: "Selected category does not exist." }, { status: 400 });

  // SKU unique
  const skuExists = await prisma.product.findUnique({ where: { sku } });
  if (skuExists) return NextResponse.json({ error: "SKU already exists." }, { status: 409 });

  // slug
  const baseSlug = slugify(String(body?.slug || title));
  const slug = await ensureUniqueSlug(baseSlug);

  const created = await prisma.product.create({
    data: {
      title,
      slug,
      sku,
      shortDesc: shortDesc || null,
    description: description || null, // ✅ NOU

      price,
      priceOld: priceOld ?? null,
      stock,
      inStock,

      isFeaturedDiscounts,
      isFeaturedBest,

      categoryId,

      image,

      persons,
      pieces,
      sheetType,
      modelType,
      size,
      places,
    },
    select: { id: true, slug: true },
  });

  return NextResponse.json({ ok: true, product: created });
}