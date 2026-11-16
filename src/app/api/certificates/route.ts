import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/db";
import QRCode from "qrcode";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get("instituteId");
    const status = searchParams.get("status");
    const query = searchParams.get("q");

    let certs = instituteId && instituteId !== "all"
      ? await dataStore.getCertificates(instituteId)
      : await dataStore.getAllCertificates();

    if (status && status !== "all") {
      certs = certs.filter((c) => c.status === status);
    }

    if (query) {
      const q = query.toLowerCase();
      certs = certs.filter(
        (c) =>
          c.certificateNumber.toLowerCase().includes(q) ||
          c.studentName.toLowerCase().includes(q) ||
          c.enrollmentNo.toLowerCase().includes(q) ||
          c.courseName.toLowerCase().includes(q)
      );
    }

    return NextResponse.json({ success: true, count: certs.length, certificates: certs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to fetch certificates" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      instituteId,
      studentId,
      templateId,
      courseName,
      grade = "A+",
      percentage = 85,
      issueDate = new Date().toISOString().split("T")[0],
      completionDate = new Date().toISOString().split("T")[0],
      session = "01 July 2026 – 30 December 2026",
      directorName,
      customCertificateNumber,
      typingSpeed,
      typingAccuracy,
    } = body;

    if (!instituteId || !studentId) {
      return NextResponse.json(
        { success: false, error: "Missing required parameters: instituteId and studentId" },
        { status: 400 }
      );
    }

    const student = await dataStore.getStudentById(studentId);
    if (!student) {
      return NextResponse.json({ success: false, error: "Student record not found" }, { status: 404 });
    }

    const institute = await dataStore.getInstitute(instituteId);
    if (!institute) {
      return NextResponse.json({ success: false, error: "Institute record not found" }, { status: 404 });
    }

    // Generate unique certificate number
    const year = new Date().getFullYear();
    const certNum = customCertificateNumber || `SBCI/ADCA/${year}/${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Generate Verification URL & QR Code Data URL
    const origin = req.headers.get("origin") || req.nextUrl.origin || "https://certidesk.pro";
    const verifyUrl = `${origin}/verify/${certNum}`;
    const qrCodeDataUrl = await QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 });

    const cert = await dataStore.createCertificate({
      instituteId,
      instituteName: institute.name,
      studentId: student.id,
      studentName: student.fullName,
      fatherName: student.fatherName,
      motherName: student.motherName,
      dateOfBirth: student.dob,
      enrollmentNo: student.enrollmentNo,
      courseId: student.courseId,
      courseName: courseName || student.courseName,
      courseDuration: student.courseDuration,
      session,
      grade,
      percentage,
      typingSpeed,
      typingAccuracy,
      issueDate,
      completionDate,
      templateId: templateId || "tpl-sbci-master",
      directorName: directorName || institute.ownerName || "Vinkal Prajapati",
      customCertificateNumber: certNum,
      qrCodeDataUrl,
    });

    return NextResponse.json({
      success: true,
      message: "Certificate generated and securely stored in ledger",
      certificate: cert,
      verificationUrl: verifyUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || "Failed to issue certificate" }, { status: 500 });
  }
}
