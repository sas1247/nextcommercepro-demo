import crypto from "crypto";

const SECRET = process.env.UNSUBSCRIBE_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret";

export function makeUnsubToken(email: string) {
  const e = String(email || "").trim().toLowerCase();
  const sig = crypto.createHmac("sha256", SECRET).update(e).digest("hex");
  return `${e}.${sig}`;
}

export function verifyUnsubToken(token: string) {
  const t = String(token || "");
  const idx = t.lastIndexOf(".");
  if (idx < 0) return null;
  const email = t.slice(0, idx);
  const sig = t.slice(idx + 1);
  const good = crypto.createHmac("sha256", SECRET).update(email).digest("hex");
  if (sig !== good) return null;
  return email;
}