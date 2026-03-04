import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    // slug = ultima parte din /api/products/<slug>
    const parts = url.pathname.split("/").filter(Boolean);
    const slug = parts[parts.length - 1];

    if (!slug || slug === "products") {
      return NextResponse.json({ message: "Missing slug param" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { slug },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDesc: true,
        description: true, // NOTE: translated template comment.
        sku: true,
        price: true,
        priceOld: true,
        stock: true,
        inStock: true,
        image: true,
        createdAt: true,
        updatedAt: true,
        category: { select: { name: true, slug: true } },

        persons: true,
        pieces: true,
        sheetType: true,
        modelType: true,
        size: true,
        places: true,
      },
    });

    if (!product) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err: any) {
    console.error("GET /api/products/[slug] error:", err);
    return NextResponse.json(
      { message: "Server error", detail: String(err?.message ?? err) },
      { status: 500 }
    );
  }
}