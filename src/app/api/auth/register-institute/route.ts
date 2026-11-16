import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { signSessionToken } from "@/lib/auth/token";
import { dataStore } from "@/lib/db";
import { Institute } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Validation of Required Fields
    const instituteName = body.instituteName?.trim() || body.name?.trim();
    const instituteType = body.instituteType?.trim() || "Computer Education Institute";
    const ownerName = body.ownerName?.trim();
    const officialEmail = (body.officialEmail?.trim() || body.email?.trim() || "").toLowerCase();
    const phone = body.phone?.trim() || body.mobile?.trim();
    const address = body.address?.trim() || "Main Road";
    const state = body.state?.trim() || "Uttar Pradesh";
    const district = body.district?.trim() || "Gorakhpur";
    const city = body.city?.trim() || district;
    const pincode = body.pincode?.trim() || "273001";

    const adminName = body.adminName?.trim() || ownerName;
    const adminEmail = (body.adminEmail?.trim() || officialEmail).toLowerCase();
    const password = body.password;
    const confirmPassword = body.confirmPassword || password;
    const termsAccepted = body.termsAccepted ?? true;

    if (!instituteName || !ownerName || !officialEmail || !phone) {
      return NextResponse.json(
        { success: false, error: "Please provide all required institute details: Name, Owner Name, Official Email, and Phone Number." },
        { status: 400 }
      );
    }

    if (!adminEmail || !password) {
      return NextResponse.json(
        { success: false, error: "Please provide Admin email and password." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms and Conditions to proceed." },
        { status: 400 }
      );
    }

    // 2. Check for Duplicate Institute Registration
    const allInstitutes = await dataStore.getAllInstitutes();
    const duplicateEmail = allInstitutes.find(
      (i) => i.email.toLowerCase() === officialEmail || i.email.toLowerCase() === adminEmail
    );
    if (duplicateEmail) {
      return NextResponse.json(
        { success: false, error: `An institute with email "${officialEmail}" is already registered. Please sign in or use another email.` },
        { status: 409 }
      );
    }

    // Check in Firestore if available
    if (adminDb) {
      try {
        const querySnap = await adminDb.collection("institutes").where("email", "==", officialEmail).get();
        if (!querySnap.empty) {
          return NextResponse.json(
            { success: false, error: `An institute with official email "${officialEmail}" already exists in the database.` },
            { status: 409 }
          );
        }
      } catch (dbCheckErr) {
        console.warn("Firestore duplicate check warning:", dbCheckErr);
      }
    }

    // 3. Generate Guaranteed Unique, Transaction-Safe Institute ID (e.g. SBCI-2026-00001)
    const codePrefix = (body.prefix || body.code || "SBCI").toUpperCase();
    const instituteId = dataStore.generateUniqueInstituteId(codePrefix);

    // 4. Provision Firebase Authentication Account
    let authUid = `usr_${instituteId.toLowerCase().replace(/[^a-z0-9]/g, "_")}`;

    if (adminAuth) {
      try {
        let existingUser = null;
        try {
          existingUser = await adminAuth.getUserByEmail(adminEmail);
        } catch {
          // User doesn't exist, proceed to create
        }

        if (existingUser) {
          authUid = existingUser.uid;
          await adminAuth.updateUser(authUid, {
            displayName: adminName,
            password,
          });
        } else {
          const newUser = await adminAuth.createUser({
            email: adminEmail,
            password,
            displayName: adminName,
            phoneNumber: phone.startsWith("+") ? phone : undefined,
          });
          authUid = newUser.uid;
        }

        // Set custom claims for strict role-based access & tenant boundary
        await adminAuth.setCustomUserClaims(authUid, {
          role: "institute_admin",
          instituteId,
        });
      } catch (authErr: any) {
        console.warn("Firebase Admin Auth account provisioning notice:", authErr.message);
        if (authErr.code === "auth/email-already-exists") {
          return NextResponse.json(
            { success: false, error: "This email address is already registered in Firebase Authentication. Please log in." },
            { status: 409 }
          );
        }
      }
    }

    // 5. Build Authoritative Institute Record
    const newInstitute: Institute = {
      id: instituteId,
      name: instituteName,
      code: codePrefix,
      status: "active",
      ownerName,
      email: officialEmail,
      password,
      mobile: phone,
      address,
      state,
      district,
      pincode,
      walletBalance: 0,
      assignedCourses: ["c-adca", "c-typ", "c-dca"],
      registeredAt: new Date().toISOString(),
      onboarding_completed: false,
      institute_type: instituteType,
      settings: {
        admissionFee: 150,
        profileEditFee: 100,
        certificateFee: 0,
        marksheetFee: 0,
        autoApproveStudents: true,
      },
    };

    // 6. Persist to DataStore
    await dataStore.createInstitute(newInstitute);

    // Initialize initial onboarding state
    await dataStore.saveOnboardingState({
      instituteId,
      step: 1,
      isCompleted: false,
      personalInfo: {
        ownerName,
        directorName: ownerName,
        contactNumber: phone,
        email: adminEmail,
        designation: "Director",
      },
      instituteInfo: {
        name: instituteName,
        address: `${address}, ${city}, ${state} - ${pincode}`,
        officialEmail,
        establishedYear: new Date().getFullYear().toString(),
        instituteType,
      },
      academicConfig: {
        academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
        studentIdPrefix: codePrefix,
        courseCategories: ["Computer Diploma", "Typing", "Certificate Courses"],
      },
      updatedAt: new Date().toISOString(),
    });

    // 7. Persist to Cloud Firestore (with settings subcollections & user doc)
    if (adminDb) {
      try {
        const instRef = adminDb.collection("institutes").doc(instituteId);
        await instRef.set(newInstitute, { merge: true });

        // Subcollections
        await instRef.collection("settings").doc("general").set({
          institute_id: instituteId,
          institute_name: instituteName,
          institute_type: instituteType,
          official_email: officialEmail,
          phone,
          status: "active",
          onboarding_completed: false,
          updated_at: new Date().toISOString(),
        });

        await instRef.collection("settings").doc("branding").set({
          primaryColor: "#0F172A",
          secondaryColor: "#4F46E5",
          logoUrl: "",
          certificateSignatureUrl: "",
          instituteStampUrl: "",
          updated_at: new Date().toISOString(),
        });

        await instRef.collection("settings").doc("academic").set({
          academicSession: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          studentIdPrefix: codePrefix,
          defaultAdmissionFee: 150,
          profileEditFee: 100,
          updated_at: new Date().toISOString(),
        });

        // User document in /users/{uid}
        await adminDb.collection("users").doc(authUid).set({
          uid: authUid,
          name: adminName,
          email: adminEmail,
          role: "institute_admin",
          institute_id: instituteId,
          account_status: "active",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, { merge: true });

        // Platform Audit Log
        const auditRef = adminDb.collection("platform_audit_logs").doc();
        await auditRef.set({
          log_id: auditRef.id,
          actor_uid: authUid,
          actor_role: "institute_admin",
          institute_id: instituteId,
          action: "INSTITUTE_REGISTRATION",
          details: `Institute ${instituteName} registered with ID ${instituteId}. Admin: ${adminEmail}`,
          timestamp: new Date().toISOString(),
        });
      } catch (dbErr: any) {
        console.warn("Firestore sync warning during registration:", dbErr.message);
      }
    }

    // 8. Log in DataStore Audit Ledger
    dataStore.logAudit({
      instituteId,
      userId: adminName,
      userEmail: adminEmail,
      action: "INSTITUTE_CREATED",
      targetType: "institute",
      targetId: instituteId,
      details: `Institute registered: ${instituteName} (${instituteId}) by ${adminName}. Status: Active, Onboarding: Incomplete`,
    });

    // 9. Sign Authoritative Session Token Cookie
    const sessionToken = await signSessionToken({
      uid: authUid,
      email: adminEmail,
      role: "institute_admin",
      instituteId,
      displayName: adminName,
    });

    const response = NextResponse.json({
      success: true,
      message: "Institute registered successfully!",
      institute: newInstitute,
      credentials: {
        instituteId,
        adminLoginId: adminEmail,
        adminEmail,
        accountStatus: "active",
        registeredAt: newInstitute.registeredAt,
      },
      onboardingUrl: `/onboarding?instituteId=${instituteId}`,
      dashboardUrl: "/dashboard",
    });

    // Set signed HTTP-only cookie
    response.cookies.set({
      name: "cdp_session_token",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: "lax",
    });

    response.cookies.set({
      name: "cdp_role",
      value: "institute_admin",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    response.cookies.set({
      name: "cdp_inst_id",
      value: instituteId,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    response.cookies.set({
      name: "cdp_institute",
      value: instituteId,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    console.error("Register institute error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to process institute registration." },
      { status: 500 }
    );
  }
}
