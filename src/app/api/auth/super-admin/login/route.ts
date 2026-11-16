import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";
import { signSessionToken } from "@/lib/auth/token";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, pin } = body;

    const cleanEmail = email?.trim().toLowerCase();
    const cleanPass = password?.trim();
    const cleanPin = pin?.trim();

    if (!cleanEmail || !cleanPass) {
      return NextResponse.json(
        { success: false, error: "Email address and password are required." },
        { status: 400 }
      );
    }

    if (!cleanPin) {
      return NextResponse.json(
        { success: false, error: "6-Digit Master Security PIN is required for Super Admin authorization." },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(cleanPin)) {
      return NextResponse.json(
        { success: false, error: "Security PIN must be exactly 6 numeric digits." },
        { status: 400 }
      );
    }

    // 1. Authoritative Credentials & PIN Verification
    const verification = await dataStore.verifySuperAdmin(cleanEmail, cleanPass, cleanPin);
    if (!verification.valid || !verification.user) {
      return NextResponse.json(
        { success: false, error: verification.error || "Authentication failed. Invalid email, password, or security PIN." },
        { status: 401 }
      );
    }

    const admin = verification.user;

    // 2. Synchronize / Provision in Firebase Authentication (if configured)
    let authUid = admin.id;
    if (adminAuth) {
      try {
        let fbUser;
        try {
          fbUser = await adminAuth.getUserByEmail(cleanEmail);
          authUid = fbUser.uid;
          await adminAuth.updateUser(authUid, {
            displayName: admin.name,
            password: cleanPass,
          });
        } catch {
          fbUser = await adminAuth.createUser({
            email: cleanEmail,
            password: cleanPass,
            displayName: admin.name,
          });
          authUid = fbUser.uid;
        }

        // Set authoritative Super Admin custom claims
        await adminAuth.setCustomUserClaims(authUid, {
          role: "super_admin",
          isMaster: admin.isMaster,
        });
      } catch (authErr: any) {
        console.warn("Firebase Admin Auth super_admin sync notice:", authErr.message);
      }
    }

    // 3. Update Last Login Timestamp
    await dataStore.updateSuperAdmin(admin.id, {
      lastLogin: new Date().toISOString(),
    });

    // Sync to Firestore if available
    if (adminDb) {
      try {
        await adminDb.collection("super_admins").doc(admin.id).set({
          ...admin,
          password: "[PROTECTED]",
          lastLogin: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }, { merge: true });

        await adminDb.collection("users").doc(authUid).set({
          uid: authUid,
          email: cleanEmail,
          displayName: admin.name,
          role: "super_admin",
          is_master: admin.isMaster,
          last_login: new Date().toISOString(),
        }, { merge: true });
      } catch (dbErr: any) {
        console.warn("Firestore super_admin sync notice:", dbErr.message);
      }
    }

    // 4. Log in Audit Ledger
    dataStore.logAudit({
      instituteId: "global",
      userId: admin.name,
      userEmail: cleanEmail,
      action: "SUPER_ADMIN_LOGIN",
      targetType: "user",
      targetId: admin.id,
      details: `Super Admin ${admin.name} (${cleanEmail}) authenticated with Master Security PIN. Role: super_admin, Master: ${admin.isMaster}`,
    });

    // 5. Sign Cryptographic Session Token
    const sessionToken = await signSessionToken({
      uid: authUid,
      email: cleanEmail,
      role: "super_admin",
      displayName: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      message: "Super Admin authorization granted.",
      user: {
        uid: authUid,
        email: cleanEmail,
        displayName: admin.name,
        role: "super_admin",
        isMaster: admin.isMaster,
        permissions: admin.permissions,
        createdAt: admin.createdAt,
      },
      redirectUrl: "/su",
    });

    const isProduction = process.env.NODE_ENV === "production";
    const maxAge = 60 * 60 * 24 * 7; // 7 days

    // 6. Set HTTP-Only Session Cookie
    response.cookies.set("cdp_session_token", sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    response.cookies.set("cdp_session", "true", {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    response.cookies.set("cdp_role", "super_admin", {
      path: "/",
      maxAge,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Super Admin login error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Internal server error during Super Admin authorization." },
      { status: 500 }
    );
  }
}
