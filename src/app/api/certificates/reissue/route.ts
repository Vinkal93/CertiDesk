import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { oldCertificateNumber, updates = {}, reason, reissuedBy } = body;

    if (!oldCertificateNumber || !reason) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: oldCertificateNumber and reason" },
        { status: 400 }
      );
    }

    const reissued = await dataStore.reissueCertificate(
      oldCertificateNumber,
      updates,
      reason,
      reissuedBy || "Super Admin"
    );

    return NextResponse.json({
      success: true,
      message: `Certificate ${oldCertificateNumber} was revoked and reissued as ${reissued.certificateNumber}`,
      certificate: reissued,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to reissue certificate" }, { status: 500 });
  }
}
