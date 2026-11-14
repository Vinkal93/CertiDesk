"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Award, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  RefreshCw, 
  FileCheck, 
  User, 
  QrCode, 
  Loader2, 
  AlertCircle 
} from "lucide-react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Student, CertificateTemplate, Course } from "@/types";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";

function GenerateCertificateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const { institute } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  // Selection state
  const [selectedStudentId, setSelectedStudentId] = useState<string>(preselectedStudentId || "");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [certType, setCertType] = useState<string>("ADCA");
  const [grade, setGrade] = useState("A+");
  const [percentage, setPercentage] = useState<number>(88.5);
  const [typingSpeed, setTypingSpeed] = useState<number>(48);
  const [typingAccuracy, setTypingAccuracy] = useState<number>(98);
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split("T")[0]);
  const [completionDate, setCompletionDate] = useState(new Date().toISOString().split("T")[0]);

  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [tempCertNumber, setTempCertNumber] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successCertNumber, setSuccessCertNumber] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      if (!institute) return;
      const { students: stList } = await dataStore.getStudents(institute.id);
      const tplList = await dataStore.getTemplates();
      const crsList = await dataStore.getCourses(institute.id);

      setStudents(stList);
      setTemplates(tplList);
      setCourses(crsList);

      if (tplList.length > 0) setSelectedTemplateId(tplList[0].id);

      if (preselectedStudentId) {
        setSelectedStudentId(preselectedStudentId);
      } else if (stList.length > 0) {
        setSelectedStudentId(stList[0].id);
      }
    }
    load();
  }, [institute, preselectedStudentId]);

  const currentStudent = students.find((s) => s.id === selectedStudentId);
  const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || templates[0];

  // Generate QR code and temporary certificate number
  useEffect(() => {
    const certNum = `CDP-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setTempCertNumber(certNum);

    const origin = typeof window !== "undefined" ? window.location.origin : "https://certidesk.pro";
    const verifyUrl = `${origin}/verify/${certNum}`;

    QRCode.toDataURL(verifyUrl, { width: 140, margin: 1 })
      .then((url) => setQrCodeDataUrl(url))
      .catch(console.error);
  }, [selectedStudentId, selectedTemplateId]);

  const handleGenerateAndDownload = async () => {
    if (!currentStudent || !institute || !currentTemplate) return;
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Save certificate in real store
      const cert = await dataStore.createCertificate({
        instituteId: institute.id,
        instituteName: institute.name,
        studentId: currentStudent.id,
        studentName: currentStudent.fullName,
        fatherName: currentStudent.fatherName,
        motherName: currentStudent.motherName,
        enrollmentNo: currentStudent.enrollmentNo,
        courseId: currentStudent.courseId,
        courseName: currentStudent.courseName,
        courseDuration: currentStudent.courseDuration,
        grade,
        percentage,
        typingSpeed: certType.includes("Typing") ? typingSpeed : undefined,
        typingAccuracy: certType.includes("Typing") ? typingAccuracy : undefined,
        issueDate,
        completionDate,
        templateId: currentTemplate.id,
        qrCodeDataUrl,
      });

      setSuccessCertNumber(cert.certificateNumber);

      // 2. Render high-res canvas and export to A4 PDF
      if (canvasRef.current) {
        const canvas = await html2canvas(canvasRef.current, {
          scale: 2, // 2x high resolution
          useCORS: true,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const isLandscape = currentTemplate.orientation === "landscape";
        const pdf = new jsPDF({
          orientation: isLandscape ? "landscape" : "portrait",
          unit: "pt",
          format: "a4",
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${cert.certificateNumber}_${currentStudent.fullName.replace(/\s+/g, "_")}.pdf`);
      }
    } catch (err: any) {
      setError(err.message || "Failed to generate certificate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const certificateData = {
    student_name: currentStudent?.fullName || "Student Name",
    father_name: currentStudent?.fatherName || "Father Name",
    mother_name: currentStudent?.motherName || "Mother Name",
    enrollment_number: currentStudent?.enrollmentNo || "SBCI/ADCA/0268",
    course_name: currentStudent?.courseName || "Advanced Diploma in Computer Application",
    course_duration: currentStudent?.courseDuration || "12 Months",
    institute_name: institute?.name || "SBCI Computer Institute",
    issue_date: issueDate,
    completion_date: completionDate,
    certificate_number: successCertNumber || tempCertNumber,
    grade,
    percentage,
    typing_speed: typingSpeed,
    typing_accuracy: typingAccuracy,
    qr_code: qrCodeDataUrl,
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Generate Certificate</h2>
          <p className="text-xs text-slate-500">
            Select candidate, customize performance attributes, preview, and generate print-ready PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/certificates/templates"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Template Builder
          </Link>
          <Link
            href="/certificates/history"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Certificate History
          </Link>
        </div>
      </div>

      {successCertNumber && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold">
                Certificate {successCertNumber} Generated & Downloaded Successfully!
              </p>
              <p className="text-[11px] text-emerald-600">
                The record has been permanently saved with public QR verification.
              </p>
            </div>
          </div>
          <Link
            href={`/verify/${successCertNumber}`}
            target="_blank"
            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700"
          >
            Test Public QR Link
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Left Controls (4 cols), Right Live Canvas (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Controls */}
        <div className="lg:col-span-4 space-y-5">
          {/* 1. Student Selection */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-3 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold uppercase tracking-wider text-slate-700">1. Select Candidate</span>
              <span className="font-mono text-brand-600 font-bold">{currentStudent?.enrollmentNo}</span>
            </div>

            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
            >
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.fullName} ({st.courseCode} - {st.enrollmentNo})
                </option>
              ))}
            </select>

            {currentStudent && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 text-[11px]">
                <p><strong>Candidate:</strong> {currentStudent.fullName}</p>
                <p><strong>Father:</strong> {currentStudent.fatherName}</p>
                <p><strong>Course:</strong> {currentStudent.courseName}</p>
                <p><strong>Session:</strong> {currentStudent.session}</p>
              </div>
            )}
          </div>

          {/* 2. Certificate Type & Template */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700 block border-b pb-2">
              2. Certificate Type & Template
            </span>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Select Certificate Category</label>
              <select
                value={certType}
                onChange={(e) => {
                  setCertType(e.target.value);
                  const matching = templates.find((t) => t.category.toLowerCase().includes(e.target.value.toLowerCase()));
                  if (matching) setSelectedTemplateId(matching.id);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="ADCA">ADCA Certificate</option>
                <option value="Typing">Typing Proficiency Certificate</option>
                <option value="DCA">DCA Certificate</option>
                <option value="CCC">CCC Certificate</option>
                <option value="Custom">Custom Certificate</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-600 block mb-1">Certificate Template</label>
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title} ({tpl.orientation})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Performance & Issue Particulars */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card space-y-3 text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700 block border-b pb-2">
              3. Performance & Issue Details
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Grade</label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="A+">A+ (Outstanding)</option>
                  <option value="A">A (Excellent)</option>
                  <option value="B">B (Good)</option>
                  <option value="C">C (Satisfactory)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-600 block mb-1">Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={percentage}
                  onChange={(e) => setPercentage(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                />
              </div>
            </div>

            {certType.includes("Typing") && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-purple-50/60 rounded-xl border border-purple-100">
                <div>
                  <label className="font-semibold text-purple-900 block mb-1">Speed (WPM)</label>
                  <input
                    type="number"
                    value={typingSpeed}
                    onChange={(e) => setTypingSpeed(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-brand-700"
                  />
                </div>
                <div>
                  <label className="font-semibold text-purple-900 block mb-1">Accuracy (%)</label>
                  <input
                    type="number"
                    value={typingAccuracy}
                    onChange={(e) => setTypingAccuracy(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-purple-200 rounded-xl font-bold text-brand-700"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-600 block mb-1">Completion Date</label>
                <input
                  type="date"
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium"
                />
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleGenerateAndDownload}
            disabled={isGenerating || !currentStudent}
            className="w-full py-3.5 bg-[#6529E8] hover:bg-[#541FD0] disabled:opacity-50 text-white font-black text-sm rounded-2xl shadow-brand flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Generating High-Res PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate & Download Certificate PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Right Live Visual Certificate Preview */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-brand-600" />
              <span className="font-bold text-slate-900">Live Certificate Preview</span>
              <span className="text-slate-400 font-mono text-[11px]">(A4 Landscape)</span>
            </div>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Preview</span>
            </button>
          </div>

          {/* The Live Render Canvas Component */}
          {currentTemplate && (
            <div className="bg-slate-900/5 p-4 rounded-2xl border border-slate-200 flex items-center justify-center overflow-x-auto">
              <CertificateCanvas
                ref={canvasRef}
                template={currentTemplate}
                data={certificateData}
                scale={1}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GenerateCertificatePage() {
  return (
    <React.Suspense fallback={<div className="p-12 text-center text-xs text-slate-500">Loading Certificate Studio...</div>}>
      <GenerateCertificateContent />
    </React.Suspense>
  );
}
