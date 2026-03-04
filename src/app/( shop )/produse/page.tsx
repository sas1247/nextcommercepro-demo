import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProduseClient from "./ProduseClient";

export const dynamic = "force-dynamic";

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export default async function ProdusePage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, toInt(searchParams?.page ?? null, 1));
  const limit = 20; // how many products on the page
  const skip = (page - 1) * limit;

  const [total, items] = await Promise.all([
    prisma.product.count(),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" }, // if you haven't createdAt, I'll give you the alternative below
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        slug: true,
        price: true,
        priceOld: true,
        stock: true,
        inStock: true,
        image: true,
        category: { select: { name: true, slug: true } },
      },
    }),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold">Toate produsele</h1>
        <p className="mt-1 text-sm text-black/60">
          {total} products available in the store.
        </p>
      </div>

      <ProduseClient items={items} />

      {/* Paginare */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <Link
          href={`/produse?page=${Math.max(1, page - 1)}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-black hover:text-white"
          }`}
        >
          Back
        </Link>

        <span className="text-sm text-black/70">
          Pagina {page} din {pages}
        </span>

        <Link
          href={`/produse?page=${Math.min(pages, page + 1)}`}
          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
            page >= pages ? "pointer-events-none opacity-50" : "hover:bg-black hover:text-white"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}