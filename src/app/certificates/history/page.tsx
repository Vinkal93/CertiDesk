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
  ExternalLink 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Certificate } from "@/types";
import { ConfirmModal } from "@/components/ui/FeedbackModal";

export default function CertificateHistoryPage() {
  const { institute } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [certToRevoke, setCertToRevoke] = useState<Certificate | null>(null);

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
    await dataStore.revokeCertificate(certToRevoke.certificateNumber);
    setCertToRevoke(null);
    await loadCertificates();
  };

  const filtered = certificates.filter(
    (c) =>
      c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Certificate History</h2>
          <p className="text-xs text-slate-500">
            Immutable log of all generated certificates, verification statuses and revocations.
          </p>
        </div>

        <Link
          href="/certificates/generate"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
        >
          <Award className="w-4 h-4" />
          <span>Generate New Certificate</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search by certificate number, student name, enrollment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Certificates Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Certificate No</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Enrollment No</th>
              <th className="p-3.5">Course</th>
              <th className="p-3.5">Issue Date</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No certificates found.
                </td>
              </tr>
            ) : (
              filtered.map((cert) => (
                <tr key={cert.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-brand-600">{cert.certificateNumber}</td>
                  <td className="p-3.5 font-bold text-slate-900">{cert.studentName}</td>
                  <td className="p-3.5 font-mono text-slate-600">{cert.enrollmentNo}</td>
                  <td className="p-3.5 text-slate-700">{cert.courseName}</td>
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
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        href={`/verify/${cert.certificateNumber}`}
                        target="_blank"
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                        title="Open Public Verification Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {cert.status === "valid" && (
                        <button
                          onClick={() => setCertToRevoke(cert)}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold cursor-pointer"
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

      {certToRevoke && (
        <ConfirmModal
          isOpen={Boolean(certToRevoke)}
          title="Revoke Certificate"
          message={`Are you sure you want to REVOKE certificate ${certToRevoke.certificateNumber} for ${certToRevoke.studentName}? This will permanently invalidate the certificate and any QR verification scanned by employers or students.`}
          confirmText="Yes, Revoke Certificate"
          variant="danger"
          onConfirm={handleRevokeConfirm}
          onClose={() => setCertToRevoke(null)}
        />
      )}
    </div>
  );
}
