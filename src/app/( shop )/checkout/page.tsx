"use client";

import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";

type PersonType = "PF" | "PJ";
type PaymentMethod = "COD" | "CARD";

function money(centi: number) {
  return (centi / 100).toFixed(2).replace(".", ",");
}

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const items = cart.state.items;

  // NOTE: translated template comment.
  const shipping = cart.subtotalAfterDiscount >= 40000 ? 0 : 1699;
  const total = cart.subtotalAfterDiscount + shipping;

  const [personType, setPersonType] = useState<PersonType>("PF");
  const [payment, setPayment] = useState<PaymentMethod>("COD");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- PF fields
  const [pfName, setPfName] = useState("");
  const [pfPhone, setPfPhone] = useState("");
  const [pfEmail, setPfEmail] = useState("");

  // --- PJ fields
  const [pjCompany, setPjCompany] = useState("");
  const [pjCui, setPjCui] = useState("");
  const [pjRegCom, setPjRegCom] = useState("");
  const [pjContact, setPjContact] = useState("");
  const [pjPhone, setPjPhone] = useState("");
  const [pjEmail, setPjEmail] = useState("");

  // --- address
  const [county, setCounty] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");

  const [notes, setNotes] = useState("");

  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // NOTE: translated template comment.
  useEffect(() => {
    let cancelled = false;

    async function autofill() {
      try {
        const res = await fetch("/api/account/billing", { cache: "no-store" });
        if (!res.ok) return; // NOTE: translated template comment.
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;

        const billing = (data as any)?.billing;
        const shipping = (data as any)?.shipping;

        if (billing?.personType === "PF") {
          setPersonType("PF");
          setPfName(billing?.pfName || "");
          setPfPhone(billing?.pfPhone || "");
          setPfEmail(billing?.pfEmail || "");
        } else if (billing?.personType === "PJ") {
          setPersonType("PJ");
          setPjCompany(billing?.pjCompany || "");
          setPjCui(billing?.pjCui || "");
          setPjRegCom(billing?.pjRegCom || "");
          setPjContact(billing?.pjContact || "");
          setPjPhone(billing?.pjPhone || "");
          setPjEmail(billing?.pjEmail || "");
        }

        if (shipping) {
          setCounty(shipping?.county || "");
          setCity(shipping?.city || "");
          setAddress(shipping?.address1 || "");
          setZip(shipping?.zip || "");
        }
      } catch {
        // NOTE: translated template comment.
      }
    }

    autofill();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => {
    if (!agreePrivacy || !agreeTerms) return false;
    if (!county.trim() || !city.trim() || !address.trim()) return false;

    if (personType === "PF") {
      if (!pfName.trim() || !pfPhone.trim() || !pfEmail.trim()) return false;
    } else {
      if (!pjCompany.trim() || !pjCui.trim() || !pjContact.trim() || !pjPhone.trim() || !pjEmail.trim()) return false;
    }

    return items.length > 0;
  }, [
    agreePrivacy,
    agreeTerms,
    county,
    city,
    address,
    personType,
    pfName,
    pfPhone,
    pfEmail,
    pjCompany,
    pjCui,
    pjContact,
    pjPhone,
    pjEmail,
    items.length,
  ]);

  // NOTE: translated template comment.
  async function saveProfileIfLoggedIn() {
    try {
      const billingPayload = {
        personType,

        // PF
        pfName: pfName.trim(),
        pfPhone: pfPhone.trim(),
        pfEmail: pfEmail.trim(),

        // PJ
        pjCompany: pjCompany.trim(),
        pjCui: pjCui.trim(),
        pjRegCom: pjRegCom.trim(),
        pjContact: pjContact.trim(),
        pjPhone: pjPhone.trim(),
        pjEmail: pjEmail.trim(),

        // Shipping
        county: county.trim(),
        city: city.trim(),
        address: address.trim(),
        zip: zip.trim() || null,
      };

      const r = await fetch("/api/account/billing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(billingPayload),
      });

      // NOTE: translated template comment.
      if (!r.ok) return;
    } catch {
      // NOTE: translated template comment.
    }
  }

  async function onSubmit() {
    setErr(null);
    if (!canSubmit) {
      setErr("Please complete the required fields and accept the agreements.");
      return;
    }

    setBusy(true);
    try {
      // NOTE: translated template comment.
      const payload = {
        personType,
        payment,
        customer:
          personType === "PF"
            ? { name: pfName.trim(), phone: pfPhone.trim(), email: pfEmail.trim() }
            : {
                company: pjCompany.trim(),
                cui: pjCui.trim(),
                regCom: pjRegCom.trim(),
                contact: pjContact.trim(),
                phone: pjPhone.trim(),
                email: pjEmail.trim(),
              },
        shippingAddress: {
          county: county.trim(),
          city: city.trim(),
          address: address.trim(),
          zip: zip.trim() || null,
        },
        notes: notes.trim() || null,
        coupon: cart.coupon ? { code: cart.coupon.code } : null,

        // ⚠️ important: pentru securitate, la Stripe vom trimite doar id + qty,
        // NOTE: translated template comment.
        items: items.map((x) => ({ id: x.id, qty: x.qty })),
      };

      // NOTE: translated template comment.
      await saveProfileIfLoggedIn();

      if (payment === "COD") {
        const r = await fetch("/api/orders/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const json = await r.json().catch(() => null);

        if (!r.ok || !json?.orderId) {
          throw new Error(json?.message ?? "Nu s-a putut crea comanda.");
        }

        cart.clear(); // NOTE: translated template comment.
        router.push(`/checkout/success?orderNo=${json.orderNo}`);
        return;
      }

      // NOTE: translated template comment.
      const r = await fetch("/api/checkout/create-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await r.json().catch(() => null);

      if (!r.ok || !json?.url) {
        throw new Error(json?.message ?? "We couldn't initialize online payment.");
      }

      // redirect la Stripe Checkout
      window.location.href = json.url;
    } catch (e: any) {
      setErr(e?.message ?? "An error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          <div className="text-xl font-semibold">Your cart is empty</div>
          <div className="mt-2 text-sm text-black/60">Add products before checking out.</div>
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
      {/* LEFT: form */}
      <div className="rounded-3xl border border-black/10 bg-white p-6">
        <div className="text-xl font-semibold">Checkout</div>
        <div className="mt-2 text-sm text-black/60">
          Fill in your details, choose a payment method, and place your order.
        </div>

        {/* Person type */}
        <div className="mt-6">
          <div className="text-sm font-semibold">Tip client</div>
          <div className="mt-2 inline-flex rounded-2xl border border-black/10 overflow-hidden">
            <button
              type="button"
              onClick={() => setPersonType("PF")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                personType === "PF"
                  ? "text-white bg-gradient-to-r from-black to-[#3533cd]"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              Individual
            </button>
            <button
              type="button"
              onClick={() => setPersonType("PJ")}
              className={`px-4 py-2 text-sm font-semibold transition ${
                personType === "PJ"
                  ? "text-white bg-gradient-to-r from-black to-[#3533cd]"
                  : "text-black/70 hover:bg-black/5"
              }`}
            >
              Company
            </button>
          </div>
        </div>

        {/* PF / PJ fields */}
        <div className="mt-6">
          <div className="text-sm font-semibold">Billing details</div>

          {personType === "PF" ? (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Full name *">
                <input
                  value={pfName}
                  onChange={(e) => setPfName(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: John Smith"
                />
              </Field>

              <Field label="Phone *">
                <input
                  value={pfPhone}
                  onChange={(e) => setPfPhone(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: 07xx xxx xxx"
                />
              </Field>

              <Field label="Email *" className="md:col-span-2">
                <input
                  value={pfEmail}
                  onChange={(e) => setPfEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g. email@domain.com"
                />
              </Field>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Company name *">
                <input
                  value={pjCompany}
                  onChange={(e) => setPjCompany(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: Demo Company LLC"
                />
              </Field>

              <Field label="CUI *">
                <input
                  value={pjCui}
                  onChange={(e) => setPjCui(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: RO12345678"
                />
              </Field>

              <Field label="Nr. Reg. Com.">
                <input
                  value={pjRegCom}
                  onChange={(e) => setPjRegCom(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: J40/1234/2024"
                />
              </Field>

              <Field label="Contact person *">
                <input
                  value={pjContact}
                  onChange={(e) => setPjContact(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: John Smith"
                />
              </Field>

              <Field label="Phone *">
                <input
                  value={pjPhone}
                  onChange={(e) => setPjPhone(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="Ex: 07xx xxx xxx"
                />
              </Field>

              <Field label="Email *">
                <input
                  value={pjEmail}
                  onChange={(e) => setPjEmail(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  placeholder="e.g. billing@company.com"
                />
              </Field>
            </div>
          )}
        </div>

        {/* Shipping address */}
        <div className="mt-8">
          <div className="text-sm font-semibold">Shipping address</div>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="State/Region *">
              <input
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. California"
              />
            </Field>

            <Field label="City *">
              <input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="e.g. Los Angeles"
              />
            </Field>

            <Field label="Full address *" className="md:col-span-2">
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Street, number, building, unit, etc."
              />
            </Field>

            <Field label="Postal code">
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                className="w-full rounded-2xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Ex: 505400"
              />
            </Field>
          </div>
        </div>

        {/* Payment */}
        <div className="mt-8">
          <div className="text-sm font-semibold">Payment method</div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <label
              className={`rounded-3xl border p-4 cursor-pointer transition ${
                payment === "COD" ? "border-black/20 ring-2 ring-black/10" : "border-black/10 hover:bg-black/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="pay"
                  checked={payment === "COD"}
                  onChange={() => setPayment("COD")}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-semibold">Cash on delivery</div>
                  <div className="mt-1 text-xs text-black/60">
                    Pay the courier upon delivery (cash on delivery).
                  </div>
                </div>
              </div>
            </label>

            <label
              className={`rounded-3xl border p-4 cursor-pointer transition ${
                payment === "CARD" ? "border-black/20 ring-2 ring-black/10" : "border-black/10 hover:bg-black/5"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="radio"
                  name="pay"
                  checked={payment === "CARD"}
                  onChange={() => setPayment("CARD")}
                  className="mt-1"
                />
                <div>
                  <div className="text-sm font-semibold">Pay online with card</div>
                  <div className="mt-1 text-xs text-black/60">
                    Secure online payment processed via a protected system.
                  </div>
                </div>
              </div>
            </label>
          </div>

          {payment === "CARD" ? (
            <div className="mt-3 rounded-2xl border border-black/10 bg-neutral-50 p-3 text-sm">
              <span className="font-semibold">Note:</span> After submitting your order, you will be redirected to the secure payment processor to complete the transaction.
              
            </div>
          ) : null}
        </div>

        {/* Notes */}
        <div className="mt-8">
          <div className="text-sm font-semibold">Order notes</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-3 w-full min-h-[110px] rounded-3xl border border-black/10 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
            placeholder="e.g. Call before delivery, preferred time window, etc."
          />
        </div>

        {/* Agreements */}
        <div className="mt-8 space-y-3">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-1"
            />
            <span className="text-black/80">
              I have read and agree to{" "}
              <Link href="/politica-de-confidentialitate" className="font-semibold hover:underline">
                Privacy policy
              </Link>
              .
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-1"
            />
            <span className="text-black/80">
              I have read and agree to{" "}
              <Link href="/termeni-si-conditii" className="font-semibold hover:underline">
                Terms and conditions
              </Link>
              .
            </span>
          </label>
        </div>

        {err ? <div className="mt-4 text-sm text-red-600">{err}</div> : null}

        <button
          type="button"
          disabled={!canSubmit || busy}
          onClick={onSubmit}
          className="mt-8 w-full rounded-2xl px-5 py-3 text-sm font-semibold text-white
                     bg-gradient-to-r from-black to-[#3533cd]
                     hover:opacity-95 transition disabled:opacity-50"
        >
          {busy ? "Sending..." : payment === "CARD" ? "Place order & pay" : "Place order"}
        </button>

        <div className="mt-3 text-xs text-black/60">
          By placing the order, you confirm the information is correct.
        </div>
      </div>

      {/* RIGHT: summary */}
      <div className="rounded-3xl border border-black/10 bg-white p-6 h-fit">
        <div className="text-xl font-semibold">Order summary</div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-black/60">Subtotal</span>
            <span className="font-semibold">{formatMoney(cart.subtotal)}</span>
          </div>

          {cart.discount > 0 && cart.coupon ? (
            <div className="flex justify-between">
              <span className="text-black/60">Voucher ({cart.coupon.code})</span>
              <span className="font-semibold text-emerald-700">-{formatMoney(cart.discount)}</span>
            </div>
          ) : null}

          <div className="flex justify-between">
            <span className="text-black/60">Shipping</span>
            <span className="font-semibold">
  {shipping === 0 ? "Free" : formatMoney(shipping)}
</span>
          </div>

          <div className="h-px bg-black/10 my-2" />

          <div className="flex justify-between text-base">
            <span className="font-semibold">Total</span>
            <span className="font-semibold">{formatMoney(total)}</span>
          </div>

          <div className="mt-2 text-xs text-black/60">
            Free shipping for orders over <span className="font-semibold">{formatMoney(40000)}</span>.
          </div>
        </div>

        {/* items preview */}
        <div className="mt-6 rounded-2xl border border-black/10 p-4">
          <div className="text-sm font-semibold">Products</div>
          <div className="mt-3 space-y-3">
            {items.map((x) => (
              <div key={x.id} className="flex items-center gap-3">
                <img
                  src={x.image ?? "/products/placeholder.jpeg"}
                  alt={x.title}
                  className="h-12 w-12 rounded-xl object-cover bg-neutral-50"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium line-clamp-1">{x.title}</div>
                  <div className="text-xs text-black/60">
                    {x.qty} × {formatMoney(x.price)}
                  </div>
                </div>
                <div className="text-sm font-semibold">{formatMoney(x.price * x.qty)}</div>
              </div>
            ))}
          </div>

          <Link href="/cart" className="mt-4 inline-flex text-sm font-semibold hover:underline">
            Edit cart
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className ?? ""}>
      <div className="text-xs font-semibold text-black/70">{label}</div>
      <div className="mt-2">{children}</div>
    </div>
  );
}