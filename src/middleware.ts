import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Static files and internal Next.js assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Publicly accessible routes
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/landing" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/su/login") ||
    pathname.startsWith("/verify");

  if (isPublicRoute) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get("cdp_session")?.value;
  const roleCookie = request.cookies.get("cdp_role")?.value;

  // Super Admin Route Protection (/su and /su/*)
  if (pathname.startsWith("/su")) {
    if (!sessionCookie || roleCookie !== "super_admin") {
      const suLoginUrl = new URL("/su/login", request.url);
      suLoginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(suLoginUrl);
    }
    return NextResponse.next();
  }

  // General Protected Institute Application Routes (/dashboard, /students, etc.)
  if (!sessionCookie) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
