import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function toInt(v: string | null, fallback: number) {
  if (v === null || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

function parseList(v: string | null) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseIntList(v: string | null) {
  return parseList(v)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // query params
  const category = searchParams.get("category"); // slug categorie
  const page = Math.max(1, toInt(searchParams.get("page"), 1));
  const limit = Math.min(48, Math.max(1, toInt(searchParams.get("limit"), 24)));

  // price in cents (USD*100))
  const min = Math.max(0, toInt(searchParams.get("min"), 0));
  const max = Math.max(min, toInt(searchParams.get("max"), 999999999));

  // sort: newest | price_asc | price_desc
  const sort = searchParams.get("sort") || "newest";

  
// ✅ new filters (multiple)
  const persons = parseIntList(searchParams.get("persons")); // ex: 1,2
  const pieces = parseIntList(searchParams.get("pieces"));   // ex: 3,4,6,8
  const places = parseIntList(searchParams.get("places"));   // ex: 1,2,3,4

  const sheetType = parseList(searchParams.get("sheetType")); // elastic,without
  const modelType = parseList(searchParams.get("modelType")); // 3d,printed,striped,satin,plain
  const size = parseList(searchParams.get("size"));           // 140x200,200x230

  const where: any = {
    inStock: true,
    price: { gte: min, lte: max },
  };

  // NOTE: translated template comment.
  if (category) {
    where.category = { slug: category };
  }

  // NOTE: translated template comment.
  if (persons.length) where.persons = { in: persons };
  if (pieces.length) where.pieces = { in: pieces };
  if (places.length) where.places = { in: places };

  if (sheetType.length) where.sheetType = { in: sheetType };
  if (modelType.length) where.modelType = { in: modelType };
  if (size.length) where.size = { in: size };

  const orderBy =
    sort === "price_asc"
      ? { price: "asc" as const }
      : sort === "price_desc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        priceOld: true,
        image: true,
        stock: true,
        inStock: true,

        // NOTE: translated template comment.
        persons: true,
        pieces: true,
        sheetType: true,
        modelType: true,
        size: true,
        places: true,

        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return NextResponse.json({
    items,
    page,
    pages,
    total,
    limit,
  });
}