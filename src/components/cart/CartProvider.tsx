"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, CartState } from "@/lib/cart-types";
import {
  addToCart,
  cartCount,
  cartSubtotal,
  clearCart,
  loadCart,
  removeItem,
  saveCart,
  setQty,
} from "@/lib/cart-utils";

type AppliedCoupon = {
  code: string;
  amount: number; // bani
  minSubtotal: number; // bani
};

type CartApi = {
  state: CartState;
  count: number;
  subtotal: number;

  // ✅ coupon support
  coupon: AppliedCoupon | null;
  discount: number;
  subtotalAfterDiscount: number;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;

  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartApi | null>(null);

const COUPON_STORAGE_KEY = "asta_cart_coupon";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ items: [] });

  // ✅ coupon state
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    setState(loadCart());

    // ✅ load coupon from localStorage
    try {
      const raw = localStorage.getItem(COUPON_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AppliedCoupon;
        if (parsed?.code && typeof parsed.amount === "number" && typeof parsed.minSubtotal === "number") {
          setCoupon(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    saveCart(state);
  }, [state]);

  // ✅ persist coupon
  useEffect(() => {
    try {
      if (coupon) localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
      else localStorage.removeItem(COUPON_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, [coupon]);

  const api = useMemo<CartApi>(() => {
    const count = cartCount(state);
    const subtotal = cartSubtotal(state);

    // ✅ discount & subtotal after discount
    const discount = coupon ? coupon.amount : 0;
    const subtotalAfterDiscount = Math.max(0, subtotal - discount);

    // NOTE: translated template comment.
    // NOTE: translated template comment.
    if (coupon && subtotal < coupon.minSubtotal) {
      queueMicrotask(() => setCoupon(null));
    }

    async function applyCoupon(codeRaw: string) {
      const code = String(codeRaw ?? "").trim().toUpperCase();
      if (!code) throw new Error("Cod invalid.");

      const r = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }), // NOTE: translated template comment.
      });

      const json = await r.json().catch(() => null);

      // NOTE: translated template comment.
      if (!r.ok || !json?.valid) {
        throw new Error(json?.message ?? "Cod invalid.");
      }

      const applied: AppliedCoupon = {
        code: String(json.code ?? code),
        amount: Number(json.amount ?? 0),
        minSubtotal: Number(json.minSubtotal ?? 0),
      };

      setCoupon(applied);
    }

    function removeCoupon() {
      setCoupon(null);
    }

    return {
      state,
      count,
      subtotal,

      coupon,
      discount,
      subtotalAfterDiscount,
      applyCoupon,
      removeCoupon,

      add: (item, qty = 1) => setState((s) => addToCart(s, item, qty)),
      setQty: (id, qty) => setState((s) => setQty(s, id, qty)),
      remove: (id) => setState((s) => removeItem(s, id)),
      clear: () => {
        setCoupon(null); // NOTE: translated template comment.
        return setState(clearCart());
      },
    };
  }, [state, coupon]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useCart() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart must be used inside CartProvider");
  return v;
}