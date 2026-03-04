export type CartItem = {
  id: string;
  slug: string;
  title: string;
  price: number; // bani (ex: 13999)
  priceOld?: number | null;
  image?: string | null;
  qty: number;
};

export type CartState = {
  items: CartItem[];
};

export const CART_STORAGE_KEY = "astashop_cart_v1";