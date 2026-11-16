// Session Token utilities using Web Crypto API (supported in Node.js and Next.js Edge Middleware)

export interface SessionPayload {
  uid: string;
  email: string;
  role: "super_admin" | "institute_admin" | "student";
  instituteId?: string;
  studentId?: string;
  displayName?: string;
  exp?: number;
  iat?: number;
}

const DEFAULT_SECRET = "certidesk-pro-master-jwt-security-secret-key-93821734";
const SECRET_KEY = process.env.SESSION_SECRET || DEFAULT_SECRET;

function base64UrlEncode(str: string): string {
  const base64 = typeof Buffer !== "undefined"
    ? Buffer.from(str).toString("base64")
    : btoa(str);
  return base64.replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return typeof Buffer !== "undefined"
    ? Buffer.from(base64, "base64").toString("utf-8")
    : atob(base64);
}

function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(buffer).toString("base64url");
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function base64UrlToArrayBuffer(base64url: string): ArrayBuffer {
  if (typeof Buffer !== "undefined") {
    const buf = Buffer.from(base64url, "base64url");
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
  }
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function getCryptoKey(): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET_KEY),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Signs a payload into a secure HMAC-SHA256 JWT
 * @param payload Session data
 * @param expiresInSeconds Defaults to 7 days (604800s)
 */
export async function signSessionToken(
  payload: Omit<SessionPayload, "exp" | "iat">,
  expiresInSeconds: number = 60 * 60 * 24 * 7
): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const dataToSign = `${encodedHeader}.${encodedPayload}`;

  const key = await getCryptoKey();
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(dataToSign));
  const encodedSignature = arrayBufferToBase64Url(signatureBuffer);

  return `${dataToSign}.${encodedSignature}`;
}

/**
 * Verifies a JWT and returns the verified payload, or null if invalid or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, encodedSignature] = parts;

  try {
    const key = await getCryptoKey();
    const enc = new TextEncoder();
    const dataToVerify = `${encodedHeader}.${encodedPayload}`;
    const signatureBuffer = base64UrlToArrayBuffer(encodedSignature);

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBuffer,
      enc.encode(dataToVerify)
    );

    if (!isValid) return null;

    const payloadJson = base64UrlDecode(encodedPayload);
    const payload: SessionPayload = JSON.parse(payloadJson);

    // Check expiration
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch (err) {
    return null;
  }
}
