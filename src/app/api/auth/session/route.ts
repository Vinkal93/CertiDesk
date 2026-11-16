import { NextRequest, NextResponse } from "next/server";
import { createOrSyncSession } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await createOrSyncSession(body);

    if (!result.success || !result.sessionToken) {
      return NextResponse.json(
        { success: false, error: result.error || "Authentication failed." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: result.user,
      institute: result.institute,
    });

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 7; // 7 days

    // 1. Primary Tamper-Proof Cryptographic Session Cookie
    response.cookies.set("cdp_session_token", result.sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    // 2. Convenience cookies for middleware & client UI
    response.cookies.set("cdp_session", "true", {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    response.cookies.set("cdp_role", result.user!.role, {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    if (result.user?.instituteId) {
      response.cookies.set("cdp_institute", result.user.instituteId, {
        path: "/",
        maxAge,
        sameSite: "lax",
      });
    }

    return response;
  } catch (err: any) {
    console.error("Auth session route error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
