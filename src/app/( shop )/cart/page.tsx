"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";
import { formatMoney } from "@/lib/money";

export default function CartPage() {
  const cart = useCart();
  const items = cart.state.items;

  const { coupon, applyCoupon, removeCoupon, discount } = cart;
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onApply() {
    setBusy(true);
    setMsg(null);
    setErr(null);
    try {
      await applyCoupon(code);
      setMsg("Coupon applied successfully.");
    } catch (e: any) {
      setErr(e?.message ?? "Invalid code.");
    } finally {
      setBusy(false);
    }
  }

  // Shipping + total on subtotal AFTER discount (recommended)
  // NOTE: prices are in cents
  const shipping = cart.subtotalAfterDiscount >= 40000 ? 0 : 1699; // 16.99 in default currency under threshold
  const total = cart.subtotalAfterDiscount + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-xl font-semibold">Your cart is empty</div>
          <div className="mt-2 text-sm text-black/60">Add products and come back here to check out.</div>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-black to-[#3533cd]"
          >
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8">
      <div className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="text-xl font-semibold">Shopping cart</div>

        <div className="mt-6 space-y-4">
          {items.map((x) => (
            <div
              key={x.id}
              className="flex flex-col md:flex-row gap-4 rounded-2xl border border-black/10 p-4"
            >
              <img
                src={x.image ?? "/products/placeholder.jpeg"}
                alt={x.title}
                className="h-24 w-24 rounded-xl object-cover bg-neutral-50"
              />

              <div className="flex-1 min-w-0">
                <Link href={`/product/${x.slug}`} className="font-semibold hover:underline block">
                  <span className="block break-words">{x.title}</span>
                </Link>

                <div className="mt-1 text-sm text-black/60">{formatMoney(x.price)}</div>

                <div className="mt-2 text-right font-semibold md:hidden">{formatMoney(x.price * x.qty)}</div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="inline-flex items-center rounded-2xl border border-black/10 overflow-hidden">
                    <button
                      onClick={() => cart.setQty(x.id, x.qty - 1)}
                      className="px-3 py-2 text-sm hover:bg-black hover:text-white transition"
                    >
                      -
                    </button>
                    <div className="w-12 text-center text-sm font-semibold">{x.qty}</div>
                    <button
                      onClick={() => cart.setQty(x.id, x.qty + 1)}
                      className="px-3 py-2 text-sm hover:bg-black hover:text-white transition"
                    >
                      +
                    </button>
                  </div>

                  <button onClick={() => cart.remove(x.id)} className="text-sm text-black/60 hover:text-black">
                    Remove
                  </button>
                </div>
              </div>

              <div className="hidden md:block text-right font-semibold whitespace-nowrap">
                {formatMoney(x.price * x.qty)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-black/10 bg-white p-6 h-fit">
        <div className="text-xl font-semibold">Summary</div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-black/60">Subtotal</span>
            <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
          </div>

          {discount > 0 && coupon ? (
            <div className="flex justify-between">
              <span className="text-black/60">
                Coupon (<span className="font-semibold text-black">{coupon.code}</span>)
              </span>
              <span className="font-semibold text-emerald-600">- {formatMoney(discount)}</span>
            </div>
          ) : null}

          <div className="flex justify-between">
            <span className="text-black/60">Shipping</span>
            <span className="font-semibold">{shipping === 0 ? "Free" : formatMoney(shipping)}</span>
          </div>

          <div className="h-px bg-black/10 my-2" />

          <div className="flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatMoney(total)}</span>
          </div>
        </div>

        {/* Coupon block */}
        <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
          <div className="text-sm font-semibold">Coupon</div>

          {coupon ? (
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-sm text-black/70">
                Applied: <span className="font-semibold text-black">{coupon.code}</span>{" "}
                <span className="text-black/50">(-{formatMoney(coupon.amount)})</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  removeCoupon();
                  setCode("");
                  setMsg(null);
                  setErr(null);
                }}
                className="text-xs font-semibold rounded-xl px-3 py-2 border border-black/10 hover:bg-black hover:text-white transition whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          ) : (
            <div className="mt-2 flex flex-col sm:flex-row gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SAVE20"
                className="flex-1 rounded-xl border border-black/10 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
              <button
                type="button"
                onClick={onApply}
                disabled={busy || !code.trim()}
                className="w-full sm:w-auto rounded-xl px-4 py-2 text-sm font-semibold text-white whitespace-nowrap
                           bg-gradient-to-r from-black to-[#3533cd] disabled:opacity-50"
              >
                {busy ? "Applying..." : "Apply"}
              </button>
            </div>
          )}

          {err ? <div className="mt-2 text-xs text-red-600">{err}</div> : null}
          {msg ? <div className="mt-2 text-xs text-emerald-600">{msg}</div> : null}
        </div>

        <Link
          href="/checkout"
          className="mt-6 block rounded-2xl px-5 py-3 text-sm font-semibold text-white text-center
                     bg-gradient-to-r from-black to-[#3533cd] hover:opacity-95 transition"
        >
          Proceed to checkout
        </Link>

        <div className="mt-4 text-xs text-black/60">
          Free shipping for orders over <span className="font-semibold">{formatMoney(40000)}</span>.
        </div>
      </div>
    </div>
  );
}