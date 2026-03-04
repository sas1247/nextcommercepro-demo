import { CartItem, CartState, CART_STORAGE_KEY } from "./cart-types";

export function loadCart(): CartState {
  if (typeof window === "undefined") return { items: [] };
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return { items: [] };
    const parsed = JSON.parse(raw) as CartState;
    if (!parsed?.items || !Array.isArray(parsed.items)) return { items: [] };
    return parsed;
  } catch {
    return { items: [] };
  }
}

export function saveCart(state: CartState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function addToCart(state: CartState, item: Omit<CartItem, "qty">, qty: number): CartState {
  const q = Math.max(1, Math.floor(qty || 1));
  const idx = state.items.findIndex((x) => x.id === item.id);
  if (idx === -1) {
    return { items: [...state.items, { ...item, qty: q }] };
  }
  const next = [...state.items];
  next[idx] = { ...next[idx], qty: Math.min(99, next[idx].qty + q) };
  return { items: next };
}

export function setQty(state: CartState, id: string, qty: number): CartState {
  const q = Math.max(1, Math.floor(qty || 1));
  return { items: state.items.map((x) => (x.id === id ? { ...x, qty: Math.min(99, q) } : x)) };
}

export function removeItem(state: CartState, id: string): CartState {
  return { items: state.items.filter((x) => x.id !== id) };
}

export function clearCart(): CartState {
  return { items: [] };
}

export function cartCount(state: CartState) {
  return state.items.reduce((a, x) => a + x.qty, 0);
}

export function cartSubtotal(state: CartState) {
  return state.items.reduce((a, x) => a + x.price * x.qty, 0);
}