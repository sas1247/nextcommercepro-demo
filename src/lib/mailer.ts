import nodemailer from "nodemailer";
import path from "path";
import fs from "fs";

export function getTransport() {
  const host = process.env.SMTP_HOST!;
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = String(process.env.SMTP_SECURE || "true") === "true";

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  });
}

/** Currency formatting (uses your NEXT_PUBLIC_DEFAULT_* env vars) */
const LOCALE = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";
const CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";

const nfMoney = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatMoneyFromCents(cents: number) {
  return nfMoney.format((Number(cents) || 0) / 100);
}

/* ===========================
   ✅ VOUCHER EMAIL
=========================== */

function buildVoucherEmailHTML(code: string) {
  const brandBlue = "#3533cd";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  // amounts in cents
  const minOrderCents = 30000; // 300.00
  const discountCents = 2000; // 20.00

  const preheader = `Gift voucher: ${formatMoneyFromCents(discountCents)} off orders above ${formatMoneyFromCents(
    minOrderCents
  )}. Code: ${code}`;

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Gift voucher</title>
  </head>

  <body style="margin:0;padding:0;background:#f6f7fb;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                 style="width:100%;max-width:600px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);
                        border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">

            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#ffffff,${brandBlue});background-color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img src="cid:astashop_logo" width="160" alt="NextCommerce Pro"
                        style="display:block;height:auto;border:0;outline:none;text-decoration:none;max-width:160px;" />
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:Arial,sans-serif;font-size:12px;color:#ffffff;opacity:0.9;">
                        Gift voucher
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 24px 10px 24px;">
                <h1 style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.25;color:#111;">
                  Thanks for subscribing! 🎉
                </h1>

                <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">
                  You received a voucher worth <b>${formatMoneyFromCents(discountCents)}</b> for your first order.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                       style="background:#fafafa;border:1px solid rgba(0,0,0,0.08);border-radius:16px;">
                  <tr>
                    <td style="padding:16px 16px;">
                      <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:12px;color:#666;">
                        Your code:
                      </p>

                      <div style="font-family:Arial,sans-serif;font-size:20px;font-weight:700;letter-spacing:0.6px;
                                  color:#111;background:#fff;border:1px dashed rgba(0,0,0,0.18);
                                  padding:12px 14px;border-radius:14px;display:inline-block;">
                        ${code}
                      </div>

                      <p style="margin:12px 0 0 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#666;">
                        Applies if your cart is above <b>${formatMoneyFromCents(minOrderCents)}</b> and you enter the code at checkout.
                      </p>
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
                  <tr>
                    <td align="left" style="padding:0 0 10px 0;">
                      <a href="${siteUrl}"
                         style="display:inline-block;background:linear-gradient(90deg,#000000,${brandBlue});
                                color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;
                                font-weight:700;border-radius:14px;padding:12px 16px;">
                        Open the store
                      </a>
                      <span style="display:inline-block;width:10px;"></span>
                      <a href="${siteUrl}/categorie/promotions"
                         style="display:inline-block;background:#ffffff;color:#111;text-decoration:none;
                                font-family:Arial,sans-serif;font-size:14px;font-weight:700;border-radius:14px;
                                padding:12px 16px;border:1px solid rgba(0,0,0,0.12);">
                        View promotions
                      </a>
                    </td>
                  </tr>
                </table>

                <h3 style="margin:10px 0 8px 0;font-family:Arial,sans-serif;font-size:14px;color:#111;">
                  Terms
                </h3>

                <ul style="margin:0 0 18px 18px;padding:0;font-family:Arial,sans-serif;font-size:13px;line-height:1.7;color:#333;">
                  <li>Discount: <b>${formatMoneyFromCents(discountCents)}</b></li>
                  <li>Minimum order: <b>${formatMoneyFromCents(minOrderCents)}</b></li>
                  <li>Usage: single use</li>
                </ul>

                <p style="margin:0 0 8px 0;font-family:Arial,sans-serif;font-size:13px;color:#333;">
                  Cu drag,<br />
                  <b>NextCommerce Pro</b>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 24px 20px 24px;border-top:1px solid rgba(0,0,0,0.06);">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:#777;">
                  If you didn't request this voucher, you can ignore this message.
                  <br/>
                  © ${new Date().getFullYear()} NextCommerce Pro
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

function buildVoucherEmailText(code: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  const minOrderCents = 30000;
  const discountCents = 2000;

  return [
    "Thanks for subscribing!",
    "",
    `You received a voucher for your first order: ${formatMoneyFromCents(discountCents)}`,
    `Code: ${code}`,
    "",
    "Terms:",
    `- Minimum order: ${formatMoneyFromCents(minOrderCents)}`,
    "- Single use",
    "",
    `Open the store: ${siteUrl}`,
  ].join("\n");
}

export async function sendVoucherEmail(to: string, code: string) {
  const transporter = getTransport();

  const fromName = process.env.SMTP_FROM_NAME || "NextCommerce Pro";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
  const discountCents = 2000;

  const subject = `Gift voucher: ${formatMoneyFromCents(discountCents)} off your first order 🎁`;

  const logoPath = path.join(process.cwd(), "public", "email", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: buildVoucherEmailText(code),
    html: buildVoucherEmailHTML(code),
    attachments: hasLogo
      ? [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "astashop_logo",
          },
        ]
      : [],
  });
}

/* ===========================
   ✅ ORDER EMAILS
=========================== */

type OrderEmailItem = {
  title: string;
  sku?: string | null;
  qty: number;
  price: number; // cents
};

type OrderEmailPayload = {
  orderNo: number;
  paymentMethod: "COD" | "CARD";
  personType: "PF" | "PJ";

  name?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;

  county: string;
  city: string;
  address: string;
  zip?: string | null;

  subtotal: number; // cents
  discount: number; // cents
  shipping: number; // cents
  total: number; // cents

  couponCode?: string | null;
  notes?: string | null;

  items: OrderEmailItem[];
};

function formatOrderNo(orderNo: number) {
  return `ASTA${orderNo}`;
}

function buildOrderEmailHTML(payload: OrderEmailPayload) {
  const brandBlue = "#3533cd";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const prettyNo = formatOrderNo(payload.orderNo);
  const preheader = `Order confirmation ${prettyNo} • Total ${formatMoneyFromCents(payload.total)}`;

  const clientLine = payload.personType === "PJ" ? `${payload.company ?? "-"}` : `${payload.name ?? "-"}`;

  const couponRow =
    payload.discount > 0
      ? `
      <tr>
        <td style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#444;">
          Voucher${payload.couponCode ? ` (${payload.couponCode})` : ""}:
        </td>
        <td align="right" style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#0f7a3b;font-weight:700;">
          -${formatMoneyFromCents(payload.discount)}
        </td>
      </tr>`
      : "";

  const itemsHtml = payload.items
    .map((it) => {
      const lineTotal = it.price * it.qty;
      return `
        <tr>
          <td style="padding:12px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#111;">
            <div style="font-weight:700;">${it.title}</div>
            ${it.sku ? `<div style="font-size:12px;color:#777;margin-top:3px;">SKU: ${it.sku}</div>` : ""}
          </td>
          <td align="center" style="padding:12px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#111;">
            ${it.qty}
          </td>
          <td align="right" style="padding:12px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#111;">
            ${formatMoneyFromCents(it.price)}
          </td>
          <td align="right" style="padding:12px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#111;font-weight:700;">
            ${formatMoneyFromCents(lineTotal)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>Order confirmation</title>
  </head>

  <body style="margin:0;padding:0;background:#f6f7fb;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">

          <table role="presentation" width="700" cellspacing="0" cellpadding="0" border="0"
                 style="width:100%;max-width:700px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);
                        border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">

            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#ffffff,${brandBlue});background-color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img src="cid:astashop_logo" width="160" alt="NextCommerce Pro"
                        style="display:block;height:auto;border:0;outline:none;text-decoration:none;max-width:160px;" />
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:Arial,sans-serif;font-size:12px;color:#ffffff;opacity:0.9;">
                        Order confirmation
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 24px 10px 24px;">
                <h1 style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.25;color:#111;">
                  Your order has been placed ✅
                </h1>

                <div style="font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">
                  <div>Order number: <b>${prettyNo}</b></div>
                  <div style="margin-top:4px;">Payment method: <b>${payload.paymentMethod}</b></div>
                </div>

                <h3 style="margin:18px 0 10px 0;font-family:Arial,sans-serif;font-size:14px;color:#111;">
                  Items
                </h3>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
                       style="border-top:1px solid rgba(0,0,0,0.06);">
                  <tr>
                    <th align="left" style="padding:10px 0;font-family:Arial,sans-serif;font-size:12px;color:#666;">Product</th>
                    <th align="center" style="padding:10px 0;font-family:Arial,sans-serif;font-size:12px;color:#666;">Qty</th>
                    <th align="right" style="padding:10px 0;font-family:Arial,sans-serif;font-size:12px;color:#666;">Price</th>
                    <th align="right" style="padding:10px 0;font-family:Arial,sans-serif;font-size:12px;color:#666;">Total</th>
                  </tr>
                  ${itemsHtml}
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                  <tr>
                    <td style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#444;">
                      Subtotal:
                    </td>
                    <td align="right" style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#111;font-weight:700;">
                      ${formatMoneyFromCents(payload.subtotal)}
                    </td>
                  </tr>

                  ${couponRow}

                  <tr>
                    <td style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#444;">
                      Shipping:
                    </td>
                    <td align="right" style="padding:10px 0;border-top:1px solid rgba(0,0,0,0.06);font-family:Arial,sans-serif;font-size:13px;color:#111;font-weight:700;">
                      ${payload.shipping === 0 ? "Free" : `${formatMoneyFromCents(payload.shipping)}`}
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:12px 0;border-top:1px solid rgba(0,0,0,0.08);font-family:Arial,sans-serif;font-size:14px;color:#111;font-weight:700;">
                      Total:
                    </td>
                    <td align="right" style="padding:12px 0;border-top:1px solid rgba(0,0,0,0.08);font-family:Arial,sans-serif;font-size:14px;color:#111;font-weight:800;">
                      ${formatMoneyFromCents(payload.total)}
                    </td>
                  </tr>
                </table>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:16px;">
                  <tr>
                    <td style="padding:16px;border:1px solid rgba(0,0,0,0.08);border-radius:16px;background:#fafafa;">
                      <div style="font-family:Arial,sans-serif;font-size:13px;color:#111;font-weight:700;margin-bottom:8px;">Customer</div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">
                        <div><b>${payload.personType === "PJ" ? "Company" : "Name"}:</b> ${clientLine}</div>
                        ${payload.phone ? `<div><b>Phone:</b> ${payload.phone}</div>` : ""}
                        ${payload.email ? `<div><b>Email:</b> ${payload.email}</div>` : ""}
                      </div>

                      <div style="font-family:Arial,sans-serif;font-size:13px;color:#111;font-weight:700;margin:14px 0 8px;">Shipping address</div>
                      <div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">
                        <div><b>State/Region:</b> ${payload.county}</div>
                        <div><b>City:</b> ${payload.city}</div>
                        <div><b>Address:</b> ${payload.address}</div>
                        ${payload.zip ? `<div><b>Postal code:</b> ${payload.zip}</div>` : ""}
                      </div>

                      ${
                        payload.notes
                          ? `<div style="font-family:Arial,sans-serif;font-size:13px;color:#111;font-weight:700;margin:14px 0 8px;">Notes</div>
                             <div style="font-family:Arial,sans-serif;font-size:13px;color:#333;line-height:1.7;">${payload.notes}</div>`
                          : ""
                      }
                    </td>
                  </tr>
                </table>

                <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
                  <tr>
                    <td>
                      <a href="${siteUrl}"
                         style="display:inline-block;background:linear-gradient(90deg,#000000,${brandBlue});
                                color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;
                                font-weight:700;border-radius:14px;padding:12px 16px;">
                        Back to store
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:16px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#777;">
                  © ${new Date().getFullYear()} NextCommerce Pro
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

function buildOrderEmailText(payload: OrderEmailPayload) {
  const prettyNo = formatOrderNo(payload.orderNo);

  const lines: string[] = [];
  lines.push(`Order confirmation: ${prettyNo}`);
  lines.push(`Payment method: ${payload.paymentMethod}`);
  lines.push("");
  lines.push("Items:");
  for (const it of payload.items) {
    lines.push(
      `- ${it.title} (${it.qty} x ${formatMoneyFromCents(it.price)}) = ${formatMoneyFromCents(it.price * it.qty)}`
    );
  }
  lines.push("");
  lines.push(`Subtotal: ${formatMoneyFromCents(payload.subtotal)}`);
  if (payload.discount > 0) {
    lines.push(`Voucher${payload.couponCode ? ` (${payload.couponCode})` : ""}: -${formatMoneyFromCents(payload.discount)}`);
  }
  lines.push(`Shipping: ${payload.shipping === 0 ? "Free" : `${formatMoneyFromCents(payload.shipping)}`}`);
  lines.push(`TOTAL: ${formatMoneyFromCents(payload.total)}`);
  lines.push("");
  lines.push("Shipping address:");
  lines.push(`${payload.county}, ${payload.city}, ${payload.address}${payload.zip ? `, ${payload.zip}` : ""}`);
  if (payload.notes) {
    lines.push("");
    lines.push("Notes:");
    lines.push(payload.notes);
  }
  return lines.join("\n");
}

export async function sendOrderCustomerEmail(to: string, payload: OrderEmailPayload) {
  const transporter = getTransport();

  const fromName = process.env.SMTP_FROM_NAME || "NextCommerce Pro";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
  const subject = `Order confirmation ${formatOrderNo(payload.orderNo)} ✅`;

  const logoPath = path.join(process.cwd(), "public", "email", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: buildOrderEmailText(payload),
    html: buildOrderEmailHTML(payload),
    attachments: hasLogo
      ? [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "astashop_logo",
          },
        ]
      : [],
  });
}

export async function sendOrderAdminEmail(payload: OrderEmailPayload) {
  const transporter = getTransport();

  const fromName = process.env.SMTP_FROM_NAME || "NextCommerce Pro";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;

  const adminTo = process.env.ORDERS_NOTIFY_EMAIL || process.env.ADMIN_EMAIL || process.env.SMTP_USER!;
  const subject = `🧾 New order ${formatOrderNo(payload.orderNo)} (${payload.paymentMethod})`;

  const logoPath = path.join(process.cwd(), "public", "email", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: adminTo,
    subject,
    text: buildOrderEmailText(payload),
    html: buildOrderEmailHTML(payload),
    attachments: hasLogo
      ? [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "astashop_logo",
          },
        ]
      : [],
  });
}

/* ===========================
   ✅ PASSWORD RESET EMAIL
=========================== */

function buildPasswordResetEmailHTML(link: string) {
  const brandBlue = "#3533cd";

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Password reset</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">

          <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0"
                 style="width:100%;max-width:600px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);
                        border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">

            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#000000,${brandBlue});">
                <div style="font-family:Arial,sans-serif;font-size:14px;color:#fff;opacity:0.95;font-weight:700;">
                  NextCommerce Pro
                </div>
                <div style="font-family:Arial,sans-serif;font-size:12px;color:#fff;opacity:0.85;margin-top:4px;">
                  Password reset
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 24px;">
                <h1 style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:20px;line-height:1.25;color:#111;">
                  Reset your account password
                </h1>

                <p style="margin:0 0 16px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.6;color:#333;">
                  Click the button below to set a new password. The link expires in 30 minutes.
                </p>

                <a href="${link}"
                   style="display:inline-block;background:linear-gradient(90deg,#000000,${brandBlue});
                          color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;
                          font-weight:700;border-radius:14px;padding:12px 16px;">
                  Reset password
                </a>

                <p style="margin:16px 0 0 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#777;">
                  If you didn't request a password reset, you can ignore this email.
                </p>

                <p style="margin:10px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#777;">
                  Direct link (if the button doesn't work):<br/>
                  <span style="word-break:break-all;">${link}</span>
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:14px 24px 20px 24px;border-top:1px solid rgba(0,0,0,0.06);">
                <p style="margin:0;font-family:Arial,sans-serif;font-size:11px;line-height:1.6;color:#777;">
                  © ${new Date().getFullYear()} NextCommerce Pro
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

function buildPasswordResetEmailText(link: string) {
  return [
    "NextCommerce Pro — Password reset",
    "",
    "Open this link to set a new password (expires in 30 minutes):",
    link,
    "",
    "If you didn't request this reset, ignore this email.",
  ].join("\n");
}

export async function sendPasswordResetEmail(to: string, data: { link: string }) {
  const transporter = getTransport();

  const fromName = process.env.SMTP_FROM_NAME || "NextCommerce Pro";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
  const subject = "Password reset — NextCommerce Pro";

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: buildPasswordResetEmailText(data.link),
    html: buildPasswordResetEmailHTML(data.link),
  });
}

/* ===========================
   ✅ WELCOME EMAIL
=========================== */

type WelcomeProduct = {
  title: string;
  slug: string;
  price: number; // cents
  image: string | null;
};

function buildWelcomeEmailHTML(toEmail: string, products: WelcomeProduct[]) {
  const brandBlue = "#3533cd";
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const cards = (products || []).map((p) => {
    const link = `${siteUrl}/produs/${p.slug}`;

    const img = (() => {
      if (!p.image) return "";
      const v = p.image.trim();
      if (!v) return "";
      if (v.startsWith("http://") || v.startsWith("https://")) return v;
      if (v.startsWith("/")) return `${siteUrl}${v}`;
      return `${siteUrl}/${v}`;
    })();

    return `
    <td width="50%" style="width:50%;padding:8px;vertical-align:top;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0"
        style="border:1px solid rgba(0,0,0,0.08);border-radius:16px;overflow:hidden;background:#fff;">
        ${
          img
            ? `<tr>
                <td style="padding:0;">
                  <a href="${link}" style="text-decoration:none;display:block;">
                    <img src="${img}" alt="${p.title}"
                      width="100%"
                      style="display:block;width:100%;max-width:100%;height:180px;min-height:180px;object-fit:cover;background:#f3f4f6;border:0;outline:none;text-decoration:none;" />
                  </a>
                </td>
              </tr>`
            : ``
        }
        <tr>
          <td style="padding:14px;">
            <div style="font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#111;line-height:1.35;">
              ${p.title}
            </div>
            <div style="margin-top:8px;font-family:Arial,sans-serif;font-size:13px;color:#111;">
              <b>${formatMoneyFromCents(p.price)}</b>
            </div>
            <div style="margin-top:12px;">
              <a href="${link}"
                style="display:inline-block;background:linear-gradient(90deg,#000000,${brandBlue});
                  color:#fff;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;
                  font-weight:700;border-radius:12px;padding:10px 12px;">
                Vezi produsul →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td>
  `;
  });

  const rows: string[] = [];
  for (let i = 0; i < cards.length; i += 2) {
    const left = cards[i];
    const right = cards[i + 1] || `<td width="50%" style="width:50%;padding:8px;vertical-align:top;"></td>`;
    rows.push(`<tr>${left}${right}</tr>`);
  }

  const productsBlock =
    products && products.length
      ? `
      <h3 style="margin:18px 0 10px 0;font-family:Arial,sans-serif;font-size:14px;color:#111;">
        Recommendations for you
      </h3>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse:collapse;">
        ${rows.join("")}
      </table>
    `
      : "";

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f7fb;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f6f7fb;padding:24px 0;">
      <tr>
        <td align="center" style="padding:0 12px;">
          <table role="presentation" width="700" cellspacing="0" cellpadding="0" border="0"
            style="width:100%;max-width:700px;background:#ffffff;border:1px solid rgba(0,0,0,0.08);
              border-radius:18px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);">

            <tr>
              <td style="padding:22px 24px;background:linear-gradient(90deg,#ffffff,${brandBlue});background-color:#ffffff;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left" style="vertical-align:middle;">
                      <img src="cid:astashop_logo" width="160" alt="NextCommerce Pro"
                        style="display:block;height:auto;border:0;outline:none;text-decoration:none;max-width:160px;" />
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-family:Arial,sans-serif;font-size:12px;color:#ffffff;opacity:0.9;">
                        Account created
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:26px 24px 10px 24px;">
                <h1 style="margin:0 0 10px 0;font-family:Arial,sans-serif;font-size:22px;line-height:1.25;color:#111;">
                  Welcome to NextCommerce Pro 🎉
                </h1>

                <p style="margin:0 0 14px 0;font-family:Arial,sans-serif;font-size:14px;line-height:1.7;color:#333;">
                  Your account (<b>${toEmail}</b>) has been created successfully.
                </p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:14px 0 0 0;">
                  <tr>
                    <td>
                      <a href="${siteUrl}/account"
                        style="display:inline-block;background:linear-gradient(90deg,#000000,${brandBlue});
                          color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-size:14px;
                          font-weight:700;border-radius:14px;padding:12px 16px;">
                        Go to account →
                      </a>
                      <span style="display:inline-block;width:10px;"></span>
                      <a href="${siteUrl}/categorie/promotions"
                        style="display:inline-block;background:#ffffff;color:#111;text-decoration:none;
                          font-family:Arial,sans-serif;font-size:14px;font-weight:700;border-radius:14px;
                          padding:12px 16px;border:1px solid rgba(0,0,0,0.12);">
                        View promotions
                      </a>
                    </td>
                  </tr>
                </table>

                ${productsBlock}

                <p style="margin:18px 0 0 0;font-family:Arial,sans-serif;font-size:12px;color:#777;">
                  © ${new Date().getFullYear()} NextCommerce Pro
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

function buildWelcomeEmailText(toEmail: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";
  return [
    "Welcome to NextCommerce Pro!",
    `Your account (${toEmail}) was created successfully.`,
    "",
    `Go to account: ${siteUrl}/account`,
    `Promotions: ${siteUrl}/categorie/promotions`,
  ].join("\n");
}

export async function sendWelcomeEmail(to: string, products: WelcomeProduct[] = []) {
  const transporter = getTransport();

  const fromName = process.env.SMTP_FROM_NAME || "NextCommerce Pro";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
  const subject = "Welcome to NextCommerce Pro 🎉";

  const logoPath = path.join(process.cwd(), "public", "email", "logo.png");
  const hasLogo = fs.existsSync(logoPath);

  await transporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to,
    subject,
    text: buildWelcomeEmailText(to),
    html: buildWelcomeEmailHTML(to, products),
    attachments: hasLogo
      ? [
          {
            filename: "logo.png",
            path: logoPath,
            cid: "astashop_logo",
          },
        ]
      : [],
  });
}