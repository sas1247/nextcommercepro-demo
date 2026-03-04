import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const COOKIE_NAME = "asta_token";

function isAdminPath(pathname: string) {
  return pathname.startsWith("/admin");
}

function isAdminApi(pathname: string) {
  return pathname.startsWith("/api/admin");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page to be public
  if (pathname === "/admin/login") return NextResponse.next();

  // protect /admin and /api/admin
  if (isAdminPath(pathname) || isAdminApi(pathname)) {
    const token = req.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    // avem token -> lăsăm mai departe,
    // verificarea role=ADMIN o facem server-side (pasul 2.3)
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};