import Link from "next/link";
import FavoriteButton from "@/components/FavoriteButton";
import { formatMoney } from "@/lib/money";

type Item = {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceOld: number | null;
  image: string | null;
};

export default function ProductCard({ item }: { item: Item }) {
  return (
    <article className="group rounded-2xl border border-black/10 bg-white overflow-hidden">
      <Link href={`/produs/${item.slug}`} className="block">
        <div className="aspect-[4/5] overflow-hidden bg-neutral-50">
          <img
            src={item.image ?? "/products/placeholder.jpeg"}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/produs/${item.slug}`} className="block">
          <h3 className="text-sm font-medium text-black line-clamp-2">{item.title}</h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm font-semibold text-black">{formatMoney(item.price)}</span>
          {item.priceOld ? (
            <span className="text-xs text-neutral-500 line-through">{formatMoney(item.priceOld)}</span>
          ) : null}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            className="flex-1 rounded-xl px-3 py-2 text-xs font-semibold text-white
                       bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
            onClick={() => console.log("add-to-cart", item.id)}
          >
            Add to cart
          </button>

          <FavoriteButton
            productId={item.id}
            className="w-10 h-10 rounded-xl border border-black/10 hover:bg-black hover:text-white transition"
          />
        </div>
      </div>
    </article>
  );
}