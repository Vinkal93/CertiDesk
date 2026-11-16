// scripts/test-super-admin-auth-and-governance.js
// Verification suite for Super Admin Authentication with Master Security PIN & Admin Governance

const http = require("http");

async function runTests() {
  console.log("=========================================================================");
  console.log("  CERTIDESK PRO: SUPER ADMIN AUTH (2FA PIN) & GOVERNANCE TEST SUITE      ");
  console.log("=========================================================================\n");

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

  let masterSessionCookie = "";
  let newAdminId = "";

  // -------------------------------------------------------------
  // TEST 1: PIN Enforcement & Validation
  // -------------------------------------------------------------
  console.log("TEST 1: Master Security PIN Validation & Rejection of Missing/Invalid PIN");
  try {
    // Missing PIN
    const noPinRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: "vinkalp041@gmail.com",
      password: "Vinkal@890",
    });
    assert(noPinRes.status === 400, `Missing PIN rejected with HTTP 400 (Actual: ${noPinRes.status})`);
    assert(noPinRes.body?.error?.includes("PIN is required"), "Returns PIN required error message");

    // Invalid PIN format
    const badFormatPinRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: "vinkalp041@gmail.com",
      password: "Vinkal@890",
      pin: "123", // only 3 digits
    });
    assert(badFormatPinRes.status === 400, `Non-6-digit PIN rejected with HTTP 400 (Actual: ${badFormatPinRes.status})`);

    // Incorrect PIN
    const wrongPinRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: "vinkalp041@gmail.com",
      password: "Vinkal@890",
      pin: "000000",
    });
    assert(wrongPinRes.status === 401, `Incorrect PIN rejected with HTTP 401 (Actual: ${wrongPinRes.status})`);
    assert(wrongPinRes.body?.error?.includes("Security PIN"), "Returns invalid PIN error message");

    // Incorrect Password
    const wrongPassRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: "vinkalp041@gmail.com",
      password: "WrongPassword@123",
      pin: "630649",
    });
    assert(wrongPassRes.status === 401, `Incorrect password rejected with HTTP 401 (Actual: ${wrongPassRes.status})`);
  } catch (err) {
    console.error("Test 1 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 2: Authoritative Master Super Admin Login
  // -------------------------------------------------------------
  console.log("\nTEST 2: Master Super Admin Authorization (vinkalp041@gmail.com / 630649)");
  try {
    const loginRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: "vinkalp041@gmail.com",
      password: "Vinkal@890",
      pin: "630649",
    });

    assert(loginRes.status === 200, `Master Super Admin login returns HTTP 200 OK (Actual: ${loginRes.status})`);
    assert(loginRes.body?.success === true, "Authorization granted successfully");
    assert(loginRes.body?.user?.isMaster === true, "User flagged as isMaster: true");
    assert(loginRes.body?.user?.role === "super_admin", "Role established as super_admin");

    const sessionCookie = extractCookie(loginRes.cookies, "cdp_session_token");
    const roleCookie = extractCookie(loginRes.cookies, "cdp_role");
    assert(!!sessionCookie, "Tamper-proof cdp_session_token issued");
    assert(roleCookie?.includes("super_admin"), "cdp_role cookie contains super_admin");

    masterSessionCookie = [sessionCookie, roleCookie].filter(Boolean).join("; ");
  } catch (err) {
    console.error("Test 2 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 3: Access Protected Super Admin HQ (/su)
  // -------------------------------------------------------------
  console.log("\nTEST 3: Protected Super Admin HQ Access (/su)");
  try {
    const suPageRes = await makeRequest("/su", "GET", {
      Cookie: masterSessionCookie,
    });
    assert(suPageRes.status === 200, `Protected route /su returns HTTP 200 OK with valid session`);
  } catch (err) {
    console.error("Test 3 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // TEST 4: Super Admins Management Directory API
  // -------------------------------------------------------------
  console.log("\nTEST 4: Super Admins Management Directory (/api/admin/super-admins)");
  try {
    // 4.1: List Super Admins
    const listRes = await makeRequest("/api/admin/super-admins", "GET", {
      Cookie: masterSessionCookie,
    });
    assert(listRes.status === 200, `GET /api/admin/super-admins returns HTTP 200 (Actual: ${listRes.status})`);
    assert(Array.isArray(listRes.body?.superAdmins), "Returned superAdmins array");

    const rootAdmin = listRes.body?.superAdmins?.find((a) => a.email === "vinkalp041@gmail.com");
    assert(!!rootAdmin, "Master Root Admin (vinkalp041@gmail.com) is present in directory");
    assert(rootAdmin?.pinMasked?.includes("49"), "PIN is securely masked");

    // 4.2: Provision New Super Admin
    const createRes = await makeRequest("/api/admin/super-admins", "POST", {
      Cookie: masterSessionCookie,
    }, {
      action: "create",
      name: "Amit Verma",
      email: `amit_${Date.now()}@platform.in`,
      password: "Password@12345",
      pin: "852963",
      permissions: {
        canManageInstitutes: true,
        canManageSuperAdmins: false,
        canManageFinancials: true,
        canManageBranding: false,
        canManageAuditLogs: true,
      }
    });

    assert(createRes.status === 200, `Provision new Super Admin returns HTTP 200 (Actual: ${createRes.status})`);
    assert(createRes.body?.success === true, "New Super Admin provisioned");
    newAdminId = createRes.body?.admin?.id;
    const newAdminEmail = createRes.body?.admin?.email;
    assert(!!newAdminId, `Created Super Admin ID: ${newAdminId}`);

    // 4.3: Authenticate with the Newly Provisioned Super Admin
    const newAdminLoginRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: newAdminEmail,
      password: "Password@12345",
      pin: "852963",
    });
    assert(newAdminLoginRes.status === 200, "Newly created Super Admin successfully authenticated with PIN 852963");

    // 4.4: Update Super Admin (Reset PIN & Change Name)
    const updateRes = await makeRequest("/api/admin/super-admins", "POST", {
      Cookie: masterSessionCookie,
    }, {
      action: "update",
      id: newAdminId,
      name: "Amit Verma (Senior)",
      newPin: "741258",
    });
    assert(updateRes.status === 200, "Update Super Admin returns HTTP 200");
    assert(updateRes.body?.admin?.name === "Amit Verma (Senior)", "Name updated successfully");

    // 4.5: Verify Login with Updated PIN
    const updatedLoginRes = await makeRequest("/api/auth/super-admin/login", "POST", {}, {
      email: newAdminEmail,
      password: "Password@12345",
      pin: "741258",
    });
    assert(updatedLoginRes.status === 200, "Super Admin successfully authenticated with newly updated PIN 741258");

    // 4.6: Root Master Admin Protection: Attempt to delete Master Root Admin
    const attackDeleteRes = await makeRequest("/api/admin/super-admins", "POST", {
      Cookie: masterSessionCookie,
    }, {
      action: "delete",
      id: "su_master_vinkal",
    });
    assert(attackDeleteRes.status === 403, `Attempt to delete Master Root Admin rejected with HTTP 403 Forbidden (Actual: ${attackDeleteRes.status})`);

    // 4.7: Delete Secondary Super Admin
    const deleteRes = await makeRequest("/api/admin/super-admins", "POST", {
      Cookie: masterSessionCookie,
    }, {
      action: "delete",
      id: newAdminId,
    });
    assert(deleteRes.status === 200, `Secondary Super Admin successfully deleted (HTTP 200)`);
  } catch (err) {
    console.error("Test 4 error:", err);
    failed++;
  }

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log("\n=========================================================================");
  console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=========================================================================");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
