"use client";

import { useEffect, useMemo, useState } from "react";

type Recipient = {
  email: string;
  name?: string;
  phone?: string;
  ordersCount?: number;
  productsCount?: number;
  totalSpent?: number; // cents
  source?: "newsletter" | "orders";
};

const LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";
const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

const nfMoney = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const money = (cents: number) => nfMoney.format((Number(cents) || 0) / 100);

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function templateShell(opts: {
  title: string;
  subtitle?: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}) {
  const brandBlue = "#3533cd";
  const ctaText = opts.ctaText || "Open store";
  const ctaUrl = opts.ctaUrl || SITE_URL;

  return `<!doctype html>
<html>
  <head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background:#f6f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="700" cellspacing="0" cellpadding="0" border="0"
            style="width:100%;max-width:700px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);
              border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">
            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#ffffff,${brandBlue});background-color:#ffffff;">
                <table role="presentation" width="100%">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img src="cid:nextcommerce_logo" width="160" alt="NextCommerce Pro"
                        style="display:block;height:auto;border:0;outline:none;text-decoration:none;max-width:160px;" />
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:Arial,sans-serif;font-size:12px;color:#ffffff;opacity:0.9;">
                        Marketing
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 24px 10px 24px;">
                <h1 style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.25;color:#111;">
                  ${opts.title}
                </h1>
                ${
                  opts.subtitle
                    ? `<p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">${opts.subtitle}</p>`
                    : ""
                }

                ${opts.bodyHtml}

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
                  <tr><td>
                    <a href="${ctaUrl}"
                      style="display:inline-block;background:linear-gradient(90deg,#000000,${brandBlue});
                        color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;
                        font-weight:700;border-radius:14px;padding:12px 16px;">
                      ${ctaText}
                    </a>
                  </td></tr>
                </table>

                <p style="margin:18px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#777;">
                  © ${new Date().getFullYear()} NextCommerce Pro. All rights reserved.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function makeTemplate(
  kind: string,
  data: { coupon?: string; note?: string; products?: { title: string; url: string }[] }
) {
  const coupon = (data.coupon || "").trim();

  if (kind === "FLASH") {
    const body = `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="background:#fafafa;border:1px solid rgba(0,0,0,0.08);border-radius:16px;">
        <tr><td style="padding:16px 16px;">
          <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
            Today only: special deals. Limited stock.
          </div>
          ${
            coupon
              ? `<div style="margin-top:12px;font-family:Arial,sans-serif;font-size:12px;color:#666;">Coupon code:</div>
                 <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:0.6px;
                    color:#111;background:#fff;border:1px dashed rgba(0,0,0,0.18);
                    padding:12px 14px;border-radius:14px;display:inline-block;">
                   ${coupon}
                 </div>`
              : ""
          }
        </td></tr>
      </table>
    `;
    return {
      subject: coupon ? `🔥 Flash Sale + coupon ${coupon}` : "🔥 Flash Sale — today only",
      html: templateShell({
        title: "Flash Sale — today only 🔥",
        subtitle: "Premium products, fast delivery, limited offers.",
        bodyHtml: body,
        ctaText: "View deals",
        ctaUrl: SITE_URL + "/promotions",
      }),
    };
  }

  if (kind === "COUPON") {
    const body = `
      <p style="margin:0 0 12px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
        We prepared a coupon you can use at checkout.
      </p>
      ${
        coupon
          ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
              style="background:#fafafa;border:1px solid rgba(0,0,0,0.08);border-radius:16px;">
              <tr><td style="padding:16px 16px;">
                <div style="font-family:Arial,sans-serif;font-size:12px;color:#666;">Coupon code:</div>
                <div style="margin-top:6px;font-family:Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:0.6px;
                    color:#111;background:#fff;border:1px dashed rgba(0,0,0,0.18);
                    padding:12px 14px;border-radius:14px;display:inline-block;">
                  ${coupon}
                </div>
                <div style="margin-top:10px;font-family:Arial,sans-serif;font-size:12px;color:#666;">
                  Apply it at checkout.
                </div>
              </td></tr>
            </table>`
          : `<div style="font-family:Arial,sans-serif;font-size:13px;color:#b00020;">
              (Add a coupon code on the right to insert it into the email.)
            </div>`
      }
    `;
    return {
      subject: coupon ? `🎁 Special coupon: ${coupon}` : "🎁 Special coupon",
      html: templateShell({
        title: "A special coupon for you 🎁",
        subtitle: "Valid for a limited time.",
        bodyHtml: body,
        ctaText: "Open store",
      }),
    };
  }

  // RECO: recommended products (links)
  const products = data.products || [];
  const cards =
    products.length > 0
      ? `<h3 style="margin:18px 0 10px 0;font-family:Arial,sans-serif;font-size:14px;color:#111;">
           Recommendations
         </h3>
         <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
          ${products
            .slice(0, 6)
            .map(
              (p) => `
              <tr>
                <td style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:14px;color:#111;">
                  <a href="${p.url}" style="color:#3533cd;text-decoration:underline;font-weight:700;">${p.title}</a>
                </td>
              </tr>`
            )
            .join("")}
         </table>`
      : `<div style="font-family:Arial,sans-serif;font-size:13px;color:#666;">
          (Add recommended products below — optional)
        </div>`;

  return {
    subject: "✨ NextCommerce Pro Recommendations",
    html: templateShell({
      title: "NextCommerce Pro Recommendations ✨",
      subtitle: "We selected a few products you may like.",
      bodyHtml: cards,
      ctaText: "View collections",
      ctaUrl: SITE_URL + "/products",
    }),
  };
}

export default function AdminMarketingPage() {
  // filters
  const [includeNewsletter, setIncludeNewsletter] = useState(true);
  const [includeOrders, setIncludeOrders] = useState(false); // safe default: do not include orders automatically
  const [minOrders, setMinOrders] = useState<number>(0);
  const [minSpentLei, setMinSpentLei] = useState<number>(0);
  const [q, setQ] = useState("");

  // recipients
  const [recLoading, setRecLoading] = useState(false);
  const [recErr, setRecErr] = useState<string | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  // campaign
  const [template, setTemplate] = useState<"FLASH" | "COUPON" | "RECO">("FLASH");
  const [coupon, setCoupon] = useState("");
  const [productsText, setProductsText] = useState(""); // "Title|url" per line
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  // sending
  const [batchSize, setBatchSize] = useState(50);
  const [offset, setOffset] = useState(0);
  const [dryRun, setDryRun] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendLog, setSendLog] = useState<Array<{ to: string; ok: boolean; error?: string }>>([]);
  const [sendInfo, setSendInfo] = useState<{ sent: number; failed: number } | null>(null);
  const [sendErr, setSendErr] = useState<string | null>(null);

  const filteredRecipients = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return recipients;
    return recipients.filter((r) => {
      const s = `${r.name || ""} ${r.email || ""} ${r.phone || ""}`.toLowerCase();
      return s.includes(qq);
    });
  }, [recipients, q]);

  const selectedEmails = useMemo(() => {
    return Object.keys(selected).filter((e) => selected[e]);
  }, [selected]);

  // auto-generate template
  useEffect(() => {
    const prods = productsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [title, url] = line.split("|").map((x) => (x || "").trim());
        return title && url ? { title, url } : null;
      })
      .filter(Boolean) as { title: string; url: string }[];

    const t = makeTemplate(template, { coupon, products: prods });
    setSubject(t.subject);
    setHtml(t.html);
  }, [template, coupon, productsText]);

  async function loadRecipients() {
    setRecLoading(true);
    setRecErr(null);
    setRecipients([]);
    setSelected({});
    setOffset(0);
    setSendLog([]);
    setSendInfo(null);
    setSendErr(null);

    try {
      const url = new URL(window.location.origin + "/api/admin/marketing/recipients");
      url.searchParams.set("includeNewsletter", includeNewsletter ? "1" : "0");
      url.searchParams.set("includeOrders", includeOrders ? "1" : "0");
      if (minOrders > 0) url.searchParams.set("minOrders", String(minOrders));
      if (minSpentLei > 0) url.searchParams.set("minSpentLei", String(minSpentLei));

      const res = await fetch(url.toString(), { cache: "no-store" as RequestCache });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Error loading recipients.");
      const items = (json?.items || []) as Recipient[];
      setRecipients(items);
    } catch (e: any) {
      setRecErr(e?.message || "Error");
    } finally {
      setRecLoading(false);
    }
  }

  function toggleAllOnPage(on: boolean) {
    const next = { ...selected };
    for (const r of filteredRecipients) next[r.email] = on;
    setSelected(next);
  }

  function toggleOne(email: string, on: boolean) {
    setSelected((s) => ({ ...s, [email]: on }));
  }

  function exportSelectedCSV() {
    const rows = [
      ["email", "name", "phone", "ordersCount", "productsCount", "totalSpent", "source"],
      ...filteredRecipients
        .filter((r) => selected[r.email])
        .map((r) => [
          r.email,
          r.name || "",
          r.phone || "",
          String(r.ordersCount || 0),
          String(r.productsCount || 0),
          ((Number(r.totalSpent) || 0) / 100).toFixed(2),
          r.source || "",
        ]),
    ];
    const csv = rows.map((r) => r.map(csvEscape).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `marketing_recipients_selected.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  async function sendBatch() {
    setSendErr(null);
    setSending(true);

    try {
      const recipientsArr = selectedEmails;
      if (!recipientsArr.length) throw new Error("Select at least one recipient.");

      const res = await fetch("/api/admin/marketing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          html,
          recipients: recipientsArr,
          batchSize,
          offset,
          dryRun,
        }),
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error || "Error sending.");

      setSendInfo({ sent: json.sent || 0, failed: json.failed || 0 });
      setSendLog((prev) => [...(prev || []), ...(json.results || [])]);
      setOffset(json.nextOffset || 0);
    } catch (e: any) {
      setSendErr(e?.message || "Error");
    } finally {
      setSending(false);
    }
  }

  const selectedCount = selectedEmails.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm text-white/60">Marketing</div>
          <div className="text-2xl font-semibold text-white">Email campaigns</div>
          <div className="text-sm text-white/55 mt-1">Select recipients, choose a template, preview, and send in batch.</div>
        </div>
      </div>

      {/* Top grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recipients panel */}
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-3">
          <div className="text-sm font-semibold text-white">Recipients</div>

          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm text-white/85">
              <input
                type="checkbox"
                checked={includeNewsletter}
                onChange={(e) => setIncludeNewsletter(e.target.checked)}
              />
              Newsletter (opt-in)
            </label>
            <label className="flex items-center gap-2 text-sm text-white/85">
              <input type="checkbox" checked={includeOrders} onChange={(e) => setIncludeOrders(e.target.checked)} />
              Orders
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="text-xs text-white/60">Min orders</div>
              <input
                value={minOrders}
                onChange={(e) => setMinOrders(Number(e.target.value || 0))}
                type="number"
                min={0}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-white/60">Min spend (in cents)</div>
              <input
                value={minSpentLei}
                onChange={(e) => setMinSpentLei(Number(e.target.value || 0))}
                type="number"
                min={0}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
              />
            </div>
          </div>

          <button
            onClick={loadRecipients}
            disabled={recLoading}
            className="w-full rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
            style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
          >
            {recLoading ? "Loading..." : "Load recipients"}
          </button>

          {recErr ? <div className="text-sm text-red-200">{recErr}</div> : null}

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 space-y-2">
            <div className="flex items-center justify-between text-sm text-white/85">
              <span>Total loaded</span>
              <span className="font-semibold text-white">{recipients.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-white/85">
              <span>Selected</span>
              <span className="font-semibold text-white">{selectedCount}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => toggleAllOnPage(true)}
                disabled={!filteredRecipients.length}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10 disabled:opacity-40"
              >
                Select all
              </button>
              <button
                onClick={() => toggleAllOnPage(false)}
                disabled={!filteredRecipients.length}
                className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10 disabled:opacity-40"
              >
                Deselect all
              </button>
            </div>

            <button
              onClick={exportSelectedCSV}
              disabled={!selectedCount}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10 disabled:opacity-40"
            >
              Export selected (CSV)
            </button>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-white/60">Search</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="name / email / phone..."
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none"
            />
          </div>
        </div>

        {/* Composer */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
          <div className="text-sm font-semibold text-white">Composer</div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <button
              onClick={() => setTemplate("FLASH")}
              className={`rounded-2xl border border-white/10 px-3 py-2 text-sm transition ${
                template === "FLASH" ? "bg-white/10 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Flash Sale
            </button>
            <button
              onClick={() => setTemplate("COUPON")}
              className={`rounded-2xl border border-white/10 px-3 py-2 text-sm transition ${
                template === "COUPON" ? "bg-white/10 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Coupon
            </button>
            <button
              onClick={() => setTemplate("RECO")}
              className={`rounded-2xl border border-white/10 px-3 py-2 text-sm transition ${
                template === "RECO" ? "bg-white/10 text-white" : "bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Recommendations
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2 space-y-1">
              <div className="text-xs text-white/60">Subject</div>
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">Coupon code (optional)</div>
              <input
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                placeholder="e.g. SAVE20"
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <div className="text-xs text-white/60">HTML (editable)</div>
              <textarea
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                rows={10}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/90 placeholder:text-white/40 outline-none resize-none font-mono"
              />
              <div className="text-xs text-white/50">* The logo is embedded via CID (nextcommerce_logo) when sending.</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-white/60">Recommended products (Title|URL, one per line)</div>
              <textarea
                value={productsText}
                onChange={(e) => setProductsText(e.target.value)}
                placeholder={`Example:
Demo Product A|${SITE_URL}/product/demo-product-a
Demo Product B|${SITE_URL}/product/demo-product-b`}
                rows={10}
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/90 placeholder:text-white/40 outline-none resize-none font-mono"
              />
              <div className="text-xs text-white/50">(Used in the “Recommendations” template — can be left empty.)</div>
            </div>
          </div>

          {/* send controls */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/85">
                <span className="text-white/70">Batch:</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={batchSize}
                  onChange={(e) => setBatchSize(Number(e.target.value || 50))}
                  className="w-[90px] rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none"
                />
                <span className="text-white/70">Offset:</span>
                <span className="font-semibold text-white">{offset}</span>

                <label className="ml-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
                  Dry-run (do not send)
                </label>
              </div>

              <button
                onClick={sendBatch}
                disabled={sending || !selectedCount}
                className="rounded-2xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(90deg,#000000,#3533cd)" }}
              >
                {sending ? "Sending..." : "Send batch (" + Math.min(batchSize, selectedCount - offset) + ")"}
              </button>
            </div>

            {sendErr ? <div className="mt-2 text-sm text-red-200">{sendErr}</div> : null}
            {sendInfo ? (
              <div className="mt-2 text-sm text-white/80">
                Batch result: <span className="text-white font-semibold">{sendInfo.sent}</span> sent •{" "}
                <span className="text-white font-semibold">{sendInfo.failed}</span> failed
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Recipients table */}
      <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="text-sm font-semibold text-white">Recipient list</div>
          <div className="text-xs text-white/60">Type: Newsletter = opt-in ✅ • Orders = use only if you have consent</div>
        </div>

        <div className="divide-y divide-white/10">
          {!filteredRecipients.length ? (
            <div className="px-4 py-6 text-sm text-white/60">— Load recipients to show them here.</div>
          ) : (
            filteredRecipients.slice(0, 500).map((r) => (
              <div key={r.email} className="px-4 py-3 flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={!!selected[r.email]}
                  onChange={(e) => toggleOne(r.email, e.target.checked)}
                />

                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white font-semibold line-clamp-1">
                    {r.name || "-"}{" "}
                    <span className="text-xs text-white/50 font-normal">
                      • {r.source === "newsletter" ? "newsletter" : "orders"}
                    </span>
                  </div>
                  <div className="text-xs text-white/60 line-clamp-1">{r.email}</div>
                  {r.phone ? <div className="text-xs text-white/50">{r.phone}</div> : null}
                </div>

                <div className="hidden md:block w-[110px] text-sm text-white/85 text-right">
                  <div className="text-xs text-white/50">Orders</div>
                  <div className="font-semibold">{r.ordersCount || 0}</div>
                </div>

                <div className="hidden md:block w-[120px] text-sm text-white/85 text-right">
                  <div className="text-xs text-white/50">Products</div>
                  <div className="font-semibold">{r.productsCount || 0}</div>
                </div>

                <div className="w-[140px] text-sm text-white text-right">
                  <div className="text-xs text-white/50">Total spent</div>
                  <div className="font-semibold">{money(r.totalSpent || 0)}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {filteredRecipients.length > 500 ? (
          <div className="px-4 py-3 text-xs text-white/60">
            Showing first 500 in the UI (performance). “Select all” uses the full filtered list.
          </div>
        ) : null}
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-sm font-semibold text-white">Preview</div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
          <div className="px-4 py-2 text-xs text-white/60 border-b border-white/10">Subject: {subject || "—"}</div>
          <div
            className="p-0"
            style={{ background: "white" }}
            dangerouslySetInnerHTML={{ __html: html || "<div style='padding:16px;font-family:Arial;'>—</div>" }}
          />
        </div>

        {sendLog.length ? (
          <div className="mt-4">
            <div className="text-sm font-semibold text-white">Send log (latest)</div>
            <div className="mt-2 max-h-[260px] overflow-auto rounded-2xl border border-white/10 bg-white/5">
              {sendLog
                .slice(-50)
                .reverse()
                .map((r, idx) => (
                  <div key={idx} className="px-4 py-2 border-b border-white/10 text-xs">
                    <span className="text-white/80">{r.to}</span>{" "}
                    {r.ok ? (
                      <span className="text-green-200">• OK</span>
                    ) : (
                      <span className="text-red-200">• FAIL: {r.error || "Error"}</span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}