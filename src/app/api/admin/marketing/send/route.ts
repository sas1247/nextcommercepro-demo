// src/app/api/admin/marketing/send/route.ts
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { makeUnsubToken } from "@/lib/unsubscribe";

import { getTransport } from "@/lib/mailer";
import path from "path";
import fs from "fs";

function withUnsub(html: string, email: string) {
  const t = makeUnsubToken(email);
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const link = `${base}/api/unsubscribe?t=${encodeURIComponent(t)}`;

  return `
    ${html}
    <div style="margin-top:24px;padding-top:14px;border-top:1px solid rgba(0,0,0,0.08);font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#666;">
      You are receiving this email because you are on our marketing list.
      <br/>
      Dezabonare: <a href="${link}" style="color:#3533cd;text-decoration:underline;">${link}</a>
    </div>
  `;
}

export async function POST(req: Request) {
  const user = await getAuthUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));

  const subject = String(body?.subject || "").trim();
  const html = String(body?.html || "").trim();
  const recipients: string[] = Array.isArray(body?.recipients) ? body.recipients.map(String) : [];

  const batchSize = Math.min(200, Math.max(1, Number(body?.batchSize || 50)));
  const offset = Math.max(0, Number(body?.offset || 0));
  const dryRun = Boolean(body?.dryRun);

  if (!subject || !html) {
    return NextResponse.json({ error: "Lipsesc subject/html." }, { status: 400 });
  }
  if (!recipients.length) {
    return NextResponse.json({ error: "Nu ai destinatari." }, { status: 400 });
  }

  const slice = recipients.slice(offset, offset + batchSize);

  const fromName = process.env.SMTP_FROM_NAME || "NextCommerce Pro";
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER!;
  const from = `"${fromName}" <${fromEmail}>`;

  // logo CID (ca la emailurile tale)
  const logoPath = path.join(process.cwd(), "public", "email", "logo.png");
  const hasLogo = fs.existsSync(logoPath);
  const attachments = hasLogo
    ? [{ filename: "logo.png", path: logoPath, cid: "astashop_logo" }]
    : [];

  const transporter = getTransport();

  const results: Array<{ to: string; ok: boolean; error?: string }> = [];

  for (const to of slice) {
    try {
      if (!dryRun) {
        await transporter.sendMail({
          from,
          to,
          subject,
          // NOTE: translated template comment.
          html: withUnsub(html, to),
          attachments,
        });
      }
      results.push({ to, ok: true });
    } catch (e: any) {
      results.push({ to, ok: false, error: e?.message || "Eroare" });
    }
  }

  return NextResponse.json({
    sent: results.filter((r) => r.ok).length,
    failed: results.filter((r) => !r.ok).length,
    offset,
    nextOffset: offset + slice.length,
    done: offset + slice.length >= recipients.length,
    results,
  });
}