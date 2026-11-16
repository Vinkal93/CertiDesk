import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { dataStore } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    // 1. Authorize: Caller must be Super Admin
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Super Admin only." }, { status: 403 });
    }

    const { instituteId, newPassword, email } = await request.json();
    if (!instituteId || !newPassword) {
      return NextResponse.json(
        { success: false, error: "Institute ID and new password are required." },
        { status: 400 }
      );
    }

    // 2. Update in DataStore
    const inst = await dataStore.getInstitute(instituteId);
    if (!inst) {
      return NextResponse.json({ success: false, error: "Institute not found." }, { status: 404 });
    }

    const targetEmail = (email || inst.email).toLowerCase().trim();

    await dataStore.updateInstitutePassword(instituteId, newPassword);

    // 3. Update in Firebase Auth if available
    if (adminAuth) {
      try {
        const fbUser = await adminAuth.getUserByEmail(targetEmail);
        await adminAuth.updateUser(fbUser.uid, { password: newPassword });
      } catch (authErr: any) {
        // If not found in Auth, create it
        if (authErr.code === "auth/user-not-found") {
          try {
            const newUser = await adminAuth.createUser({
              email: targetEmail,
              password: newPassword,
              displayName: inst.ownerName,
            });
            await adminAuth.setCustomUserClaims(newUser.uid, {
              role: "institute_admin",
              instituteId,
            });
          } catch (e: any) {
            console.warn("Could not create user in Firebase Auth:", e.message);
          }
        }
      }
    }

    // 4. Update in Firestore
    if (adminDb) {
      try {
        await adminDb.collection("institutes").doc(instituteId).update({
          password: newPassword,
          updatedAt: new Date().toISOString(),
        });
      } catch (e: any) {
        console.warn("Firestore update notice:", e.message);
      }
    }

    // 5. Audit Log
    dataStore.logAudit({
      instituteId,
      userId: payload.displayName || "Super Administrator",
      userEmail: payload.email,
      action: "CREDENTIALS_UPDATED",
      targetType: "security",
      targetId: instituteId,
      details: `Super Admin reset password for institute ${instituteId}.`,
    });

    return NextResponse.json({
      success: true,
      message: `Credentials updated for ${inst.name}`,
    });
  } catch (err: any) {
    console.error("Update credentials error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update credentials." },
      { status: 500 }
    );
  }
}
