import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { signSessionToken, verifySessionToken, SessionPayload } from "./token";
import { dataStore } from "@/lib/db";
import { Institute, UserProfile, AccountStatus } from "@/types";

export interface SyncSessionParams {
  idToken?: string;
  email?: string;
  requestedRole?: "super_admin" | "institute_admin" | "student";
  instituteId?: string;
  studentId?: string;
  displayName?: string;
}

export interface AuthResult {
  success: boolean;
  user?: UserProfile;
  institute?: Institute | null;
  sessionToken?: string;
  error?: string;
}

/**
 * Super Admin designated emails that can automatically claim super_admin privilege
 */
const DEFAULT_SUPER_ADMIN_EMAILS = [
  "vinkalp041@gmail.com",
  "admin@certidesk.pro",
  "superadmin@certidesk.pro",
  "vinkalprajapati93@gmail.com",
];

export function isDesignatedSuperAdmin(email: string): boolean {
  if (!email) return false;
  const lower = email.trim().toLowerCase();
  const envAdmins = process.env.SUPER_ADMIN_EMAILS
    ? process.env.SUPER_ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
    : [];
  return (
    DEFAULT_SUPER_ADMIN_EMAILS.includes(lower) ||
    envAdmins.includes(lower) ||
    lower.includes("vinkalp041@gmail.com") ||
    lower.includes("admin@certidesk.pro")
  );
}

/**
 * Verifies identity, synchronizes role & tenant boundaries, and issues a tamper-proof session token.
 */
export async function createOrSyncSession(params: SyncSessionParams): Promise<AuthResult> {
  const { idToken, email: explicitEmail, requestedRole, instituteId: reqInstituteId, studentId: reqStudentId, displayName: reqDisplayName } = params;

  let uid = "";
  let email = explicitEmail?.toLowerCase().trim() || "";
  let displayName = reqDisplayName || "";
  let tokenRole: string | undefined;
  let tokenInstituteId: string | undefined;
  let tokenStudentId: string | undefined;

  // 1. If Firebase ID token is provided, verify it
  if (idToken) {
    if (!adminAuth) {
      return { success: false, error: "Firebase Admin authentication is not configured." };
    }
    try {
      const decoded = await adminAuth.verifyIdToken(idToken);
      uid = decoded.uid;
      email = (decoded.email || email).toLowerCase().trim();
      displayName = decoded.name || displayName;
      tokenRole = decoded.role as string | undefined;
      tokenInstituteId = decoded.instituteId as string | undefined;
      tokenStudentId = decoded.studentId as string | undefined;
    } catch (err) {
      return { success: false, error: "Invalid Firebase authentication token." };
    }
  }

  if (requestedRole === "student" && (!idToken || tokenRole !== "student")) {
    return { success: false, error: "Student sign-in must be verified by Firebase Authentication." };
  }

  if (!uid) {
    uid = `usr_${email.replace(/[^a-zA-Z0-9]/g, "_")}`;
  }

  // 2. Fetch authoritative User Record from Firestore (if adminDb is initialized)
  let firestoreUserData: any = null;
  if (adminDb && uid) {
    try {
      const userDoc = await adminDb.collection("users").doc(uid).get();
      if (userDoc.exists) {
        firestoreUserData = userDoc.data();
      }
    } catch (e) {
      console.warn("Could not fetch user document from Firestore:", e);
    }
  }

  // 3. Resolve Authoritative Role
  let resolvedRole: "super_admin" | "institute_admin" | "student" = "institute_admin";
  let resolvedInstituteId: string | undefined = reqInstituteId;
  let resolvedStudentId: string | undefined = reqStudentId;

  const hasSuperAdminPrivilege =
    firestoreUserData?.role === "super_admin" ||
    tokenRole === "super_admin" ||
    isDesignatedSuperAdmin(email);

  if (requestedRole === "super_admin") {
    if (!hasSuperAdminPrivilege) {
      return {
        success: false,
        error: "Access Denied: This account is not authorized for Super Administrator access.",
      };
    }
    resolvedRole = "super_admin";
    resolvedInstituteId = undefined;
    resolvedStudentId = undefined;
  } else if (hasSuperAdminPrivilege && !requestedRole) {
    resolvedRole = "super_admin";
    resolvedInstituteId = undefined;
    resolvedStudentId = undefined;
  } else if (requestedRole === "student" || firestoreUserData?.role === "student") {
    resolvedRole = "student";
    resolvedInstituteId = firestoreUserData?.instituteId || firestoreUserData?.institute_id || tokenInstituteId || reqInstituteId;
    resolvedStudentId = firestoreUserData?.studentId || firestoreUserData?.student_id || tokenStudentId || reqStudentId;
  } else {
    resolvedRole = "institute_admin";
    resolvedInstituteId = firestoreUserData?.instituteId || reqInstituteId;
  }

  // 4. Validate Institute Status (for Institute Admins)
  let institute: Institute | null = null;
  if (resolvedRole === "institute_admin") {
    // Look up institute
    const institutes = await dataStore.getAllInstitutes();
    let matchedInst: Institute | null = institutes.find(
      (i) =>
        (resolvedInstituteId && i.id.toUpperCase() === resolvedInstituteId.toUpperCase()) ||
        i.email.toLowerCase() === email.toLowerCase() ||
        i.id.toUpperCase() === email.toUpperCase()
    ) || null;

    if (!matchedInst && resolvedInstituteId) {
      matchedInst = await dataStore.getInstitute(resolvedInstituteId);
    }

    if (!matchedInst) {
      // If none found, match default or return error
      matchedInst = institutes[0] || null;
    }

    if (!matchedInst) {
      return { success: false, error: "No affiliated institute found for this account." };
    }

    if (matchedInst.status === "suspended") {
      return {
        success: false,
        error: "This institute account has been suspended. Please contact platform support.",
      };
    }

    if (matchedInst.status === "pending") {
      return {
        success: false,
        error: "Your institute account is pending verification and approval by the platform administrator.",
      };
    }

    institute = matchedInst;
    resolvedInstituteId = matchedInst.id;
    if (!displayName) {
      displayName = matchedInst.ownerName || matchedInst.name;
    }
  }

  if (resolvedRole === "super_admin" && !displayName) {
    displayName = "Super Administrator";
  }

  // 5. Check if user account itself is suspended
  if (firestoreUserData?.status === "suspended" || firestoreUserData?.account_status === "inactive" || firestoreUserData?.account_status === "suspended") {
    return { success: false, error: "Your user account has been disabled by the administrator." };
  }

  // 6. Synchronize / Upsert User Document in Firestore
  const userProfile: UserProfile = {
    uid,
    email,
    displayName: displayName || (resolvedRole === "super_admin" ? "Super Admin" : "Institute Admin"),
    role: resolvedRole,
    instituteId: resolvedInstituteId,
    studentId: resolvedStudentId,
    createdAt: firestoreUserData?.createdAt || new Date().toISOString(),
  };

  if (adminDb && uid) {
    try {
      await adminDb.collection("users").doc(uid).set(
        {
          uid,
          email,
          displayName: userProfile.displayName,
          role: resolvedRole,
          instituteId: resolvedInstituteId || null,
          studentId: resolvedStudentId || null,
          status: "active",
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (e) {
      console.warn("Failed to update user in Firestore via adminDb:", e);
    }
  }

  // 7. Update Firebase Auth Custom Claims (if adminAuth is available)
  if (adminAuth && uid) {
    try {
      const claims: Record<string, any> = {
        role: resolvedRole,
      };
      if (resolvedInstituteId) claims.instituteId = resolvedInstituteId;
      if (resolvedStudentId) claims.studentId = resolvedStudentId;

      await adminAuth.setCustomUserClaims(uid, claims);
    } catch (claimsErr: any) {
      console.warn("Custom claims set skipped:", claimsErr.message);
    }
  }

  // 8. Sign Tamper-Proof Session Token
  const sessionToken = await signSessionToken({
    uid,
    email,
    role: resolvedRole,
    instituteId: resolvedInstituteId,
    studentId: resolvedStudentId,
    displayName: userProfile.displayName,
  });

  return {
    success: true,
    user: userProfile,
    institute,
    sessionToken,
  };
}

/**
 * Super Admin provision workflow for new Institutes & Institute Admins.
 */
export async function provisionInstituteWithAdmin(params: {
  name: string;
  code?: string;
  ownerName: string;
  email: string;
  password?: string;
  mobile?: string;
  address?: string;
  district?: string;
  state?: string;
  pincode?: string;
  walletBalance?: number;
  settings?: any;
}): Promise<{
  success: boolean;
  institute?: Institute;
  credentials?: { id: string; email: string; password: string };
  error?: string;
}> {
  try {
    const cleanEmail = params.email.trim().toLowerCase();
    const cleanPassword = params.password || "Institute@123456";

    // 1. Create Institute Record
    const createdInstitute = await dataStore.createInstitute({
      name: params.name.trim(),
      code: (params.code || params.name.slice(0, 4)).toUpperCase(),
      ownerName: params.ownerName.trim(),
      email: cleanEmail,
      password: cleanPassword,
      mobile: params.mobile || "",
      address: params.address || "",
      district: params.district || "",
      state: params.state || "Uttar Pradesh",
      pincode: params.pincode || "273001",
      status: "active",
      walletBalance: Number(params.walletBalance) || 1000,
      assignedCourses: ["c-adca", "c-typ", "c-dca"],
      settings: params.settings || {
        admissionFee: 150,
        profileEditFee: 100,
        certificateFee: 0,
        marksheetFee: 0,
        autoApproveStudents: true,
      },
    });

    const instituteId = createdInstitute.id;

    // 2. Provision or update Firebase Auth User
    let authUid = `usr_${instituteId.toLowerCase()}`;

    if (adminAuth) {
      try {
        let fbUser;
        try {
          fbUser = await adminAuth.getUserByEmail(cleanEmail);
          // User exists, update password and metadata
          await adminAuth.updateUser(fbUser.uid, {
            password: cleanPassword,
            displayName: params.ownerName,
          });
          authUid = fbUser.uid;
        } catch (notFound) {
          // User does not exist, create new
          fbUser = await adminAuth.createUser({
            email: cleanEmail,
            password: cleanPassword,
            displayName: params.ownerName,
          });
          authUid = fbUser.uid;
        }

        // Set custom claims for tenant isolation
        await adminAuth.setCustomUserClaims(authUid, {
          role: "institute_admin",
          instituteId,
        });
      } catch (authErr: any) {
        console.warn("adminAuth provision warning (will continue with local storage):", authErr.message);
      }
    }

    // 3. Save User Document in Firestore
    if (adminDb) {
      try {
        await adminDb.collection("users").doc(authUid).set({
          uid: authUid,
          email: cleanEmail,
          displayName: params.ownerName,
          role: "institute_admin",
          instituteId,
          status: "active",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Also save institute document in Firestore
        await adminDb.collection("institutes").doc(instituteId).set(createdInstitute, { merge: true });
      } catch (dbErr: any) {
        console.warn("Firestore adminDb sync warning:", dbErr.message);
      }
    }

    // 4. Log to Audit Ledger
    dataStore.logAudit({
      instituteId,
      userId: "Super Administrator",
      userEmail: "admin@certidesk.pro",
      action: "INSTITUTE_CREATED",
      targetType: "institute",
      targetId: instituteId,
      details: `Super Admin provisioned institute ${createdInstitute.name} (${instituteId}) with initial wallet ₹${createdInstitute.walletBalance}.`,
    });

    return {
      success: true,
      institute: createdInstitute,
      credentials: {
        id: instituteId,
        email: cleanEmail,
        password: cleanPassword,
      },
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Failed to provision institute.",
    };
  }
}
