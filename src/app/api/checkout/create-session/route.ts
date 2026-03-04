import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../lib/prisma";
import { getAuthUser } from "../../../../lib/auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await getAuthUser().catch(() => null);

    const { personType, payment, customer, shippingAddress, notes, items, coupon } = body ?? {};

    if (payment !== "CARD") {
      return NextResponse.json({ message: "Invalid method." }, { status: 400 });
    }

    if (!items?.length) {
      return NextResponse.json({ message: "Cart gol." }, { status: 400 });
    }

    // NOTE: translated template comment.
    if (!shippingAddress?.county || !shippingAddress?.city || !shippingAddress?.address) {
      return NextResponse.json({ message: "Shipping address is incomplete." }, { status: 400 });
    }

    // 1) actual products from DB
    const productIds = items.map((i: any) => i.id);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json({ message: "Produs invalid." }, { status: 400 });
    }

    // 2) subtotal real + verificare stoc
    let subtotal = 0;
    for (const item of items) {
      const product = products.find((p) => p.id === item.id);
      if (!product) continue;

      if (product.stock < item.qty) {
        return NextResponse.json(
          { message: `Stoc insuficient pentru ${product.title}` },
          { status: 400 }
        );
      }

      subtotal += product.price * item.qty;
    }

    // NOTE: translated template comment.
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
        status: "PENDING",
        userId: user?.id ?? null,   // 👈 AICI (sub status e perfect)
        personType,
        paymentMethod: "CARD",

        pfName: personType === "PF" ? customer?.name : null,
        pfPhone: personType === "PF" ? customer?.phone : null,
        pfEmail: personType === "PF" ? customer?.email : null,

        pjCompany: personType === "PJ" ? customer?.company : null,
        pjCui: personType === "PJ" ? customer?.cui : null,
        pjRegCom: personType === "PJ" ? customer?.regCom : null,
        pjContact: personType === "PJ" ? customer?.contact : null,
        pjPhone: personType === "PJ" ? customer?.phone : null,
        pjEmail: personType === "PJ" ? customer?.email : null,

        county: shippingAddress.county,
        city: shippingAddress.city,
        address: shippingAddress.address,
        zip: shippingAddress.zip ?? null,

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
      include: { items: true },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // NOTE: translated template comment.
    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = order.items.map((it) => ({
      quantity: it.qty,
      price_data: {
        currency: "usd",
        unit_amount: it.price,
        product_data: {
          name: it.title,
          metadata: { sku: it.sku ?? "", productId: it.productId },
          // NU trimitem images aici (mai ales pe localhost)
        },
      },
    }));

    if (shipping > 0) {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: shipping,
          product_data: { name: "Transport" },
        },
      });
    }

    // NOTE: translated template comment.
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined = undefined;

    if (discount > 0) {
      const stripeCoupon = await stripe.coupons.create({
        amount_off: discount,
        currency: "usd",
        duration: "once",
        name: couponCode ? `Voucher ${couponCode}` : "Voucher",
      });

      discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items,
      discounts,

      success_url: `${siteUrl}/checkout/success?paid=1&orderNo=${order.orderNo}`,
      cancel_url: `${siteUrl}/checkout?cancelled=1`,

      metadata: {
        orderId: order.id,
        orderNo: String(order.orderNo),
        couponCode: couponCode ?? "",
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ ok: true, url: session.url });
  } catch (err: any) {
    console.error("CREATE SESSION ERROR:", err);

    // NOTE: translated template comment.
    const msg =
      err?.raw?.message ||
      err?.message ||
      "Eroare server.";

    return NextResponse.json({ message: msg }, { status: 500 });
  }
}