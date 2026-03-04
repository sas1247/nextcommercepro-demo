import { cookies } from "next/headers";
import { authCookieName, verifyUserJwt } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function getAuthUser() {
  const token = (await cookies()).get(authCookieName())?.value;
  if (!token) return null;

  try {
    const { userId } = await verifyUserJwt(token);
    return await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    email: true,
    firstName: true,
    lastName: true,
    phone: true,
    role: true,   // NOTE: translated template comment.
  },
});
  } catch {
    return null;
  }
}