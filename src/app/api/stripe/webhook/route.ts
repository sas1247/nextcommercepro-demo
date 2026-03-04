import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "../../../../lib/prisma";

// NOTE: translated template comment.
import { sendOrderCustomerEmail, sendOrderAdminEmail } from "../../../../lib/mailer";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ message: "Missing signature" }, { status: 400 });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verify failed:", err);
    return NextResponse.json({ message: "Invalid signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      const orderId = String(session.metadata?.orderId ?? "");
      const paymentIntentId =
        typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;

      if (!orderId) {
        console.warn("Webhook: missing orderId in metadata");
        return NextResponse.json({ ok: true });
      }

      // NOTE: translated template comment.
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });

      if (!order) {
        console.warn("Webhook: order not found:", orderId);
        return NextResponse.json({ ok: true });
      }

      // NOTE: translated template comment.
      if (order.status === "PAID") {
        return NextResponse.json({ ok: true });
      }

      // NOTE: translated template comment.
      for (const item of order.items) {
        const product = await prisma.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;

        // NOTE: translated template comment.
        if (product.stock < item.qty) {
          // NOTE: translated template comment.
          // NOTE: translated template comment.
          console.error("STOC INSUFICIENT LA WEBHOOK pentru", product.title);
          continue;
        }

        await prisma.product.update({
          where: { id: product.id },
          data: {
            stock: { decrement: item.qty },
            inStock: product.stock - item.qty > 0,
          },
        });
      }

      // NOTE: translated template comment.
      if (order.couponCode) {
        await prisma.coupon.update({
          where: { code: order.couponCode },
          data: {
            usedCount: { increment: 1 },
          },
        });
      }

      // 3) update order -> PAID + stripe ids
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          stripePaymentIntentId: paymentIntentId ?? null,
        },
        include: { items: true },
      });

      // 4) email confirmare (client + admin)
      try {
        const emailToCustomer = updated.pfEmail || updated.pjEmail || "";

        const payload = {
          orderNo: updated.orderNo,
          paymentMethod: updated.paymentMethod,
          subtotal: updated.subtotal,
          discount: updated.discount,
          shipping: updated.shipping,
          total: updated.total,
          couponCode: updated.couponCode,
          customer: {
            personType: updated.personType,
            pfName: updated.pfName,
            pfPhone: updated.pfPhone,
            pfEmail: updated.pfEmail,
            pjCompany: updated.pjCompany,
            pjCui: updated.pjCui,
            pjRegCom: updated.pjRegCom,
            pjContact: updated.pjContact,
            pjPhone: updated.pjPhone,
            pjEmail: updated.pjEmail,
          },
          shippingAddress: {
            county: updated.county,
            city: updated.city,
            address: updated.address,
            zip: updated.zip,
          },
          notes: updated.notes,
          items: updated.items.map((it) => ({
            title: it.title,
            sku: it.sku,
            qty: it.qty,
            price: it.price,
            total: it.price * it.qty,
          })),
        };

        const tasks: Promise<any>[] = [];
        if (emailToCustomer) tasks.push(sendOrderCustomerEmail(emailToCustomer, payload as any));
        tasks.push(sendOrderAdminEmail(payload as any));

        await Promise.all(tasks);
      } catch (e) {
        console.error("ORDER EMAIL ERROR:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("STRIPE WEBHOOK ERROR:", err);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }
}