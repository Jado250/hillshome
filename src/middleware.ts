import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

/** First line of defence for /admin pages. Every API route and server function re-checks permissions. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();

  const token = req.cookies.get("hs_session")?.value;
  const secret = process.env.AUTH_SECRET;
  let ok = false;
  if (token && secret) {
    try { await jwtVerify(token, new TextEncoder().encode(secret)); ok = true; } catch { ok = false; }
  }
  if (!ok) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = { matcher: ["/admin/:path*"] };
