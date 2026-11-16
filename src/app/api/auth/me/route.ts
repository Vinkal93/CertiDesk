import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { dataStore } from "@/lib/db";
import { Institute, UserProfile } from "@/types";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("cdp_session_token")?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, error: "Session expired or invalid" }, { status: 401 });
  }

  let institute: Institute | null = null;
  if (payload.instituteId) {
    institute = await dataStore.getInstitute(payload.instituteId);
  }

  const user: UserProfile = {
    uid: payload.uid,
    email: payload.email,
    displayName: payload.displayName || "User",
    role: payload.role,
    instituteId: payload.instituteId,
    studentId: payload.studentId,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({
    authenticated: true,
    user,
    institute,
  });
}
