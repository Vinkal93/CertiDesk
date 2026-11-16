import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { provisionInstituteWithAdmin } from "@/lib/auth/serverAuth";

export async function POST(request: NextRequest) {
  try {
    // 1. Authorize Caller: Must be Super Admin with a valid signed session
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Super Admin login required." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden. Only Super Admin can provision new institutes." }, { status: 403 });
    }

    // 2. Parse & Provision
    const body = await request.json();
    if (!body.name || !body.ownerName || !body.email) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: name, ownerName, email" },
        { status: 400 }
      );
    }

    const result = await provisionInstituteWithAdmin(body);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      institute: result.institute,
      credentials: result.credentials,
    });
  } catch (err: any) {
    console.error("Provision institute error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to provision institute." },
      { status: 500 }
    );
  }
}
