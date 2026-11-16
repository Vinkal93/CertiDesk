import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

// In-Memory Rate Limiting: max 30 verification queries per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }

  if (entry.count >= 40) {
    return false;
  }

  entry.count += 1;
  return true;
}

export async function GET(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous-client";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification requests. Rate limit exceeded. Please wait a minute.",
        },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || searchParams.get("certNo") || searchParams.get("token") || "";

    const result = await dataStore.verifyCertificate(query);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Verification failed" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous-client";
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many verification requests. Rate limit exceeded. Please wait a minute.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const query = body.query || body.certificateNumber || body.token || "";

    const result = await dataStore.verifyCertificate(query);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Verification failed" }, { status: 500 });
  }
}
