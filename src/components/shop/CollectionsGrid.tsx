import Link from "next/link";

const collections = [
  { title: "Category One", slug: "category-one", image: "/collections/category-1.jpeg" },
  { title: "Category Two", slug: "category-two", image: "/collections/category-2.jpeg" },
  { title: "Category Three", slug: "category-three", image: "/collections/category-3.jpeg" },
  { title: "Category Four", slug: "category-four", image: "/collections/category-4.jpeg" },
  { title: "Category Five", slug: "category-five", image: "/collections/category-5.jpeg" },
  { title: "Category Six", slug: "category-six", image: "/collections/category-6.jpeg" },
];

export default function CollectionsGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6 md:py-10">
      <div className="mb-4 md:mb-5">
        <h2 className="text-lg md:text-2xl font-semibold text-black leading-tight">
          Explore collections
        </h2>
        <p className="text-xs md:text-sm text-neutral-600 mt-1">
          Pick the style that fits your store
        </p>
      </div>

      {/* ✅ mobil: 2 pe rand | desktop: exact ca inainte (sm:2, lg:3) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5">
        {collections.map((c) => (
          <div
            key={c.slug}
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-neutral-50"
          >
            <div className="aspect-[16/10] overflow-hidden">
              <img
                src={c.image}
                alt={c.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                loading="lazy"
              />
            </div>

            {/* overlay premium */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-90" />

            <div className="absolute inset-x-0 bottom-0 p-3 md:p-5">
              <div className="translate-y-2 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <p className="text-white text-sm md:text-lg font-semibold leading-snug">
                  {c.title}
                </p>

                <Link
                  href={`/categorie/${c.slug}`}
                  className="mt-2 md:mt-3 inline-flex items-center justify-center rounded-xl
                             px-3 py-2 md:px-4 md:py-2
                             text-[11px] md:text-sm font-semibold
                             text-white border border-white/25
                             bg-gradient-to-r from-black to-[#3533cd]
                             hover:opacity-95 transition"
                >
                  View collection
                </Link>
              </div>

              {/* NOTE: translated template comment. */}
              <div className="group-hover:opacity-0 transition-opacity duration-300">
                <p className="text-white text-sm md:text-lg font-semibold leading-snug">
                  {c.title}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}