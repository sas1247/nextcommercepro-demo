import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

function norm(v: any) {
  const s = String(v ?? "").trim();
  return s || "";
}

function getEmail(o: any) {
  return (norm(o.pfEmail) || norm(o.pjEmail) || "").toLowerCase();
}
function getPhone(o: any) {
  return norm(o.pfPhone) || norm(o.pjPhone) || "—";
}
function getName(o: any) {
  return norm(o.pfName) || norm(o.pjCompany) || "—";
}

function toInt(v: string | null, fallback: number) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.floor(n) : fallback;
}

export async function GET(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const page = Math.max(1, toInt(url.searchParams.get("page"), 1));
  const limit = Math.min(200, Math.max(5, toInt(url.searchParams.get("limit"), 50)));
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();

  // NOTE: translated template comment.
  // NOTE: translated template comment.
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" as any },
    take: 5000,
    select: {
      id: true,
      orderNo: true,
      createdAt: true,
      total: true, // NOTE: translated template comment.
      status: true,

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

      items: {
        select: {
          qty: true,
        },
      },
    },
  });

  // NOTE: translated template comment.
  const map = new Map<
    string,
    {
      id: string; // “key” pt detalii (email)
      name: string;
      email: string;
      phone: string;
      ordersCount: number;
      productsCount: number;
      spent: number; // NOTE: translated template comment.
      lastOrderAt: string | null;
      lastAddress: string;
    }
  >();

  for (const o of orders) {
    const email = getEmail(o);
    if (!email) continue; // NOTE: translated template comment.

    const name = getName(o);
    const phone = getPhone(o);

    const productsCount = (o.items || []).reduce((acc: number, it: any) => acc + (Number(it.qty) || 0), 0);
    const spent = Number(o.total) || 0;

    const addr = [o.county, o.city, o.address, o.zip ? `(${o.zip})` : ""].filter(Boolean).join(", ");

    const existing = map.get(email);
    if (!existing) {
      map.set(email, {
        id: email, // folosim email ca “id” pt ruta /customers/[id]
        name,
        email,
        phone,
        ordersCount: 1,
        productsCount,
        spent,
        lastOrderAt: o.createdAt ? new Date(o.createdAt).toISOString() : null,
        lastAddress: addr,
      });
    } else {
      existing.ordersCount += 1;
      existing.productsCount += productsCount;
      existing.spent += spent;

      // NOTE: translated template comment.
      const ts = o.createdAt ? new Date(o.createdAt).getTime() : 0;
      const cur = existing.lastOrderAt ? new Date(existing.lastOrderAt).getTime() : 0;
      if (ts > cur) {
        existing.lastOrderAt = new Date(o.createdAt).toISOString();
        existing.lastAddress = addr;
        // NOTE: translated template comment.
        if (existing.name === "—" && name !== "—") existing.name = name;
        if (existing.phone === "—" && phone !== "—") existing.phone = phone;
      }
    }
  }

  let items = Array.from(map.values());

  if (q) {
    items = items.filter((c) => {
      return (
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        (c.lastAddress || "").toLowerCase().includes(q)
      );
    });
  }

  // NOTE: translated template comment.
  items.sort((a, b) => {
    const at = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
    const bt = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
    return bt - at;
  });

  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const paged = items.slice(start, start + limit);

  return NextResponse.json({
    page,
    pages,
    total,
    limit,
    items: paged,
  });
}