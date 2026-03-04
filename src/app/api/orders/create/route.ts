import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/prisma";
import { sendOrderAdminEmail, sendOrderCustomerEmail } from "../../../../lib/mailer";
import { getAuthUser } from "../../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getAuthUser().catch(() => null);

    const { personType, payment, customer, shippingAddress, notes, items, coupon } = body ?? {};

    if (!items?.length) {
      return NextResponse.json({ message: "Cart gol." }, { status: 400 });
    }

    // NOTE: translated template comment.
    const productIds = items.map((i: any) => i.id);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ message: "Produs invalid." }, { status: 400 });
    }

    // 2️⃣ Calcul subtotal real
    let subtotal = 0;

    for (const item of items) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;

      if (product.stock < item.qty) {
        return NextResponse.json(
          {
            message: `Stoc insuficient pentru ${product.title}`,
          },
          { status: 400 }
        );
      }

      subtotal += product.price * item.qty;
    }

    // 3️⃣ Voucher
    let discount = 0;
    let couponCode: string | null = null;
    let couponAmount: number | null = null;
    let couponMinSubtotal: number | null = null;

    if (coupon?.code) {
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: coupon.code },
      });

      if (
        dbCoupon &&
        dbCoupon.isActive &&
        dbCoupon.usedCount < dbCoupon.usageLimit &&
        subtotal >= dbCoupon.minSubtotal
      ) {
        discount = dbCoupon.amount;
        couponCode = dbCoupon.code;
        couponAmount = dbCoupon.amount;
        couponMinSubtotal = dbCoupon.minSubtotal;
      }
    }

    const subtotalAfterDiscount = Math.max(0, subtotal - discount);
    const shipping = subtotalAfterDiscount >= 40000 ? 0 : 1699;
    const total = subtotalAfterDiscount + shipping;

    const last = await prisma.order.findFirst({
  orderBy: { orderNo: "desc" },
  select: { orderNo: true },
});
const nextOrderNo = (last?.orderNo ?? 0) + 1;

    // NOTE: translated template comment.
    const order = await prisma.order.create({
      data: {
        orderNo: nextOrderNo,
        personType,
        paymentMethod: payment,
        userId: user?.id ?? null,

        pfName: personType === "PF" ? customer?.name : null,
        pfPhone: personType === "PF" ? customer?.phone : null,
        pfEmail: personType === "PF" ? customer?.email : null,

        pjCompany: personType === "PJ" ? customer?.company : null,
        pjCui: personType === "PJ" ? customer?.cui : null,
        pjRegCom: personType === "PJ" ? customer?.regCom : null,
        pjContact: personType === "PJ" ? customer?.contact : null,
        pjPhone: personType === "PJ" ? customer?.phone : null,
        pjEmail: personType === "PJ" ? customer?.email : null,

        county: shippingAddress?.county,
        city: shippingAddress?.city,
        address: shippingAddress?.address,
        zip: shippingAddress?.zip ?? null,

        notes: notes ?? null,

        subtotal,
        discount,
        shipping,
        total,

        couponCode,
        couponAmount,
        couponMinSubtotal,

        items: {
          create: items.map((item: any) => {
            const product = products.find((p) => p.id === item.id)!;
            return {
              productId: product.id,
              title: product.title,
              slug: product.slug,
              sku: product.sku,
              image: product.image,
              price: product.price,
              qty: item.qty,
            };
          }),
        },
      },
    });

    // NOTE: translated template comment.
    if (payment === "COD") {
      for (const item of items) {
        const product = products.find((p) => p.id === item.id);
        if (!product) continue;

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: {
              decrement: item.qty,
            },
            inStock: product.stock - item.qty > 0,
          },
        });

        // NOTE: translated template comment.
        product.stock = product.stock - item.qty;
      }

      // NOTE: translated template comment.
      if (couponCode) {
        await prisma.coupon.update({
          where: { code: couponCode },
          data: {
            usedCount: {
              increment: 1,
            },
          },
        });
      }
    }

    // ✅ 7️⃣ Email-uri (ACUM: doar pentru COD, cum ai cerut)
    if (payment === "COD") {
      try {
        const emailToCustomer =
          personType === "PF"
            ? String(customer?.email ?? "").trim()
            : String(customer?.email ?? "").trim(); // NOTE: translated template comment.

        const emailPayload = {
          orderNo: order.orderNo, // ✅ OBLIGATORIU (altfel apare ASTAundefined)
          paymentMethod: payment,
          personType,

          // PF
          pfName: personType === "PF" ? customer?.name : null,
          pfPhone: personType === "PF" ? customer?.phone : null,
          pfEmail: personType === "PF" ? customer?.email : null,

          // PJ
          pjCompany: personType === "PJ" ? customer?.company : null,
          pjCui: personType === "PJ" ? customer?.cui : null,
          pjRegCom: personType === "PJ" ? customer?.regCom : null,
          pjContact: personType === "PJ" ? customer?.contact : null,
          pjPhone: personType === "PJ" ? customer?.phone : null,
          pjEmail: personType === "PJ" ? customer?.email : null,

          // livrare
          county: String(shippingAddress?.county ?? ""),
          city: String(shippingAddress?.city ?? ""),
          address: String(shippingAddress?.address ?? ""),
          zip: shippingAddress?.zip ?? null,

          notes: notes ?? null,

          currency: "USD",

          subtotal,
          discount,
          shipping,
          total,

          couponCode,

          items: items.map((it: any) => {
            const product = products.find((p) => p.id === it.id)!;
            return {
              title: product.title,
              qty: it.qty,
              price: product.price,
              slug: product.slug,
              sku: product.sku ?? null,
            };
          }),
        };

        // NOTE: translated template comment.
        const tasks: Promise<any>[] = [];
        if (emailToCustomer) tasks.push(sendOrderCustomerEmail(emailToCustomer, emailPayload as any));

        // NOTE: translated template comment.
        tasks.push(sendOrderAdminEmail(emailPayload as any));

        await Promise.all(tasks);
      } catch (e) {
        console.error("ORDER EMAIL ERROR:", e);
        // NOTE: translated template comment.
      }
    }

    return NextResponse.json({ ok: true, orderId: order.id, orderNo: order.orderNo });
  } catch (err) {
    console.error("ORDER CREATE ERROR:", err);
    return NextResponse.json({ message: "Eroare server." }, { status: 500 });
  }
}