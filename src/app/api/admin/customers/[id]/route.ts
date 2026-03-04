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

export async function GET(req: Request, ctx: any) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Next 15+ / route handlers: params pot veni ca Promise => le unwrap
  const params = await (ctx?.params ?? {});
  const raw = String(params?.id ?? "").trim();
  if (!raw) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  // id = email (poate fi URL-encoded)
  const email = decodeURIComponent(raw).trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ pfEmail: email }, { pjEmail: email }],
    },
    orderBy: { createdAt: "desc" as any },
    select: {
      id: true,
      orderNo: true,
      createdAt: true,
      status: true,
      total: true,
      subtotal: true,
      discount: true,
      shipping: true,
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

      items: {
        select: {
          id: true,
          productId: true,
          slug: true,
          sku: true,
          title: true,
          price: true,
          qty: true,
          image: true,
        },
      },
    },
  });

  if (!orders || orders.length === 0) {
    return NextResponse.json({ error: "Client inexistent" }, { status: 404 });
  }

  const first = orders[0];
  const name = getName(first);
  const phone = getPhone(first);

  const ordersCount = orders.length;
  const productsCount = orders.reduce(
    (acc: number, o: any) => acc + (o.items || []).reduce((a: number, it: any) => a + (Number(it.qty) || 0), 0),
    0
  );
  const spent = orders.reduce((acc: number, o: any) => acc + (Number(o.total) || 0), 0);

  const lastAddress = [first.county, first.city, first.address, first.zip ? `(${first.zip})` : ""]
    .filter(Boolean)
    .join(", ");

  return NextResponse.json({
    customer: {
      id: email,
      name,
      email,
      phone,
      personType: first.personType || null,
      lastAddress,
      ordersCount,
      productsCount,
      spent, // NOTE: translated template comment.
      lastOrderAt: first.createdAt ? new Date(first.createdAt).toISOString() : null,
    },
    orders,
  });
}