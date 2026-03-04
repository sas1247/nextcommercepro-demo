import { SignJWT, jwtVerify } from "jose";

const COOKIE_NAME = "asta_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is missing in your environment variables");
  return new TextEncoder().encode(secret);
}

export function authCookieName() {
  return COOKIE_NAME;
}

export async function signUserJwt(payload: { userId: string; email: string }) {
  const secret = getSecret();
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifyUserJwt(token: string) {
  const secret = getSecret();
  const { payload } = await jwtVerify(token, secret);
  const userId = String(payload.userId || "");
  const email = String(payload.email || "");
  if (!userId || !email) throw new Error("JWT invalid");
  return { userId, email };
}