"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  Search, 
  Eye, 
  Printer, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Copy,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Filter,
  Check,
  FileCheck,
  Download,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Certificate, CertificateTemplate } from "@/types";
import { ConfirmModal, AlertModal } from "@/components/ui/FeedbackModal";
import { CertificateCanvas } from "@/components/certificate/CertificateCanvas";

export default function CertificateHistoryPage() {
  const { institute } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "valid" | "revoked">("all");
  
  // Modals state
  const [certToRevoke, setCertToRevoke] = useState<Certificate | null>(null);
  const [revokeReason, setRevokeReason] = useState("Administrative cancellation");
  const [certToReissue, setCertToReissue] = useState<Certificate | null>(null);
  const [reissueReason, setReissueReason] = useState("Corrected candidate details");
  const [previewCert, setPreviewCert] = useState<Certificate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CertificateTemplate | null>(null);
  const [copiedCertNo, setCopiedCertNo] = useState<string | null>(null);

  const loadCertificates = async () => {
    if (!institute) return;
    const list = await dataStore.getCertificates(institute.id);
    setCertificates(list);
  };

  useEffect(() => {
    loadCertificates();
  }, [institute]);

  const handleRevokeConfirm = async () => {
    if (!certToRevoke) return;
    await dataStore.revokeCertificate(certToRevoke.certificateNumber, revokeReason, "Super Admin / Institute Authority");
    setCertToRevoke(null);
    setRevokeReason("Administrative cancellation");
    await loadCertificates();
  };

  const handleReissueConfirm = async () => {
    if (!certToReissue) return;
    await dataStore.reissueCertificate(
      certToReissue.certificateNumber,
      {},
      reissueReason,
      "Super Admin / Institute Authority"
    );
    setCertToReissue(null);
    setReissueReason("Corrected candidate details");
    await loadCertificates();
  };

  const handleCopyLink = (certNum: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://certidesk.pro";
    const url = `${origin}/verify/${certNum}`;
    navigator.clipboard.writeText(url);
    setCopiedCertNo(certNum);
    setTimeout(() => setCopiedCertNo(null), 2000);
  };

  const handleOpenPreview = async (cert: Certificate) => {
    setPreviewCert(cert);
    const tpl = await dataStore.getTemplateById(cert.templateId || "tpl-sbci-master");
    setPreviewTemplate(tpl);
  };

  // Metrics
  const totalCount = certificates.length;
  const validCount = certificates.filter((c) => c.status === "valid").length;
  const revokedCount = certificates.filter((c) => c.status === "revoked").length;

  const filtered = certificates.filter((c) => {
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesSearch =
      c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Certificate Ledger & History</h2>
          <p className="text-xs text-slate-500">
            Immutable log of all generated certificates, cryptographic verification statuses, revocations and reissuances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/certificates/templates"
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            Template Builder
          </Link>
          <Link
            href="/certificates/generate"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>Generate Certificate</span>
          </Link>
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Certificates</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Valid Active Credentials</span>
            <p className="text-2xl font-black text-emerald-600 mt-1">{validCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Revoked Credentials</span>
            <p className="text-2xl font-black text-rose-600 mt-1">{revokedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search certificate number, student name, course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "all" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            All ({totalCount})
          </button>
          <button
            onClick={() => setStatusFilter("valid")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "valid" ? "bg-white text-emerald-700 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Valid ({validCount})
          </button>
          <button
            onClick={() => setStatusFilter("revoked")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              statusFilter === "revoked" ? "bg-white text-rose-700 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            Revoked ({revokedCount})
          </button>
        </div>
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Certificate No</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Enrollment No</th>
              <th className="p-3.5">Course Program</th>
              <th className="p-3.5">Grade</th>
              <th className="p-3.5">Issue Date</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No certificate records found matching query.
                </td>
              </tr>
            ) : (
              filtered.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-brand-600">
                    {cert.certificateNumber}
                    {cert.reissuedToCertificateNumber && (
                      <span className="block text-[9px] text-rose-500 font-sans">
                        Reissued as {cert.reissuedToCertificateNumber}
                      </span>
                    )}
                    {cert.reissuedFromCertificateNumber && (
                      <span className="block text-[9px] text-purple-600 font-sans">
                        Reissued from {cert.reissuedFromCertificateNumber}
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900">{cert.studentName}</td>
                  <td className="p-3.5 font-mono text-slate-600">{cert.enrollmentNo}</td>
                  <td className="p-3.5 text-slate-700">{cert.courseName}</td>
                  <td className="p-3.5 font-bold text-slate-900">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-[11px]">{cert.grade}</span>
                  </td>
                  <td className="p-3.5 text-slate-500">{cert.issueDate}</td>
                  <td className="p-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cert.status === "valid"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {cert.status === "valid" ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span>Valid</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 text-rose-500" />
                          <span>Revoked</span>
                        </>
                      )}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Live Preview Modal */}
                      <button
                        onClick={() => handleOpenPreview(cert)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg cursor-pointer"
                        title="Live Certificate Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Copy Public Link */}
                      <button
                        onClick={() => handleCopyLink(cert.certificateNumber)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                        title="Copy Public QR Verification Link"
                      >
                        {copiedCertNo === cert.certificateNumber ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      {/* Open Verification in new tab */}
                      <Link
                        href={`/verify/${cert.certificateNumber}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg cursor-pointer"
                        title="Test Public QR Verification"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Reissue button */}
                      {cert.status === "valid" && (
                        <button
                          onClick={() => setCertToReissue(cert)}
                          className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-brand-700 rounded-lg text-[10px] font-bold cursor-pointer"
                          title="Reissue certificate with updated particulars"
                        >
                          Reissue
                        </button>
                      )}

                      {/* Revoke button */}
                      {cert.status === "valid" && (
                        <button
                          onClick={() => setCertToRevoke(cert)}
                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[10px] font-bold cursor-pointer"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REVOKE CERTIFICATE MODAL */}
      {certToRevoke && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Revoke Credential</h3>
                <p className="text-xs text-slate-500">Certificate {certToRevoke.certificateNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to revoke the certificate for <strong>{certToRevoke.studentName}</strong>?
              Once revoked, any employer or student scanning the QR code will instantly see the revoked status.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reason for Revocation (Permanent Record):</label>
              <textarea
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. Administrative cancellation, candidate request..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCertToRevoke(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleRevokeConfirm}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Confirm Revocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REISSUE CERTIFICATE MODAL */}
      {certToReissue && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3 text-purple-600">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                <RefreshCw className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Reissue Certificate</h3>
                <p className="text-xs text-slate-500">Origin: {certToReissue.certificateNumber}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Reissuing will create a new officially numbered certificate for <strong>{certToReissue.studentName}</strong>,
              while marking the previous certificate as superseded/reissued in the immutable audit ledger.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Reissuance Note / Reason:</label>
              <textarea
                value={reissueReason}
                onChange={(e) => setReissueReason(e.target.value)}
                rows={2}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                placeholder="e.g. Correction of student name spelling, updated grade..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setCertToReissue(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReissueConfirm}
                className="px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-black rounded-xl cursor-pointer"
              >
                Generate Reissued Certificate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIVE CERTIFICATE PREVIEW MODAL */}
      {previewCert && previewTemplate && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Certificate Document: {previewCert.certificateNumber}
                </h3>
                <p className="text-xs text-slate-500">
                  {previewCert.studentName} • {previewCert.courseName}
                </p>
              </div>
              <button
                onClick={() => setPreviewCert(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 p-4 rounded-2xl flex justify-center overflow-x-auto">
              <CertificateCanvas
                template={previewTemplate}
                data={{
                  student_name: previewCert.studentName,
                  father_name: previewCert.fatherName,
                  enrollment_number: previewCert.enrollmentNo,
                  course_name: previewCert.courseName,
                  institute_name: previewCert.instituteName,
                  issue_date: previewCert.issueDate,
                  completion_date: previewCert.completionDate,
                  session: previewCert.session || "01 July 2026 – 30 December 2026",
                  certificate_number: previewCert.certificateNumber,
                  grade: previewCert.grade,
                  director_name: previewCert.directorName || "Vinkal Prajapati",
                  qr_code: previewCert.qrCodeDataUrl,
                }}
                scale={0.75}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPreviewCert(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
