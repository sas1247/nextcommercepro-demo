import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ReducerileLuniiClient from "./ReducerileLuniiClient";

export const dynamic = "force-dynamic";

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export default async function ReducerileLuniiPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, toInt(searchParams?.page ?? null, 1));
  const limit = 20; // 4 coloane x 5 randuri
  const skip = (page - 1) * limit;

  // total reduceri
  const total = await prisma.product.count({
    where: {
      priceOld: { not: null },
      price: { gt: 0 },
    },
  });

  // luam un lot mai mare ca sa putem filtra priceOld > price
  // NOTE: translated template comment.
  const batch = await prisma.product.findMany({
    where: {
      priceOld: { not: null },
    },
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
  });

  const discountedAll = batch
    .filter((p) => p.priceOld !== null && p.priceOld > p.price)
    .sort((a, b) => {
      const da = (a.priceOld ?? 0) - a.price;
      const db = (b.priceOld ?? 0) - b.price;
      return db - da;
    });

  const pages = Math.max(1, Math.ceil(discountedAll.length / limit));
  const items = discountedAll.slice(skip, skip + limit);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Reducerile lunii</h1>
          <p className="mt-1 text-sm text-black/60">
            Discover this month's best deals.
          </p>
        </div>

        <Link
          href="/categorie/promotii"
          className="rounded-full border px-4 py-2 text-sm font-semibold hover:bg-black hover:text-white transition"
        >
          View all promotions
        </Link>
      </div>

      <ReducerileLuniiClient items={items} />

      {/* Paginare */}
      <div className="mt-10 flex items-center justify-center gap-3">
        <Link
          href={`/reducerile-lunii?page=${Math.max(1, page - 1)}`}
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
          href={`/reducerile-lunii?page=${Math.min(pages, page + 1)}`}
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