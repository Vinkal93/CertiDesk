import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateNumber: string }> }
) {
  try {
    const { certificateNumber } = await params;
    const cert = await dataStore.getCertificateByNumber(certificateNumber);
    if (!cert) {
      return NextResponse.json({ success: false, error: "Certificate not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, certificate: cert });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ certificateNumber: string }> }
) {
  try {
    const { certificateNumber } = await params;
    const body = await req.json();
    const { action, reason, revokedBy } = body;

    if (action === "revoke") {
      const success = await dataStore.revokeCertificate(
        certificateNumber,
        reason || "Administrative revocation",
        revokedBy || "Authorized Authority"
      );
      if (!success) {
        return NextResponse.json({ success: false, error: "Certificate not found to revoke" }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        message: `Certificate ${certificateNumber} has been revoked successfully`,
      });
    }

    return NextResponse.json({ success: false, error: "Unsupported action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
