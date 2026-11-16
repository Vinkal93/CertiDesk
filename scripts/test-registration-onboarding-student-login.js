// scripts/test-registration-onboarding-student-login.js
// End-to-End Verification Suite for Institute Registration, Onboarding Wizard & Student Login Management

const http = require("http");

async function runTests() {
  console.log("=====================================================================");
  console.log("  CERTIDESK PRO: REGISTRATION, ONBOARDING & STUDENT LOGIN TEST SUITE ");
  console.log("=====================================================================\n");

  const baseUrl = "http://localhost:3005";
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  function makeRequest(path, method = "GET", headers = {}, body = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const reqHeaders = { ...headers };
      if (body) {
        reqHeaders["Content-Type"] = "application/json";
      }

      const req = http.request(
        url,
        {
          method,
          headers: reqHeaders,
        },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            let json = null;
            try {
              json = JSON.parse(data);
            } catch (e) {
              json = data;
            }
            resolve({
              status: res.statusCode,
              headers: res.headers,
              cookies: res.headers["set-cookie"] || [],
              body: json,
            });
          });
        }
      );

      req.on("error", (err) => reject(err));
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  function extractCookie(cookies, name) {
    for (const c of cookies) {
      if (c.startsWith(`${name}=`)) {
        return c.split(";")[0];
      }
    }
    return null;
  }

  const timestamp = Date.now();
  const testEmailA = `apex_${timestamp}@testapex.edu`;
  const testEmailB = `zenith_${timestamp}@testzenith.edu`;
  let instSessionCookieA = "";
  let instituteIdA = "";
  let instSessionCookieB = "";
  let instituteIdB = "";
  let studentAccountUid = "";

  // -------------------------------------------------------------
  // TEST 1: Public Registration API Validation & Error Handling
  // -------------------------------------------------------------
  console.log("TEST 1: Registration Validation & Missing Fields Check");
  try {
    const invalidRes = await makeRequest("/api/auth/register-institute", "POST", {}, {
      instituteName: "Incomplete Institute",
      // missing email, password, etc.
    });
    assert(invalidRes.status === 400, `Missing fields returns HTTP 400 (Actual: ${invalidRes.status})`);
    assert(invalidRes.body?.success === false, "Returns success: false on missing required fields");

    const shortPassRes = await makeRequest("/api/auth/register-institute", "POST", {}, {
      instituteName: "Test Institute",
      ownerName: "Owner Name",
      email: `test_short_${timestamp}@test.edu`,
      mobile: "9876543210",
      password: "123", // too short
      address: "123 Road",
      state: "Uttar Pradesh",
      district: "Lucknow",
      pincode: "226001",
      agreeTerms: true
    });
    assert(shortPassRes.status === 400, `Password under 6 chars returns HTTP 400 (Actual: ${shortPassRes.status})`);
  } catch (err) {
    console.error("Test 1 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 2: Authoritative Institute A Registration with Unique ID
  // -------------------------------------------------------------
  console.log("\nTEST 2: Institute A Registration & Unique ID (SBCI-2026-XXXXX)");
  try {
    const regRes = await makeRequest("/api/auth/register-institute", "POST", {}, {
      instituteName: "Apex Tech Institute",
      instituteType: "Computer & Vocational Training",
      ownerName: "Vikram Sharma",
      email: testEmailA,
      mobile: "9876543210",
      password: "Password@123",
      address: "Plot 42, Cyber Hub, Gomti Nagar",
      state: "Uttar Pradesh",
      district: "Lucknow",
      pincode: "226010",
      agreeTerms: true
    });

    assert(regRes.status === 200, `Registration returns HTTP 200 OK (Actual: ${regRes.status})`);
    assert(regRes.body?.success === true, "Registration returned success: true");
    instituteIdA = regRes.body?.institute?.id || "";
    console.log(`    Generated Institute ID: ${instituteIdA}`);
    assert(/^SBCI-2026-\d{5}$/.test(instituteIdA), `Institute ID matches format SBCI-2026-XXXXX (${instituteIdA})`);

    const sessionTokenCookie = extractCookie(regRes.cookies, "cdp_session_token");
    const roleCookie = extractCookie(regRes.cookies, "cdp_role");
    const instIdCookie = extractCookie(regRes.cookies, "cdp_inst_id");

    assert(!!sessionTokenCookie, "Session token cookie cdp_session_token issued");
    assert(roleCookie?.includes("institute_admin"), "Role cookie contains institute_admin");
    assert(instIdCookie?.includes(instituteIdA), `Institute ID cookie contains ${instituteIdA}`);

    instSessionCookieA = [sessionTokenCookie, roleCookie, instIdCookie].filter(Boolean).join("; ");
  } catch (err) {
    console.error("Test 2 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Duplicate Email Registration Rejection
  // -------------------------------------------------------------
  console.log("\nTEST 3: Duplicate Email Registration Rejection");
  try {
    const dupRes = await makeRequest("/api/auth/register-institute", "POST", {}, {
      instituteName: "Duplicate Apex Tech",
      ownerName: "Vikram Sharma",
      email: testEmailA, // Same email!
      mobile: "9876543210",
      password: "Password@123",
      address: "Plot 42",
      state: "Uttar Pradesh",
      district: "Lucknow",
      pincode: "226010",
      agreeTerms: true
    });

    assert(dupRes.status === 409, `Duplicate email rejected with HTTP 409 Conflict (Actual: ${dupRes.status})`);
    assert(dupRes.body?.success === false, "Duplicate registration blocked");
  } catch (err) {
    console.error("Test 3 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Guided Onboarding Workflow (/api/onboarding)
  // -------------------------------------------------------------
  console.log("\nTEST 4: Onboarding API (Get, Save Step, Skip for Later, Complete)");
  try {
    // 4.1: Fetch current state
    const getRes = await makeRequest("/api/onboarding", "GET", {
      Cookie: instSessionCookieA,
    });
    assert(getRes.status === 200, `GET /api/onboarding returns HTTP 200 (Actual: ${getRes.status})`);
    assert(getRes.body?.onboarding?.isCompleted === false, "Initial onboarding state is incomplete");

    // 4.2: Save Step 2 Personal Info
    const saveStepRes = await makeRequest("/api/onboarding", "POST", {
      Cookie: instSessionCookieA,
    }, {
      step: 2,
      personalInfo: {
        ownerName: "Vikram Sharma Updated",
        mobile: "9876543210",
        designation: "Managing Director"
      }
    });
    assert(saveStepRes.status === 200, "POST /api/onboarding saving step returns HTTP 200");
    assert(saveStepRes.body?.onboarding?.personalInfoCompleted === true, "Personal info marked completed");

    // 4.3: Skip for Later
    const skipRes = await makeRequest("/api/onboarding", "POST", {
      Cookie: instSessionCookieA,
    }, {
      skipForLater: true
    });
    assert(skipRes.status === 200, "Skip for Later returns HTTP 200");
    assert(skipRes.body?.onboarding?.isSkipped === true, "Onboarding isSkipped flag set to true");

    // 4.4: Mark Completed
    const completeRes = await makeRequest("/api/onboarding", "POST", {
      Cookie: instSessionCookieA,
    }, {
      isCompleted: true,
      academicConfig: {
        admissionFee: 150,
        certificateFee: 0,
        passingPercentage: 40,
        defaultCourseDuration: "6 Months"
      }
    });
    assert(completeRes.status === 200, "Mark Completed returns HTTP 200");
    assert(completeRes.body?.onboarding?.isCompleted === true, "Onboarding marked as completed");
  } catch (err) {
    console.error("Test 4 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 5: Student Login Management (Create, Reset, Toggle)
  // -------------------------------------------------------------
  console.log("\nTEST 5: Student Login Account Management (/api/students/login-management)");
  try {
    // 5.1: Create student account
    const createStRes = await makeRequest("/api/students/login-management", "POST", {
      Cookie: instSessionCookieA,
    }, {
      action: "create-login",
      fullName: "Aarav Sharma",
      enrollmentNo: "SBCI-APEX-001",
      loginId: `aarav_${timestamp}`,
      email: `aarav_${timestamp}@apextech.in`,
      password: "InitialPassword@2026",
      mustChangePassword: true
    });

    assert(createStRes.status === 200, `Create student login returns HTTP 200 (Actual: ${createStRes.status})`);
    assert(createStRes.body?.success === true, "Student login account created successfully");
    studentAccountUid = createStRes.body?.account?.uid;
    assert(!!studentAccountUid, `Generated student account UID: ${studentAccountUid}`);
    assert(createStRes.body?.account?.instituteId === instituteIdA, "Student account bound to Institute A");

    // 5.2: Query student accounts list
    const listStRes = await makeRequest("/api/students/login-management", "GET", {
      Cookie: instSessionCookieA,
    });
    assert(listStRes.status === 200, "GET /api/students/login-management returns HTTP 200");
    assert(Array.isArray(listStRes.body?.accounts), "Accounts array returned");
    const foundSt = listStRes.body?.accounts?.find((a) => a.uid === studentAccountUid);
    assert(!!foundSt, "Newly created student found in accounts roster");

    // 5.3: Toggle status to inactive
    const toggleRes = await makeRequest("/api/students/login-management", "POST", {
      Cookie: instSessionCookieA,
    }, {
      action: "toggle-status",
      accountUid: studentAccountUid,
      status: "inactive"
    });
    assert(toggleRes.status === 200, "Toggle student account status returns HTTP 200");
    assert(toggleRes.body?.account?.accountStatus === "inactive", "Account status updated to inactive");

    // 5.4: Reset password
    const resetRes = await makeRequest("/api/students/login-management", "POST", {
      Cookie: instSessionCookieA,
    }, {
      action: "reset-password",
      accountUid: studentAccountUid,
      newPassword: "ResetPassword@2026",
      mustChangePassword: false
    });
    assert(resetRes.status === 200, "Reset password returns HTTP 200");
    assert(resetRes.body?.account?.passwordStatus === "set", "Password status set after reset");

    // 5.5: Bulk create logins
    const bulkRes = await makeRequest("/api/students/login-management", "POST", {
      Cookie: instSessionCookieA,
    }, {
      action: "bulk-create",
      students: [
        {
          fullName: "Bulk Student One",
          enrollmentNo: "SBCI-APEX-002",
          loginId: `bulk1_${timestamp}`,
          email: `bulk1_${timestamp}@apextech.in`,
        },
        {
          fullName: "Bulk Student Two",
          enrollmentNo: "SBCI-APEX-003",
          loginId: `bulk2_${timestamp}`,
          email: `bulk2_${timestamp}@apextech.in`,
        }
      ]
    });
    assert(bulkRes.status === 200, "Bulk create returns HTTP 200");
    assert(bulkRes.body?.results?.created === 2, `Bulk create generated 2 student accounts (Actual: ${bulkRes.body?.results?.created})`);
  } catch (err) {
    console.error("Test 5 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 6: Strict Cross-Tenant Isolation Enforcement
  // -------------------------------------------------------------
  console.log("\nTEST 6: Strict Multi-Tenant Isolation Enforcement");
  try {
    // 6.1: Register Institute B
    const regResB = await makeRequest("/api/auth/register-institute", "POST", {}, {
      instituteName: "Zenith Global Academy",
      ownerName: "Pooja Verma",
      email: testEmailB,
      mobile: "9123456789",
      password: "Password@123",
      address: "MG Road",
      state: "Uttar Pradesh",
      district: "Varanasi",
      pincode: "221001",
      agreeTerms: true
    });
    assert(regResB.status === 200, "Institute B registered successfully");
    instituteIdB = regResB.body?.institute?.id;
    console.log(`    Institute B ID: ${instituteIdB}`);

    const sessionB = extractCookie(regResB.cookies, "cdp_session_token");
    const roleB = extractCookie(regResB.cookies, "cdp_role");
    const instIdB = extractCookie(regResB.cookies, "cdp_inst_id");
    instSessionCookieB = [sessionB, roleB, instIdB].filter(Boolean).join("; ");

    // 6.2: Institute B tries to access Institute A's student account list
    const listBRes = await makeRequest("/api/students/login-management", "GET", {
      Cookie: instSessionCookieB,
    });
    const leakA = listBRes.body?.accounts?.some((a) => a.instituteId === instituteIdA);
    assert(!leakA, "Institute B cannot see Institute A's students in GET listing (Zero leakage)");

    // 6.3: Institute B tries to reset password of Institute A's student
    const attackResetRes = await makeRequest("/api/students/login-management", "POST", {
      Cookie: instSessionCookieB,
    }, {
      action: "reset-password",
      accountUid: studentAccountUid, // Belongs to Institute A!
      newPassword: "HackedPassword@123"
    });
    assert(
      attackResetRes.status === 403 || attackResetRes.status === 404,
      `Cross-tenant password reset blocked with HTTP ${attackResetRes.status} (Expected 403/404)`
    );

    // 6.4: Institute B tries to toggle status of Institute A's student
    const attackToggleRes = await makeRequest("/api/students/login-management", "POST", {
      Cookie: instSessionCookieB,
    }, {
      action: "toggle-status",
      accountUid: studentAccountUid, // Belongs to Institute A!
      status: "inactive"
    });
    assert(
      attackToggleRes.status === 403 || attackToggleRes.status === 404,
      `Cross-tenant status toggle blocked with HTTP ${attackToggleRes.status} (Expected 403/404)`
    );
  } catch (err) {
    console.error("Test 6 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 7: Super Admin Session & Platform Master Control
  // -------------------------------------------------------------
  console.log("\nTEST 7: Super Admin Platform Master Control & Directory");
  try {
    const suSessionRes = await makeRequest("/api/auth/session", "POST", {}, {
      email: "admin@certidesk.pro",
      requestedRole: "super_admin",
    });
    assert(suSessionRes.status === 200, "Super Admin session sync returns 200 OK");
    const suToken = extractCookie(suSessionRes.cookies, "cdp_session_token");
    const suRole = extractCookie(suSessionRes.cookies, "cdp_role");
    const suCookie = [suToken, suRole].filter(Boolean).join("; ");

    // Verify Super Admin can access /su protected route
    const suAccessRes = await makeRequest("/su", "GET", {
      Cookie: suCookie,
    });
    assert(suAccessRes.status === 200, "Super Admin successfully accesses /su with 200 OK");
  } catch (err) {
    console.error("Test 7 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=====================================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=====================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
