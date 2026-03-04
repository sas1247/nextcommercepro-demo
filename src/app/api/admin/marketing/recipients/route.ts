import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function safeNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function normEmail(x: any) {
  return String(x || "").trim().toLowerCase();
}
function displayName(o: any) {
  if (o?.personType === "PJ") return String(o?.pjCompany || "").trim() || "(PJ)";
  return String(o?.pfName || "").trim() || "(PF)";
}

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const minOrders = safeNum(url.searchParams.get("minOrders"));
  const minSpentLei = safeNum(url.searchParams.get("minSpentLei")); // USD
  const includeOrders = url.searchParams.get("includeOrders") === "1";
  const includeNewsletter = url.searchParams.get("includeNewsletter") !== "0"; // default true

  const map = new Map<string, any>();

  if (includeNewsletter) {
    const subs = await prisma.newsletterSubscriber.findMany({
      select: { email: true, createdAt: true },
      take: 5000,
      orderBy: { createdAt: "desc" },
    });
    for (const s of subs) {
      const email = normEmail(s.email);
      if (!email) continue;
      map.set(email, {
        email,
        name: "(Newsletter)",
        ordersCount: 0,
        productsCount: 0,
        totalSpent: 0,
        source: "newsletter",
      });
    }
  }

  if (includeOrders) {
    const orders = await prisma.order.findMany({
      take: 5000,
      orderBy: { createdAt: "desc" },
      select: {
        personType: true,
        pfName: true,
        pfEmail: true,
        pjCompany: true,
        pjEmail: true,
        total: true,
        items: { select: { qty: true } },
      },
    });

    for (const o of orders) {
      const email = normEmail(o.pfEmail || o.pjEmail);
      if (!email) continue;

      const existing = map.get(email) || {
        email,
        name: displayName(o),
        ordersCount: 0,
        productsCount: 0,
        totalSpent: 0,
        source: "orders",
      };

      existing.name = existing.name === "(Newsletter)" ? displayName(o) : existing.name;
      existing.ordersCount += 1;
      existing.totalSpent += safeNum(o.total);
      existing.productsCount += (o.items || []).reduce((s, it) => s + safeNum(it.qty), 0);

      map.set(email, existing);
    }
  }

  const minSpent = minSpentLei * 100; // bani
  const all = Array.from(map.values()).filter((r) => {
    if (minOrders && r.ordersCount < minOrders) return false;
    if (minSpent && r.totalSpent < minSpent) return false;
    return true;
  });

  all.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));

  return NextResponse.json({ total: all.length, items: all.slice(0, 2000) });
}