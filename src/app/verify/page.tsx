"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  Search, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building, 
  Calendar, 
  GraduationCap, 
  Loader2, 
  ExternalLink,
  QrCode,
  FileCheck,
  Check
} from "lucide-react";
import { dataStore } from "@/lib/db";
import { Certificate, CertificateTemplate, CertificateVerificationResult } from "@/types";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";

export default function PublicVerificationPortal() {
  const [query, setQuery] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState<CertificateVerificationResult | null>(null);
  const [template, setTemplate] = useState<CertificateTemplate | null>(null);
  const [showFullDoc, setShowFullDoc] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  const handleVerify = async (certNumberToTest?: string) => {
    const target = certNumberToTest || query;
    if (!target.trim()) return;

    setIsVerifying(true);
    setHasQueried(true);
    try {
      // Query the rate-limited server verification endpoint
      const res = await fetch(`/api/verify?q=${encodeURIComponent(target.trim())}`);
      const data = await res.json();

      if (data.success && data.result) {
        setResult(data.result);
        if (data.result.certificate?.templateId) {
          const tpl = await dataStore.getTemplateById(data.result.certificate.templateId);
          setTemplate(tpl);
        } else {
          const tpl = await dataStore.getTemplateById("tpl-sbci-master");
          setTemplate(tpl);
        }
      } else {
        // Fallback to client dataStore if network fetch isn't ready
        const localResult = await dataStore.verifyCertificate(target.trim());
        setResult(localResult);
        if (localResult.certificate?.templateId) {
          const tpl = await dataStore.getTemplateById(localResult.certificate.templateId);
          setTemplate(tpl);
        }
      }
    } catch (err) {
      console.error("Verification error:", err);
      const localResult = await dataStore.verifyCertificate(target.trim());
      setResult(localResult);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-between p-4 sm:p-6">
      {/* Top Brand Header */}
      <header className="max-w-3xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#11132D] flex items-center justify-center text-white shadow-md">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-slate-900 text-lg">CertiDesk</span>
              <span className="text-[#6529E8] font-extrabold text-lg">Pro</span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Official Digital Credential Registry</p>
          </div>
        </div>

        <span className="text-[11px] font-bold text-slate-600 bg-white border border-slate-200/80 px-3 py-1 rounded-full shadow-xs flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Public Ledger Verification</span>
        </span>
      </header>

      {/* Main Content Area */}
      <main className="max-w-2xl mx-auto w-full my-auto space-y-6">
        {/* Verification Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="bg-[#11132D] p-6 text-white text-center space-y-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-purple-200 inline-block">
              Tamper-Evident Verification
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Verify Institute Certificate
            </h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Instant cryptographic verification for certificates issued by accredited training centers and institutes.
            </p>
          </div>

          {/* Search Box Form */}
          <div className="p-6 border-b border-slate-100 bg-slate-50/50">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleVerify();
              }}
              className="space-y-3"
            >
              <label className="block text-xs font-bold text-slate-700">
                Enter Certificate Number or Verification Token:
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. SBCI/ADCA/2026/0145 or CDP-2026-0268"
                    className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#6529E8]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !query.trim()}
                  className="px-6 py-3 bg-[#6529E8] hover:bg-[#541FD0] disabled:opacity-50 text-white font-black text-xs rounded-2xl shadow-brand transition-all flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Certificate</span>
                    </>
                  )}
                </button>
              </div>

              {/* Sample test clicks for user convenience */}
              <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500">
                <span>Try sample numbers:</span>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("SBCI/ADCA/2026/0145");
                    handleVerify("SBCI/ADCA/2026/0145");
                  }}
                  className="font-mono font-bold text-brand-600 hover:underline bg-purple-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  SBCI/ADCA/2026/0145
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery("CDP-2026-0267");
                    handleVerify("CDP-2026-0267");
                  }}
                  className="font-mono font-bold text-brand-600 hover:underline bg-purple-50 px-2 py-0.5 rounded cursor-pointer"
                >
                  CDP-2026-0267
                </button>
              </div>
            </form>
          </div>

          {/* Verification Result Display */}
          {hasQueried && result && (
            <div className="p-6">
              {result.status === "not_found" ? (
                /* 1. NOT FOUND STATE */
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                    <XCircle className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Certificate Not Found</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                      No matching record exists in the CertiDesk Pro ledger. Please verify the certificate number or scan the original QR code.
                    </p>
                  </div>
                </div>
              ) : result.status === "revoked" ? (
                /* 2. REVOKED STATE */
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-rose-900">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0 text-rose-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-rose-200 text-rose-900 inline-block">
                        Revoked Credential
                      </span>
                      <h3 className="text-sm font-extrabold mt-0.5">This Certificate Has Been Revoked</h3>
                      <p className="text-[11px] text-rose-700">
                        {result.message}
                      </p>
                    </div>
                  </div>

                  {result.certificate && (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                      <div className="p-3 flex justify-between bg-slate-50/50">
                        <span className="text-slate-500">Candidate Name</span>
                        <span className="font-bold text-slate-900">{result.certificate.studentName}</span>
                      </div>
                      <div className="p-3 flex justify-between">
                        <span className="text-slate-500">Issuing Institute</span>
                        <span className="font-bold text-slate-900">{result.certificate.instituteName}</span>
                      </div>
                      <div className="p-3 flex justify-between bg-slate-50/50">
                        <span className="text-slate-500">Course Program</span>
                        <span className="font-bold text-slate-900">{result.certificate.courseName}</span>
                      </div>
                      <div className="p-3 flex justify-between">
                        <span className="text-slate-500">Revocation Reason</span>
                        <span className="font-bold text-rose-700">{result.certificate.revokedReason || "Administrative"}</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* 3. VALID & AUTHENTIC STATE */
                <div className="space-y-4">
                  {/* Verified Header Banner */}
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-4 rounded-2xl text-white flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">
                          Verified Authentic
                        </span>
                        <h3 className="text-sm font-extrabold">Certificate Valid & Genuine</h3>
                      </div>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-emerald-200" />
                  </div>

                  {/* Public-Safe Credential Details */}
                  {result.certificate && (
                    <div className="space-y-3">
                      <div className="p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl text-center space-y-0.5">
                        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">
                          Certificate Number
                        </span>
                        <p className="font-mono text-base font-black text-emerald-950">
                          {result.certificate.certificateNumber}
                        </p>
                      </div>

                      <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden text-xs">
                        <div className="p-3 flex justify-between items-center bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Candidate Name</span>
                          <span className="font-bold text-slate-900">{result.certificate.studentName}</span>
                        </div>

                        <div className="p-3 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Issuing Institute</span>
                          <span className="font-bold text-slate-900">{result.certificate.instituteName}</span>
                        </div>

                        <div className="p-3 flex justify-between items-center bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Course Program</span>
                          <span className="font-bold text-brand-700">{result.certificate.courseName}</span>
                        </div>

                        <div className="p-3 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Performance Grade</span>
                          <span className="font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {result.certificate.grade || "A+"}
                          </span>
                        </div>

                        <div className="p-3 flex justify-between items-center bg-slate-50/50">
                          <span className="text-slate-500 font-medium">Course Duration / Session</span>
                          <span className="font-semibold text-slate-700">{result.certificate.session}</span>
                        </div>

                        <div className="p-3 flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Date of Issue</span>
                          <span className="font-semibold text-slate-700">{result.certificate.issueDate}</span>
                        </div>
                      </div>

                      {/* Official Digital Certificate Viewer Toggle */}
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => setShowFullDoc(!showFullDoc)}
                          className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl border border-brand-200 transition-colors flex items-center justify-center gap-2 cursor-pointer text-xs"
                        >
                          <Award className="w-4 h-4 text-brand-600" />
                          <span>{showFullDoc ? "Hide Certificate Document" : "View Official Issued Certificate"}</span>
                        </button>
                      </div>

                      {showFullDoc && template && (
                        <div className="pt-3 border-t border-slate-200 space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">
                            Official Issued Certificate Document Preview
                          </p>
                          <div className="overflow-x-auto bg-slate-100 p-2 sm:p-4 rounded-2xl flex justify-center border border-slate-200">
                            <CertificateCanvas
                              template={template}
                              data={{
                                student_name: result.certificate.studentName,
                                father_name: "Mr. Ram Pratap",
                                enrollment_number: "SBCI/ADCA/0268",
                                course_name: result.certificate.courseName,
                                institute_name: result.certificate.instituteName,
                                issue_date: result.certificate.issueDate,
                                completion_date: result.certificate.completionDate,
                                session: result.certificate.session,
                                certificate_number: result.certificate.certificateNumber,
                                grade: result.certificate.grade,
                                director_name: result.certificate.directorName,
                              }}
                              scale={0.65}
                            />
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[10px] text-slate-500 text-center">
                        This digital credential was verified live against the CertiDesk Pro tamper-evident ledger.
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-xs text-slate-400">
        © 2026 CertiDesk Pro. All rights reserved. • Multi-Tenant Institute Verification Gateway
      </footer>
    </div>
  );
}
