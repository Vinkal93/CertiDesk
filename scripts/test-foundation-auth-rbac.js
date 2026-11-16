// scripts/test-foundation-auth-rbac.js
// Automated Verification Suite for CertiDesk Pro Authentication, RBAC & Multi-Tenant Foundation

const http = require("http");

async function runTests() {
  console.log("=================================================");
  console.log("  CERTIDESK PRO: AUTH, RBAC & TENANCY TEST SUITE ");
  console.log("=================================================\n");

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

  // Helper for HTTP requests
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

  console.log("TEST 1: Public Routes Access & Middleware Protection");
  try {
    const landingRes = await makeRequest("/");
    assert(landingRes.status === 200, "Public route '/' returns 200 OK");

    const suLoginRes = await makeRequest("/su/login");
    assert(suLoginRes.status === 200, "Super Admin login route '/su/login' returns 200 OK");

    const instLoginRes = await makeRequest("/login");
    assert(instLoginRes.status === 200, "Institute login route '/login' returns 200 OK");

    // Attempt unauthorized access to /su without session
    const suGuardedRes = await makeRequest("/su");
    assert(
      suGuardedRes.status === 307 || suGuardedRes.status === 302,
      `Unauthenticated access to /su is redirected with ${suGuardedRes.status}`
    );
    const suRedirectLocation = suGuardedRes.headers["location"] || "";
    assert(
      suRedirectLocation.includes("/su/login"),
      `Redirect target contains /su/login (Actual: ${suRedirectLocation})`
    );

    // Attempt unauthorized access to /dashboard without session
    const dashGuardedRes = await makeRequest("/dashboard");
    assert(
      dashGuardedRes.status === 307 || dashGuardedRes.status === 302,
      `Unauthenticated access to /dashboard is redirected with ${dashGuardedRes.status}`
    );
    const dashRedirectLocation = dashGuardedRes.headers["location"] || "";
    assert(
      dashRedirectLocation.includes("/login"),
      `Redirect target contains /login (Actual: ${dashRedirectLocation})`
    );
  } catch (e) {
    console.error("Test 1 error:", e);
    failed++;
  }

  console.log("\nTEST 2: Privilege Escalation Prevention");
  try {
    // Attempt to claim super_admin role using unauthorized email
    const fakeAdminRes = await makeRequest("/api/auth/session", "POST", {}, {
      email: "attacker@randomdomain.com",
      requestedRole: "super_admin",
    });
    assert(
      fakeAdminRes.status === 401,
      `Privilege escalation rejected with HTTP 401 (Actual: ${fakeAdminRes.status})`
    );
    assert(
      fakeAdminRes.body && fakeAdminRes.body.error && fakeAdminRes.body.error.includes("Access Denied"),
      `Response contains 'Access Denied' message: ${fakeAdminRes.body?.error}`
    );
  } catch (e) {
    console.error("Test 2 error:", e);
    failed++;
  }

  console.log("\nTEST 3: Designated Super Admin Session Creation & Custom Claims");
  let superAdminCookie = "";
  try {
    const suSessionRes = await makeRequest("/api/auth/session", "POST", {}, {
      email: "admin@certidesk.pro",
      requestedRole: "super_admin",
    });

    assert(suSessionRes.status === 200, "Super Admin session sync returns 200 OK");
    assert(suSessionRes.body?.user?.role === "super_admin", "Super Admin role established");
    assert(!suSessionRes.body?.user?.instituteId, "Super Admin has global scope (no tenant binding)");

    // Check Set-Cookie headers
    const setCookieHeaders = suSessionRes.cookies;
    const hasSessionToken = setCookieHeaders.some((c) => c.includes("cdp_session_token="));
    const hasRoleCookie = setCookieHeaders.some((c) => c.includes("cdp_role=super_admin"));
    assert(hasSessionToken, "Tamper-proof HTTP-only cdp_session_token cookie set");
    assert(hasRoleCookie, "cdp_role cookie set to super_admin");

    // Extract cookies for subsequent requests
    superAdminCookie = setCookieHeaders.map((c) => c.split(";")[0]).join("; ");
  } catch (e) {
    console.error("Test 3 error:", e);
    failed++;
  }

  console.log("\nTEST 4: Authenticated /api/auth/me Identity Verification");
  try {
    const meRes = await makeRequest("/api/auth/me", "GET", {
      Cookie: superAdminCookie,
    });
    assert(meRes.status === 200, "/api/auth/me returns 200 OK with valid session");
    assert(meRes.body?.authenticated === true, "meRes confirms authenticated: true");
    assert(meRes.body?.user?.role === "super_admin", "meRes confirms verified user role: super_admin");
  } catch (e) {
    console.error("Test 4 error:", e);
    failed++;
  }

  console.log("\nTEST 5: Super Admin Access to Protected /su with Valid Cookie");
  try {
    const suPageRes = await makeRequest("/su", "GET", {
      Cookie: superAdminCookie,
    });
    assert(suPageRes.status === 200, "/su is accessible (200 OK) when Super Admin session cookie is presented");
  } catch (e) {
    console.error("Test 5 error:", e);
    failed++;
  }

  console.log("\nTEST 6: Institute Admin Login & Multi-Tenant Isolation");
  let instAdminCookie = "";
  try {
    const instSessionRes = await makeRequest("/api/auth/session", "POST", {}, {
      email: "sbci.institute@gmail.com",
      instituteId: "SBCI1001",
    });

    assert(instSessionRes.status === 200, "Institute Admin session sync returns 200 OK");
    assert(instSessionRes.body?.user?.role === "institute_admin", "Role established as institute_admin");
    assert(instSessionRes.body?.user?.instituteId === "SBCI1001", "Tenant bound strictly to SBCI1001");
    assert(instSessionRes.body?.institute?.id === "SBCI1001", "Affiliated institute SBCI1001 returned");

    instAdminCookie = instSessionRes.cookies.map((c) => c.split(";")[0]).join("; ");

    // Verify Institute Admin is FORBIDDEN from accessing /su
    const instAttemptSu = await makeRequest("/su", "GET", {
      Cookie: instAdminCookie,
    });
    assert(
      instAttemptSu.status === 307 || instAttemptSu.status === 302,
      "Institute Admin is blocked from /su and redirected to /su/login"
    );
  } catch (e) {
    console.error("Test 6 error:", e);
    failed++;
  }

  console.log("\nTEST 7: Super Admin Provisioning of New Institute & Admin User");
  try {
    const testInstCode = `TEST${Date.now().toString().slice(-4)}`;
    const provisionRes = await makeRequest("/api/admin/provision-institute", "POST", {
      Cookie: superAdminCookie,
    }, {
      name: `Test Institute ${testInstCode}`,
      code: testInstCode,
      ownerName: "Test Principal",
      email: `principal.${testInstCode.toLowerCase()}@test.certidesk.pro`,
      password: "TestPassword@123",
      walletBalance: 2500,
    });

    assert(provisionRes.status === 200, "Super Admin institute provisioning returns 200 OK");
    assert(provisionRes.body?.success === true, "Provisioning reports success: true");
    assert(provisionRes.body?.credentials?.password === "TestPassword@123", "Credentials generated and returned");
    assert(provisionRes.body?.institute?.walletBalance === 2500, "Initial wallet balance ₹2500 credited");

    // Test that non-admin CANNOT provision institutes
    const unauthorizedProvisionRes = await makeRequest("/api/admin/provision-institute", "POST", {
      Cookie: instAdminCookie,
    }, {
      name: "Malicious Institute",
      ownerName: "Hacker",
      email: "hacker@test.com",
    });
    assert(
      unauthorizedProvisionRes.status === 403,
      `Non-super-admin provisioning attempt correctly rejected with 403 Forbidden (Actual: ${unauthorizedProvisionRes.status})`
    );
  } catch (e) {
    console.error("Test 7 error:", e);
    failed++;
  }

  console.log("\n=================================================");
  console.log(`  RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error("Fatal test runner error:", e);
  process.exit(1);
});
