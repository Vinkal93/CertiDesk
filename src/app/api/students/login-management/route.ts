import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/token";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { dataStore } from "@/lib/db";
import { StudentAccount } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const reqInstId = searchParams.get("instituteId");

    // Strict Tenant Isolation: Institute Admins can ONLY view their own institute
    let instituteId = payload.instituteId;
    if (payload.role === "super_admin") {
      instituteId = reqInstId || payload.instituteId || "all";
    }

    if (!instituteId) {
      return NextResponse.json({ success: false, error: "No affiliated institute found." }, { status: 400 });
    }

    // 1. Fetch Students of this Institute
    const allStudents = await dataStore.getAllStudents();
    const instStudents = instituteId === "all" ? allStudents : allStudents.filter((s) => s.instituteId === instituteId);

    // 2. Fetch Existing Student Accounts
    const allAccounts = await dataStore.getStudentAccounts(instituteId === "all" ? "" : instituteId);

    // 3. Map students to account view
    const combined = instStudents.map((student) => {
      const matchedAccount = allAccounts.find(
        (acc) => acc.studentId === student.id || acc.enrollmentNo === student.enrollmentNo
      );

      return {
        studentId: student.id,
        fullName: student.fullName,
        enrollmentNo: student.enrollmentNo,
        courseName: student.courseName,
        courseCode: student.courseCode,
        batchName: student.batchName,
        mobile: student.mobile,
        email: student.email,
        instituteId: student.instituteId,
        hasAccount: Boolean(matchedAccount),
        uid: matchedAccount?.uid || null,
        loginId: matchedAccount?.loginId || student.email || `${student.enrollmentNo.toLowerCase().replace(/[^a-z0-9]/g, "_")}@student.certidesk`,
        accountStatus: matchedAccount?.accountStatus || "inactive",
        passwordStatus: matchedAccount?.passwordStatus || "pending",
        mustChangePassword: matchedAccount?.mustChangePassword ?? true,
        lastLogin: matchedAccount?.lastLogin || null,
        createdAt: matchedAccount?.createdAt || null,
      };
    });

    // Also include any standalone student accounts created for this institute
    for (const acc of allAccounts) {
      if (!combined.some((c) => c.uid === acc.uid || c.enrollmentNo === acc.enrollmentNo)) {
        combined.push({
          studentId: acc.studentId,
          fullName: acc.fullName,
          enrollmentNo: acc.enrollmentNo,
          courseName: "General Course",
          courseCode: "GEN",
          batchName: "Regular",
          mobile: "",
          email: acc.loginId,
          instituteId: acc.instituteId,
          hasAccount: true,
          uid: acc.uid,
          loginId: acc.loginId,
          accountStatus: acc.accountStatus,
          passwordStatus: acc.passwordStatus,
          mustChangePassword: acc.mustChangePassword ?? true,
          lastLogin: acc.lastLogin || null,
          createdAt: acc.createdAt,
        });
      }
    }

    return NextResponse.json({
      success: true,
      students: combined,
      accounts: combined,
      totalStudents: combined.length,
      accountsCreated: allAccounts.length,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("cdp_session_token")?.value;
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }

    const payload = await verifySessionToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: "Invalid session." }, { status: 401 });
    }

    const body = await request.json();
    const action = body.action || "create-login";

    // --- ACTION 1: CREATE LOGIN FOR SINGLE STUDENT ---
    if (action === "create-login") {
      let { studentId, customPassword, password, fullName, enrollmentNo, loginId, loginEmail, mustChangePassword } = body;
      const initialPassword = customPassword || password || `Std@${(enrollmentNo || "2026").split("/").pop()}`;

      let student = studentId ? await dataStore.getStudentById(studentId) : null;
      if (!student && enrollmentNo) {
        student = await dataStore.findStudentForLogin(enrollmentNo);
      }
      if (!student && (fullName || enrollmentNo || loginId)) {
        const studentRes = await dataStore.createStudent({
          instituteId: payload.instituteId || "SBCI1001",
          fullName: fullName || "Student",
          fatherName: body.fatherName || "Father",
          motherName: body.motherName || "Mother",
          dob: body.dob || "2000-01-01",
          gender: (body.gender as any) || "Other",
          mobile: body.mobile || "9999999999",
          email: body.email || loginId || `${Date.now()}@student.certidesk`,
          address: body.address || "Main Street",
          state: body.state || "Uttar Pradesh",
          district: body.district || "Lucknow",
          pincode: body.pincode || "226001",
          qualification: "12th",
          schoolCollege: "College",
          courseId: "crs_adca",
          courseName: body.courseName || "ADCA",
          courseCode: body.courseCode || "ADCA",
          batchId: "bat_morning",
          batchName: "Morning Batch",
          session: "2026-2027",
          courseDuration: "6 Months",
          courseFee: 5000,
          admissionDate: new Date().toISOString(),
          status: "Active",
        }, true);
        student = studentRes.student;
        studentId = student.id;
      }

      if (!student) {
        return NextResponse.json({ success: false, error: "studentId or student details are required." }, { status: 400 });
      }

      // Strict Tenant Guard
      if (payload.role !== "super_admin" && payload.instituteId !== student.instituteId) {
        return NextResponse.json(
          { success: false, error: "Forbidden: You cannot manage accounts for another institute's students." },
          { status: 403 }
        );
      }

      // Check if account already exists
      const existingAccount = await dataStore.getStudentAccount(student.id);
      if (existingAccount) {
        return NextResponse.json(
          { success: false, error: `Login account already exists for ${student.fullName} (${existingAccount.loginId}).` },
          { status: 409 }
        );
      }

      // Generate Clean Login Email / Identifier
      const finalLoginEmail = (loginEmail || loginId || "").trim().toLowerCase() ||
        (student.email && !student.email.includes("certidesk.pro") ? student.email.toLowerCase() : null) ||
        `${student.enrollmentNo.toLowerCase().replace(/[^a-z0-9]/g, "_")}@student.certidesk`;

      let authUid = `usr_std_${student.id}`;

      // Provision in Firebase Authentication
      if (adminAuth) {
        try {
          let fbUser;
          try {
            fbUser = await adminAuth.getUserByEmail(finalLoginEmail);
            authUid = fbUser.uid;
            await adminAuth.updateUser(authUid, {
              password: initialPassword,
              displayName: student.fullName,
            });
          } catch {
            fbUser = await adminAuth.createUser({
              email: finalLoginEmail,
              password: initialPassword,
              displayName: student.fullName,
            });
            authUid = fbUser.uid;
          }

          // Strict custom claims for tenant isolation
          await adminAuth.setCustomUserClaims(authUid, {
            role: "student",
            instituteId: student.instituteId,
            studentId: student.id,
          });
        } catch (authErr: any) {
          console.warn("adminAuth student provision notice:", authErr.message);
        }
      }

      const newAccount: StudentAccount = {
        uid: authUid,
        studentId: student.id,
        instituteId: student.instituteId,
        loginId: finalLoginEmail,
        fullName: student.fullName,
        enrollmentNo: student.enrollmentNo,
        accountStatus: "active",
        passwordStatus: "set",
        mustChangePassword: mustChangePassword ?? true,
        temporaryPassword: initialPassword,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await dataStore.createStudentAccount(newAccount);

      // Sync to Firestore
      if (adminDb) {
        try {
          await adminDb.collection("users").doc(authUid).set({
            uid: authUid,
            name: student.fullName,
            email: loginEmail,
            role: "student",
            institute_id: student.instituteId,
            student_id: student.id,
            account_status: "active",
            created_at: new Date().toISOString(),
          }, { merge: true });

          await adminDb
            .collection("institutes")
            .doc(student.instituteId)
            .collection("student_accounts")
            .doc(authUid)
            .set(newAccount, { merge: true });
        } catch (dbErr: any) {
          console.warn("Firestore student account sync notice:", dbErr.message);
        }
      }

      dataStore.logAudit({
        instituteId: student.instituteId,
        userId: payload.displayName || "Admin",
        userEmail: payload.email,
        action: "STUDENT_LOGIN_CREATED",
        targetType: "student",
        targetId: student.id,
        details: `Created login account for student ${student.fullName} (${student.enrollmentNo}). Login ID: ${loginEmail}`,
      });

      return NextResponse.json({
        success: true,
        message: `Login account created successfully for ${student.fullName}!`,
        account: newAccount,
        temporaryPassword: initialPassword,
      });
    }

    // --- ACTION 2: BULK CREATE LOGINS ---
    if (action === "bulk-create") {
      const { studentIds, students: inputStudents, defaultPassword } = body;
      let targetIds = Array.isArray(studentIds) ? [...studentIds] : [];

      if (Array.isArray(inputStudents) && inputStudents.length > 0) {
        for (const st of inputStudents) {
          const studentRes = await dataStore.createStudent({
            instituteId: payload.instituteId || "SBCI1001",
            fullName: st.fullName || "Student",
            fatherName: st.fatherName || "Father",
            motherName: st.motherName || "Mother",
            dob: st.dob || "2000-01-01",
            gender: (st.gender as any) || "Other",
            mobile: st.mobile || "9999999999",
            email: st.email || st.loginId || `${Date.now()}_${Math.random().toString(36).substr(2, 4)}@student.certidesk`,
            address: st.address || "Main Street",
            state: st.state || "Uttar Pradesh",
            district: st.district || "Lucknow",
            pincode: st.pincode || "226001",
            qualification: "12th",
            schoolCollege: "College",
            courseId: "crs_adca",
            courseName: st.courseName || "ADCA",
            courseCode: st.courseCode || "ADCA",
            batchId: "bat_morning",
            batchName: "Morning Batch",
            session: "2026-2027",
            courseDuration: "6 Months",
            courseFee: 5000,
            admissionDate: new Date().toISOString(),
            status: "Active",
          }, true);
          targetIds.push(studentRes.student.id);
        }
      }

      if (targetIds.length === 0) {
        return NextResponse.json({ success: false, error: "studentIds or students array required." }, { status: 400 });
      }

      const created: string[] = [];
      const skipped: string[] = [];

      for (const sid of targetIds) {
        const student = await dataStore.getStudentById(sid);
        if (!student) continue;

        // Strict Tenant Guard
        if (payload.role !== "super_admin" && payload.instituteId !== student.instituteId) {
          continue;
        }

        const existing = await dataStore.getStudentAccount(sid);
        if (existing) {
          skipped.push(student.fullName);
          continue;
        }

        const loginEmail = student.email || `${student.enrollmentNo.toLowerCase().replace(/[^a-z0-9]/g, "_")}@student.certidesk`;
        const tempPass = defaultPassword || `Std@${student.enrollmentNo.split("/").pop() || "2026"}`;
        const authUid = `usr_std_${student.id}`;

        if (adminAuth) {
          try {
            await adminAuth.createUser({
              email: loginEmail,
              password: tempPass,
              displayName: student.fullName,
            });
            await adminAuth.setCustomUserClaims(authUid, {
              role: "student",
              instituteId: student.instituteId,
              studentId: student.id,
            });
          } catch (e) {
            // Continue
          }
        }

        const acc: StudentAccount = {
          uid: authUid,
          studentId: student.id,
          instituteId: student.instituteId,
          loginId: loginEmail,
          fullName: student.fullName,
          enrollmentNo: student.enrollmentNo,
          accountStatus: "active",
          passwordStatus: "set",
          mustChangePassword: true,
          temporaryPassword: tempPass,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await dataStore.createStudentAccount(acc);
        created.push(student.fullName);
      }

      dataStore.logAudit({
        instituteId: payload.instituteId || "all",
        userId: payload.displayName || "Admin",
        userEmail: payload.email,
        action: "STUDENT_LOGINS_BULK_CREATED",
        targetType: "student",
        targetId: `batch_${Date.now()}`,
        details: `Bulk created ${created.length} student login accounts. ${skipped.length} skipped.`,
      });

      return NextResponse.json({
        success: true,
        message: `Successfully created ${created.length} student login accounts.`,
        createdCount: created.length,
        skippedCount: skipped.length,
        results: {
          created: created.length,
          skipped: skipped.length,
        },
      });
    }

    // --- ACTION 3: RESET PASSWORD ---
    if (action === "reset-password") {
      const targetUid = body.accountUid || body.uid || body.studentId;
      if (!targetUid) {
        return NextResponse.json({ success: false, error: "accountUid or uid is required." }, { status: 400 });
      }
      const acc = await dataStore.getStudentAccount(targetUid);
      if (!acc) {
        return NextResponse.json({ success: false, error: "Student account not found." }, { status: 404 });
      }

      // Strict Tenant Guard
      if (payload.role !== "super_admin" && payload.instituteId !== acc.instituteId) {
        return NextResponse.json({ success: false, error: "Forbidden: Cross-tenant access rejected." }, { status: 403 });
      }

      const generatedPassword = body.newPassword || `Pass@${Math.floor(100000 + Math.random() * 900000)}`;

      if (adminAuth) {
        try {
          await adminAuth.updateUser(acc.uid, {
            password: generatedPassword,
          });
        } catch (e: any) {
          console.warn("adminAuth password reset warning:", e.message);
        }
      }

      const updatedAcc = await dataStore.updateStudentAccount(acc.uid, {
        passwordStatus: "set",
        mustChangePassword: body.mustChangePassword ?? false,
        temporaryPassword: generatedPassword,
      });

      dataStore.logAudit({
        instituteId: acc.instituteId,
        userId: payload.displayName || "Admin",
        userEmail: payload.email,
        action: "STUDENT_PASSWORD_RESET",
        targetType: "student",
        targetId: acc.studentId,
        details: `Reset password for student ${acc.fullName} (${acc.loginId}).`,
      });

      return NextResponse.json({
        success: true,
        message: `Password reset successfully for ${acc.fullName}.`,
        account: updatedAcc,
        temporaryPassword: generatedPassword,
      });
    }

    // --- ACTION 4: TOGGLE STATUS (ACTIVATE / DEACTIVATE) ---
    if (action === "toggle-status") {
      const targetUid = body.accountUid || body.uid || body.studentId;
      if (!targetUid) {
        return NextResponse.json({ success: false, error: "accountUid or uid is required." }, { status: 400 });
      }
      const acc = await dataStore.getStudentAccount(targetUid);
      if (!acc) {
        return NextResponse.json({ success: false, error: "Student account not found." }, { status: 404 });
      }

      // Strict Tenant Guard
      if (payload.role !== "super_admin" && payload.instituteId !== acc.instituteId) {
        return NextResponse.json({ success: false, error: "Forbidden: Cross-tenant access rejected." }, { status: 403 });
      }

      const targetStatus: "active" | "inactive" = body.status === "active" ? "active" : "inactive";

      if (adminAuth) {
        try {
          await adminAuth.updateUser(acc.uid, {
            disabled: targetStatus === "inactive",
          });
        } catch (e) {
          // Continue
        }
      }

      const updatedAcc = await dataStore.updateStudentAccount(acc.uid, {
        accountStatus: targetStatus,
      });

      dataStore.logAudit({
        instituteId: acc.instituteId,
        userId: payload.displayName || "Admin",
        userEmail: payload.email,
        action: targetStatus === "active" ? "STUDENT_ACCOUNT_ACTIVATED" : "STUDENT_ACCOUNT_DEACTIVATED",
        targetType: "student",
        targetId: acc.studentId,
        details: `Changed account status to ${targetStatus} for student ${acc.fullName}.`,
      });

      return NextResponse.json({
        success: true,
        message: `Student account ${targetStatus === "active" ? "activated" : "deactivated"} successfully.`,
        account: updatedAcc,
      });
    }

    // --- ACTION 5: EDIT ACCOUNT DETAILS ---
    if (action === "update-account") {
      const { uid, loginEmail, accountStatus } = body;
      const acc = await dataStore.getStudentAccount(uid);
      if (!acc) {
        return NextResponse.json({ success: false, error: "Account not found." }, { status: 404 });
      }

      // Strict Tenant Guard
      if (payload.role !== "super_admin" && payload.instituteId !== acc.instituteId) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
      }

      const cleanEmail = loginEmail?.trim().toLowerCase() || acc.loginId;

      if (adminAuth && cleanEmail !== acc.loginId) {
        try {
          await adminAuth.updateUser(acc.uid, {
            email: cleanEmail,
          });
        } catch (authErr: any) {
          if (authErr.code === "auth/email-already-exists") {
            return NextResponse.json({ success: false, error: "This email address is already in use by another account." }, { status: 409 });
          }
        }
      }

      const updated = await dataStore.updateStudentAccount(acc.uid, {
        loginId: cleanEmail,
        accountStatus: accountStatus || acc.accountStatus,
      });

      dataStore.logAudit({
        instituteId: acc.instituteId,
        userId: payload.displayName || "Admin",
        userEmail: payload.email,
        action: "STUDENT_ACCOUNT_EDITED",
        targetType: "student",
        targetId: acc.studentId,
        details: `Updated login details for student ${acc.fullName}: Email=${cleanEmail}, Status=${updated.accountStatus}`,
      });

      return NextResponse.json({
        success: true,
        message: "Student account details updated successfully.",
        account: updated,
      });
    }

    return NextResponse.json({ success: false, error: "Unknown action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
