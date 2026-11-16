import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { dataStore } from "@/lib/db";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { SuperAdminUser } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Super Admin login required." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Super Admin access required." }, { status: 403 });
    }

    const admins = await dataStore.getSuperAdmins();

    // Sanitize records for UI display (mask PIN and omit password)
    const sanitized = admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role,
      isMaster: a.isMaster,
      status: a.status,
      permissions: a.permissions,
      pinMasked: `••••${a.pin.slice(-2)}`,
      lastLogin: a.lastLogin,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      superAdmins: sanitized,
      total: sanitized.length,
    });
  } catch (err: any) {
    console.error("Super admins GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Super Admin login required." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload || payload.role !== "super_admin") {
      return NextResponse.json({ success: false, error: "Forbidden: Super Admin access required." }, { status: 403 });
    }

    const body = await request.json();
    const action = body.action || "create";

    // --- ACTION 1: CREATE SUPER ADMIN ---
    if (action === "create") {
      const { name, email, password, pin, permissions } = body;

      if (!name || !email || !password || !pin) {
        return NextResponse.json(
          { success: false, error: "Name, email, password, and 6-digit PIN are required." },
          { status: 400 }
        );
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPin = pin.trim();

      if (!/^\d{6}$/.test(cleanPin)) {
        return NextResponse.json(
          { success: false, error: "Security PIN must be exactly 6 numeric digits." },
          { status: 400 }
        );
      }

      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: "Password must be at least 6 characters." },
          { status: 400 }
        );
      }

      const existing = await dataStore.getSuperAdminByEmail(cleanEmail);
      if (existing) {
        return NextResponse.json(
          { success: false, error: `A Super Admin with email "${cleanEmail}" already exists.` },
          { status: 409 }
        );
      }

      let authUid = `su_${Date.now()}`;
      if (adminAuth) {
        try {
          const fbUser = await adminAuth.createUser({
            email: cleanEmail,
            password: password.trim(),
            displayName: name.trim(),
          });
          authUid = fbUser.uid;
          await adminAuth.setCustomUserClaims(authUid, {
            role: "super_admin",
            isMaster: false,
          });
        } catch (authErr: any) {
          if (authErr.code === "auth/email-already-exists") {
            try {
              const existingFb = await adminAuth.getUserByEmail(cleanEmail);
              authUid = existingFb.uid;
              await adminAuth.setCustomUserClaims(authUid, { role: "super_admin" });
            } catch {
              // continue
            }
          }
        }
      }

      const newAdmin: Omit<SuperAdminUser, "id" | "createdAt" | "updatedAt"> = {
        name: name.trim(),
        email: cleanEmail,
        password: password.trim(),
        pin: cleanPin,
        role: "super_admin",
        isMaster: false,
        status: "active",
        permissions: {
          canManageInstitutes: permissions?.canManageInstitutes ?? true,
          canManageSuperAdmins: permissions?.canManageSuperAdmins ?? false,
          canManageFinancials: permissions?.canManageFinancials ?? true,
          canManageBranding: permissions?.canManageBranding ?? true,
          canManageAuditLogs: permissions?.canManageAuditLogs ?? true,
        },
      };

      const created = await dataStore.createSuperAdmin(newAdmin);

      // Firestore sync
      if (adminDb) {
        try {
          await adminDb.collection("super_admins").doc(created.id).set({
            ...created,
            password: "[PROTECTED]",
          }, { merge: true });
        } catch (dbErr: any) {
          console.warn("Firestore sync warning:", dbErr.message);
        }
      }

      dataStore.logAudit({
        instituteId: "global",
        userId: payload.displayName || "Super Admin",
        userEmail: payload.email,
        action: "SUPER_ADMIN_CREATED",
        targetType: "user",
        targetId: created.id,
        details: `Created new Super Admin account: ${created.name} (${created.email}).`,
      });

      return NextResponse.json({
        success: true,
        message: `Super Admin account created successfully for ${created.name}!`,
        admin: {
          id: created.id,
          name: created.name,
          email: created.email,
          role: created.role,
          isMaster: created.isMaster,
          status: created.status,
          permissions: created.permissions,
          pinMasked: `••••${created.pin.slice(-2)}`,
          createdAt: created.createdAt,
        },
      });
    }

    // --- ACTION 2: UPDATE SUPER ADMIN ---
    if (action === "update") {
      const { id, name, status, permissions, newPassword, newPin } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Super Admin id is required." }, { status: 400 });
      }

      const existing = await dataStore.getSuperAdminById(id);
      if (!existing) {
        return NextResponse.json({ success: false, error: "Super Admin account not found." }, { status: 404 });
      }

      const updates: Partial<SuperAdminUser> = {};
      if (name) updates.name = name.trim();
      if (status) updates.status = status;
      if (permissions) updates.permissions = { ...existing.permissions, ...permissions };

      if (newPin) {
        const cleanPin = newPin.trim();
        if (!/^\d{6}$/.test(cleanPin)) {
          return NextResponse.json({ success: false, error: "Security PIN must be exactly 6 numeric digits." }, { status: 400 });
        }
        updates.pin = cleanPin;
      }

      if (newPassword) {
        if (newPassword.trim().length < 6) {
          return NextResponse.json({ success: false, error: "Password must be at least 6 characters." }, { status: 400 });
        }
        updates.password = newPassword.trim();

        if (adminAuth) {
          try {
            const fbUser = await adminAuth.getUserByEmail(existing.email);
            await adminAuth.updateUser(fbUser.uid, { password: newPassword.trim() });
          } catch (e: any) {
            console.warn("adminAuth password update notice:", e.message);
          }
        }
      }

      const updated = await dataStore.updateSuperAdmin(id, updates);

      dataStore.logAudit({
        instituteId: "global",
        userId: payload.displayName || "Super Admin",
        userEmail: payload.email,
        action: "SUPER_ADMIN_UPDATED",
        targetType: "user",
        targetId: updated.id,
        details: `Updated Super Admin account: ${updated.name} (${updated.email}).`,
      });

      return NextResponse.json({
        success: true,
        message: `Super Admin account updated successfully.`,
        admin: {
          id: updated.id,
          name: updated.name,
          email: updated.email,
          role: updated.role,
          isMaster: updated.isMaster,
          status: updated.status,
          permissions: updated.permissions,
          pinMasked: `••••${updated.pin.slice(-2)}`,
        },
      });
    }

    // --- ACTION 3: DELETE SUPER ADMIN ---
    if (action === "delete") {
      const { id } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: "Super Admin id is required." }, { status: 400 });
      }

      const existing = await dataStore.getSuperAdminById(id);
      if (!existing) {
        return NextResponse.json({ success: false, error: "Super Admin account not found." }, { status: 404 });
      }

      if (existing.isMaster || existing.email.toLowerCase() === "vinkalp041@gmail.com") {
        return NextResponse.json({ success: false, error: "Forbidden: Root Master Super Admin cannot be deleted." }, { status: 403 });
      }

      await dataStore.deleteSuperAdmin(id);

      if (adminAuth) {
        try {
          const fbUser = await adminAuth.getUserByEmail(existing.email);
          await adminAuth.deleteUser(fbUser.uid);
        } catch (e) {
          // continue
        }
      }

      dataStore.logAudit({
        instituteId: "global",
        userId: payload.displayName || "Super Admin",
        userEmail: payload.email,
        action: "SUPER_ADMIN_DELETED",
        targetType: "user",
        targetId: id,
        details: `Deleted Super Admin account: ${existing.name} (${existing.email}).`,
      });

      return NextResponse.json({
        success: true,
        message: `Super Admin ${existing.name} deleted successfully.`,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    console.error("Super admins POST error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
