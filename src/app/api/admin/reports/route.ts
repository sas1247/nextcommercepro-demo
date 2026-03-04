// src/app/api/admin/reports/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function asDateStart(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function asDateEnd(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

function parseYMD(s: string | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  if (!Number.isFinite(d.getTime())) return null;
  return d;
}

function normEmail(o: any) {
  return String(o?.pfEmail || o?.pjEmail || "").trim().toLowerCase();
}
function displayName(o: any) {
  if (o?.personType === "PJ") return String(o?.pjCompany || "").trim() || "(PJ)";
  return String(o?.pfName || "").trim() || "(PF)";
}
function pickPhone(o: any) {
  return String(o?.pfPhone || o?.pjPhone || "").trim();
}
function safeNum(n: any) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}

function toCSV(rows: Array<Record<string, any>>) {
  const headerSet = new Set<string>();
  for (const row of rows) {
    for (const k of Object.keys(row || {})) headerSet.add(k);
  }
  const headers = Array.from(headerSet);

  const esc = (v: any) => {
    const s = String(v ?? "");
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const lines = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => esc((r as any)?.[h])).join(",")),
  ];

  return lines.join("\n");
}

export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const fromRaw = url.searchParams.get("from");
    const toRaw = url.searchParams.get("to");
    const wantCSV = url.searchParams.get("format") === "csv";

    const now = new Date();
    const fromD = parseYMD(fromRaw);
    const toD = parseYMD(toRaw);

    const from = fromD ? asDateStart(fromD) : asDateStart(now);
    const to = toD ? asDateEnd(toD) : asDateEnd(now);

    const orders = await prisma.order.findMany({
      where: { createdAt: { gte: from, lte: to } },
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true,
        orderNo: true,
        createdAt: true,
        status: true,
        paymentMethod: true,

        personType: true,
        pfName: true,
        pfEmail: true,
        pfPhone: true,
        pjCompany: true,
        pjEmail: true,
        pjPhone: true,

        county: true,
        city: true,
        address: true,
        zip: true,

        subtotal: true,
        discount: true,
        shipping: true,
        total: true,

        items: {
          select: {
            id: true,
            productId: true,
            title: true,
            sku: true,
            price: true,
            qty: true,
          },
        },
      },
    });

    // ===== KPI + breakdown =====
    let ordersCount = 0;
    let itemsCount = 0;

    let subtotalSum = 0;
    let discountSum = 0;
    let shippingSum = 0;
    let totalSum = 0;

    const statusCounts: Record<string, number> = {};
    const paymentCounts: Record<string, number> = {};

    const customers = new Map<
      string,
      {
        email: string;
        name: string;
        phone: string;
        ordersCount: number;
        productsCount: number;
        totalSpent: number;
      }
    >();

    const topProducts = new Map<
      string,
      { key: string; title: string; sku: string; qty: number; revenue: number }
    >();

    for (const o of orders) {
      ordersCount += 1;

      subtotalSum += safeNum(o.subtotal);
      discountSum += safeNum(o.discount);
      shippingSum += safeNum(o.shipping);
      totalSum += safeNum(o.total);

      const st = String(o.status || "UNKNOWN");
      statusCounts[st] = (statusCounts[st] || 0) + 1;

      const pm = String(o.paymentMethod || "UNKNOWN");
      paymentCounts[pm] = (paymentCounts[pm] || 0) + 1;

      const email = normEmail(o) || "(fara-email)";
      const name = displayName(o);
      const phone = pickPhone(o);

      let cust = customers.get(email);
      if (!cust) {
        cust = { email, name, phone, ordersCount: 0, productsCount: 0, totalSpent: 0 };
        customers.set(email, cust);
      }

      cust.ordersCount += 1;
      cust.totalSpent += safeNum(o.total);

      for (const it of o.items || []) {
        const q = safeNum(it.qty);
        itemsCount += q;
        cust.productsCount += q;

        const key = String(it.productId || it.sku || it.title || it.id);
        let tp = topProducts.get(key);
        if (!tp) {
          tp = {
            key,
            title: String(it.title || ""),
            sku: String(it.sku || ""),
            qty: 0,
            revenue: 0,
          };
          topProducts.set(key, tp);
        }
        tp.qty += q;
        tp.revenue += safeNum(it.price) * q; // bani * qty
      }
    }

    const avgOrder = ordersCount ? Math.round(totalSum / ordersCount) : 0;

    const topProductsArr = Array.from(topProducts.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    const topCustomersArr = Array.from(customers.values())
      .filter((c) => c.email !== "(fara-email)")
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 20);

    const payload = {
      range: { from: from.toISOString(), to: to.toISOString() },

      // NOTE: translated template comment.
      kpis: {
        ordersCount,
        itemsCount,
        revenue: totalSum, // bani
        avgOrder,          // bani
      },

      // NOTE: translated template comment.
      statusCounts,
      paymentCounts,
      topProducts: topProductsArr,
      topCustomers: topCustomersArr,

      // NOTE: translated template comment.
      orders: orders.map((o) => ({
        id: o.id,
        orderNo: o.orderNo,
        createdAt: o.createdAt,
        status: o.status,
        paymentMethod: o.paymentMethod,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        total: o.total,
        email: o.pfEmail || o.pjEmail || "",
        name: o.personType === "PJ" ? o.pjCompany || "" : o.pfName || "",
        phone: o.pfPhone || o.pjPhone || "",
        itemsCount: (o.items || []).reduce((s, it) => s + safeNum(it.qty), 0),
      })),
    };

    if (wantCSV) {
      const rows = payload.orders.map((o) => ({
        orderNo: o.orderNo,
        createdAt: new Date(o.createdAt).toISOString(),
        status: o.status,
        paymentMethod: o.paymentMethod,
        name: o.name,
        email: o.email,
        phone: o.phone,
        itemsCount: o.itemsCount,
        subtotal: o.subtotal,
        discount: o.discount,
        shipping: o.shipping,
        total: o.total,
      }));

      const csv = toCSV(rows);
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="reports_${from
            .toISOString()
            .slice(0, 10)}_${to.toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    return NextResponse.json(payload);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}