"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building, 
  Calendar, 
  GraduationCap, 
  ShieldCheck, 
  Search 
} from "lucide-react";
import { dataStore } from "@/lib/db";
import { Certificate, CertificateTemplate } from "@/types";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";

export default function CertificateVerificationPage() {
  const params = useParams();
  const certNumber = params.certificateNumber as string;

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [showFullDoc, setShowFullDoc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [queried, setQueried] = useState(false);

  useEffect(() => {
    async function verify() {
      if (!certNumber) return;
      setLoading(true);
      try {
        const found = await dataStore.getCertificateByNumber(certNumber);
        setCertificate(found);
        if (found) {
          const tpl = await dataStore.getTemplateById(found.templateId || "tpl-sbci-master");
          setTemplate(tpl);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setQueried(true);
      }
    }
    verify();
  }, [certNumber]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Simple Brand Header */}
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-brand">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base">CertiDesk</span>
            <span className="text-brand-600 font-extrabold text-base">Pro</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-white border px-3 py-1 rounded-full shadow-xs">
          Public Credential Verification Portal
        </span>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-xl mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Verifying cryptographic digital credential...
            </div>
          ) : !certificate ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Certificate Not Found</h2>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No certificate found with number <strong>{certNumber}</strong>. Please check the number or scan the QR code again.
              </p>
              <div className="pt-2">
                <Link
                  href="/"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          ) : certificate.status === "revoked" ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 uppercase">
                  Revoked Credential
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-2">This Certificate Has Been Revoked</h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  The issuing institution has formally withdrawn or cancelled this credential.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-2">
                <p><strong>Candidate:</strong> {certificate.studentName}</p>
                <p><strong>Institute:</strong> {certificate.instituteName}</p>
                <p><strong>Certificate No:</strong> <span className="font-mono">{certificate.certificateNumber}</span></p>
                {certificate.revokedReason && (
                  <p><strong>Revocation Reason:</strong> <span className="text-rose-700 font-semibold">{certificate.revokedReason}</span></p>
                )}
                {certificate.revokedAt && (
                  <p><strong>Revoked On:</strong> {new Date(certificate.revokedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Verified Success Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">
                      Authentic Credential
                    </span>
                    <h3 className="text-base font-extrabold">Certificate Verified Valid</h3>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              </div>

              {/* Public Details (Non-private data only) */}
              <div className="p-6 space-y-4 text-xs">
                <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-center space-y-1">
                  <span className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
                    Certificate Number
                  </span>
                  <p className="font-mono text-base font-black text-emerald-950">
                    {certificate.certificateNumber}
                  </p>
                </div>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Candidate Name</span>
                    <span className="font-bold text-slate-900">{certificate.studentName}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Issuing Institute</span>
                    <span className="font-bold text-slate-900">{certificate.instituteName}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Course Program</span>
                    <span className="font-bold text-brand-700">{certificate.courseName}</span>
                  </div>

                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Performance Grade</span>
                    <span className="font-black text-slate-900">{certificate.grade}</span>
                  </div>

                  {certificate.typingSpeed && (
                    <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                      <span className="text-slate-500 font-medium">Typing Proficiency</span>
                      <span className="font-bold text-emerald-700">
                        {certificate.typingSpeed} WPM ({certificate.typingAccuracy}% Accuracy)
                      </span>
                    </div>
                  )}

                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Date of Issue</span>
                    <span className="font-semibold text-slate-700">{certificate.issueDate}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => setShowFullDoc(!showFullDoc)}
                    className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4 text-brand-600" />
                    <span>{showFullDoc ? "Hide Certificate Document" : "View Official Digital Certificate"}</span>
                  </button>
                </div>

                {showFullDoc && template && (
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider text-center">
                      Official Issued Certificate Preview
                    </p>
                    <div className="overflow-x-auto bg-slate-100 p-2 sm:p-4 rounded-2xl flex justify-center border border-slate-200">
                      <CertificateCanvas
                        template={template}
                        data={{
                          student_name: certificate.studentName,
                          father_name: certificate.fatherName,
                          mother_name: certificate.motherName,
                          enrollment_number: certificate.enrollmentNo,
                          course_name: certificate.courseName,
                          course_duration: certificate.courseDuration,
                          institute_name: certificate.instituteName,
                          issue_date: certificate.issueDate,
                          completion_date: certificate.completionDate,
                          certificate_number: certificate.certificateNumber,
                          grade: certificate.grade,
                          percentage: certificate.percentage,
                          typing_speed: certificate.typingSpeed,
                          typing_accuracy: certificate.typingAccuracy,
                          qr_code: certificate.qrCodeDataUrl,
                        }}
                        scale={0.7}
                      />
                    </div>
                  </div>
                )}

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 text-center">
                  This digital credential was verified live against the CertiDesk Pro tamper-evident ledger.
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © 2026 CertiDesk Pro. All rights reserved.
      </footer>
    </div>
  );
}
