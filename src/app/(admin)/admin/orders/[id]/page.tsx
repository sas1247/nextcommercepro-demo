"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { formatMoney } from "@/lib/money";

type Order = any;

const money = (centi: number) => (centi / 100).toFixed(2).replace(".", ",");

function statusLabel(s: string) {
  if (s === "NEW" || s === "PENDING") return "New";
  if (s === "PROCESSING") return "Processing";
  if (s === "FINALIZED") return "Finalized";
  if (s === "CANCELLED") return "Cancelled";
  return s;
}

export default function AdminOrderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [o, setO] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [status, setStatus] = useState("PROCESSING");
  const [notes, setNotes] = useState("");
  const [carrier, setCarrier] = useState("GLS");
  const [awb, setAwb] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");

  // load order
  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setErr(null);

    fetch(`/api/admin/orders/${id}`, { cache: "no-store" as RequestCache })
      .then(async (r) => {
        const j = await r.json().catch(() => null);
        if (!r.ok) throw new Error(j?.error || "Error loading order.");
        return j;
      })
      .then((json) => {
        if (!alive) return;
        setO(json);
        setStatus(json.status || "PROCESSING");
        setNotes(json.notes || "");
        setCarrier(json.carrier || "GLS");
        setAwb(json.awb || "");
        setTrackingUrl(json.trackingUrl || "");
      })
      .catch((e: any) => alive && setErr(e?.message || "Error"))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [id]);

  // NOTE: translated template comment.
  useEffect(() => {
    if (!o?.id) return;
    const current = String(o.status || "");
    if (current === "NEW" || current === "PENDING") {
      fetch(`/api/admin/orders/${o.id}`, { method: "POST" }).catch(() => {});
      // NOTE: translated template comment.
    }
  }, [o?.id]);

  const customer = useMemo(() => {
    if (!o) return "-";
    if (o.personType === "PJ") return o.pjCompany || "-";
    return o.pfName || "-";
  }, [o]);

  async function onSave() {
    if (!o?.id) return;
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${o.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes, carrier, awb, trackingUrl }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Error la salvare.");
      setO(json.order);
      router.refresh();
    } catch (e: any) {
      setErr(e?.message || "Error");
    } finally {
      setSaving(false);
    }
  }

  // 🔜 Bill (placeholder )
  async function onInvoice() {
    alert("SmartBill: connect when you have credentials/token."); //add billing program
  }

  // 🔜 AWB (placeholder )
  async function onGenerateAwb() {
    if (!o?.id) return;
    // NOTE: translated template comment.
    const fake = `GLS-${Date.now()}`;
    setAwb(fake);
    setStatus("FINALIZED");
    setTrackingUrl(`https://gls-group.com/RO/ro/urmarire-colet/?match=${fake}`); // add courier
  }

  if (loading) return <div className="text-sm text-white/70">Loading...</div>;
  if (!o) return <div className="text-sm text-red-200">Order not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Catalog</div>
          <div className="text-2xl font-semibold text-white">Edit order #{o.orderNo}</div>
          <div className="text-sm text-white/55 mt-1">Edit, save, and the status is visible in the customer's account.</div>
        </div>

        <div className="flex gap-2">
          <Link
            href="/admin/orders"
            className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
          >
            Back
          </Link>

          <button
            onClick={onSave}
            disabled={saving}
            className="rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {err ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {err}
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Customer & delivery*/}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Customer & delivery</div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/85">
            <div>
              <div className="text-xs text-white/60">Customer</div>
              <div className="font-semibold">{customer}</div>
            </div>
            <div>
              <div className="text-xs text-white/60">Payment</div>
              <div className="font-semibold">{o.paymentMethod}</div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-white/60">Address</div>
              <div className="font-semibold">
                {o.county}, {o.city}, {o.address} {o.zip ? `(${o.zip})` : ""}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <div className="text-xs text-white/60 mb-1">Internal notes</div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-white/25 resize-none"
              placeholder="e.g. customer requested delivery after 5 PM"
            />
          </div>
        </div>

        {/* STATUS + PAYMENT */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="text-sm font-semibold text-white">Status & payment</div>

          <div className="space-y-1">
            <div className="text-xs text-white/60">Status</div>
            <select
  value={status}
  onChange={(e) => setStatus(e.target.value)}
  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-white/25
             [color-scheme:dark]
             [&>option]:bg-[#0b0b13] [&>option]:text-white"
>
              <option value="NEW">New</option>
              <option value="PROCESSING">Processing</option>
              <option value="FINALIZED">Finalized</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <div className="text-xs text-white/60 mt-1">Curent: <span className="text-white/90">{statusLabel(o.status)}</span></div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-sm text-white/85 space-y-1">
  <div className="flex justify-between">
    <span>Subtotal</span>
    <span className="font-semibold">{formatMoney(o.subtotal)}</span>
  </div>

  <div className="flex justify-between">
    <span>Discount</span>
    <span className="font-semibold">{formatMoney(o.discount)}</span>
  </div>

  <div className="flex justify-between">
    <span>Shipping</span>
    <span className="font-semibold">{formatMoney(o.shipping)}</span>
  </div>

  <div className="flex justify-between pt-2 border-t border-white/10">
    <span>Total</span>
    <span className="font-semibold">{formatMoney(o.total)}</span>
  </div>
</div>

          <div className="flex gap-2">
            <button
              onClick={onInvoice}
              className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/85 hover:bg-white/10 transition"
            >
              Issue invoice (Bill)
            </button>
            <button
              onClick={onGenerateAwb}
              className="flex-1 rounded-2xl px-4 py-2 text-sm font-semibold text-white"
              style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
            >
              Generate shipping label (Courier)
            </button>
          </div>
        </div>

        {/* PRODUCTS */}
        <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="text-sm font-semibold text-white">
Products ordered</div>

          <div className="mt-3 divide-y divide-white/10">
            {(o.items || []).map((it: any) => (
              <div key={it.id} className="py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white font-semibold line-clamp-1">{it.title}</div>
                  <div className="text-xs text-white/60">
  SKU: {it.sku || "-"} · {formatMoney(it.price)} / unit
</div>
                </div>
                <div className="text-sm text-white/85">x{it.qty}</div>
              </div>
            ))}
          </div>

          {/* AWB info */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Courier</div>
              <input
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">AWB</div>
              <input
                value={awb}
                onChange={(e) => setAwb(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">Tracking URL</div>
              <input
                value={trackingUrl}
                onChange={(e) => setTrackingUrl(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}