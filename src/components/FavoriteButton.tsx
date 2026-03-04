"use client";

import * as React from "react";
import { getLocalFavIds, toggleLocalFav, toggleServerFav } from "@/lib/favorites-client";

function cx(...c: Array<string | false | undefined | null>) {
  return c.filter(Boolean).join(" ");
}

type Props = {
  productId: string;
  className?: string;
};

export default function FavoriteButton({ productId, className }: Props) {
  const [active, setActive] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const ids = getLocalFavIds();
    setActive(ids.includes(productId));
  }, [productId]);

  async function toggle() {
    if (loading) return;
    setLoading(true);

    try {
      // 1) local (guest)
      const local = toggleLocalFav(productId);
      setActive(local.active);

      // NOTE: translated template comment.
      try {
        await toggleServerFav(productId, local.active);
      } catch {
        // ignore (guest)
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={active ? "Remove din favorite" : "Add la favorite"}
      className={cx(
        "inline-flex items-center justify-center transition active:scale-[0.98]",
        loading && "opacity-60 cursor-not-allowed",
        active ? "text-[#3533cd]" : "text-black",
        className
      )}
    >
      <svg
  viewBox="0 0 24 24"
  className="h-4 w-4"
  stroke="currentColor"
  fill={active ? "currentColor" : "none"}
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
>
  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z" />
</svg>
    </button>
  );
}