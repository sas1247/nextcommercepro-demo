const KEY = "asta_fav_ids";

export function getLocalFavIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    const ids = raw ? JSON.parse(raw) : [];
    return Array.isArray(ids) ? ids.map(String) : [];
  } catch {
    return [];
  }
}

export function setLocalFavIds(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
}

function emitFavEvent() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("asta:favorites"));
  }
}

export function toggleLocalFav(productId: string) {
  const ids = getLocalFavIds();
  const exists = ids.includes(productId);
  const next = exists ? ids.filter((x) => x !== productId) : [...ids, productId];

  setLocalFavIds(next);
  emitFavEvent();

  return { active: !exists, ids: next };
}

/** Favorites client helpers. */
export function removeLocalFav(productId: string) {
  const ids = getLocalFavIds();
  const next = ids.filter((x) => x !== productId);

  setLocalFavIds(next);
  emitFavEvent();

  return { ids: next };
}

export async function getServerFavIds(): Promise<string[]> {
  const res = await fetch("/api/favorites/ids");
  const data = await res.json().catch(() => ({}));
  return Array.isArray((data as any)?.ids) ? (data as any).ids.map(String) : [];
}

/**
 * shouldBeActive:
 * - true  => add (POST /api/favorites)
 * - false => remove (DELETE /api/favorites/:productId)
 */
export async function toggleServerFav(productId: string, shouldBeActive: boolean) {
  const res = await fetch(
    shouldBeActive ? "/api/favorites" : `/api/favorites/${productId}`,
    {
      method: shouldBeActive ? "POST" : "DELETE",
      headers: shouldBeActive ? { "Content-Type": "application/json" } : undefined,
      body: shouldBeActive ? JSON.stringify({ productId }) : undefined,
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Favorites error.");
}

export async function syncLocalToServer() {
  const ids = getLocalFavIds();
  if (!ids.length) return;

  const res = await fetch("/api/favorites/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) return;

  const finalIds: string[] = Array.isArray((data as any)?.ids) ? (data as any).ids.map(String) : [];
  setLocalFavIds(finalIds);
  emitFavEvent();
}