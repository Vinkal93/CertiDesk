"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Search, Award, FileText, CheckCircle2 } from "lucide-react";

export default function VerificationPage() {
  const router = useRouter();
  const [certNum, setCertNum] = useState("");
  const [msNum, setMsNum] = useState("");

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">QR Code Verification Center</h2>
        <p className="text-xs text-slate-500">
          Verify any issued certificate or marksheet by number or QR scanner.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Certificate Verification Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Verify Certificate</h3>
              <p className="text-[11px] text-slate-400">e.g. CDP-2026-0267</p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Enter Certificate Number</label>
            <input
              type="text"
              placeholder="CDP-2026-0267"
              value={certNum}
              onChange={(e) => setCertNum(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
            />
          </div>

          <button
            onClick={() => {
              if (certNum.trim()) router.push(`/verify/${certNum.trim()}`);
            }}
            className="w-full py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl font-bold shadow-brand flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Verify Certificate</span>
          </button>
        </div>

        {/* Marksheet Verification Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4 text-xs">
          <div className="flex items-center gap-3 border-b pb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Verify Marksheet</h3>
              <p className="text-[11px] text-slate-400">e.g. MS-2026-0267</p>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Enter Marksheet Number</label>
            <input
              type="text"
              placeholder="MS-2026-0267"
              value={msNum}
              onChange={(e) => setMsNum(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
            />
          </div>

          <button
            onClick={() => {
              if (msNum.trim()) router.push(`/verify-marksheet/${msNum.trim()}`);
            }}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-brand flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Search className="w-4 h-4" />
            <span>Verify Marksheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
