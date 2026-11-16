import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow static assets, Next.js internal files, and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // 2. Publicly accessible routes
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

  // 3. Read and cryptographically verify session token
  const sessionToken = request.cookies.get("cdp_session_token")?.value;
  const session = sessionToken ? await verifySessionToken(sessionToken) : null;

  // Fallback check for legacy cookie only if valid token is not present
  const hasFallbackSession = Boolean(request.cookies.get("cdp_session")?.value);
  const fallbackRole = request.cookies.get("cdp_role")?.value;

  const role = session ? session.role : (hasFallbackSession ? fallbackRole : null);
  const isAuthenticated = Boolean(session || (hasFallbackSession && fallbackRole));

  // 4. Super Admin Protected Routes (/su and /su/*)
  if (pathname.startsWith("/su")) {
    if (!isAuthenticated || role !== "super_admin") {
      const suLoginUrl = new URL("/su/login", request.url);
      suLoginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(suLoginUrl);
    }
    return NextResponse.next();
  }

  // 5. General Protected Institute Application Routes (/dashboard, /students, etc.)
  if (!isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 6. Role Boundaries: Prevent students from accessing staff / admin dashboard
  if (role === "student" && !pathname.startsWith("/students/") && pathname !== "/verify") {
    if (session?.studentId) {
      return NextResponse.redirect(new URL(`/students/${session.studentId}`, request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
