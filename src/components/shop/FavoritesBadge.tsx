"use client";

import * as React from "react";
import { getLocalFavIds } from "@/lib/favorites-client";

type Props = {
  className?: string;
};

export default function FavoritesBadge({ className }: Props) {
  const [count, setCount] = React.useState(0);

  const refresh = React.useCallback(() => {
    try {
      setCount(getLocalFavIds().length);
    } catch {
      setCount(0);
    }
  }, []);

  React.useEffect(() => {
    refresh();

    const onFav = () => refresh();
    window.addEventListener("asta:favorites", onFav);

    // NOTE: translated template comment.
    const onStorage = (e: StorageEvent) => {
      if (e.key === "asta_fav_ids") refresh();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("asta:favorites", onFav);
      window.removeEventListener("storage", onStorage);
    };
  }, [refresh]);

  if (count <= 0) return null;

  return (
    <span
      className={
        className ??
        "absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#3533cd] px-1 text-[11px] font-bold text-white"
      }
    >
      {count}
    </span>
  );
}