"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ShieldCheck 
} from "lucide-react";
import { dataStore } from "@/lib/db";
import { Marksheet } from "@/types";

export default function MarksheetVerificationPage() {
  const params = useParams();
  const msNumber = params.marksheetNumber as string;

  const [marksheet, setMarksheet] = useState<Marksheet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verify() {
      if (!msNumber) return;
      setLoading(true);
      try {
        const found = await dataStore.getMarksheetByNumber(msNumber);
        setMarksheet(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [msNumber]);

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-between p-4 sm:p-6">
      <header className="max-w-2xl mx-auto w-full flex items-center justify-between py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-brand">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-base">CertiDesk</span>
            <span className="text-brand-600 font-extrabold text-base">Pro</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 bg-white border px-3 py-1 rounded-full shadow-xs">
          Public Academic Marksheet Verification
        </span>
      </header>

      <main className="max-w-xl mx-auto w-full my-auto">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Verifying official marksheet record...
            </div>
          ) : !marksheet ? (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Marksheet Not Found</h2>
              <p className="text-xs text-slate-500">
                No marksheet found matching number <strong>{msNumber}</strong>.
              </p>
            </div>
          ) : (
            <div>
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-5 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                    <ShieldCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-100 block">
                      Authentic Record
                    </span>
                    <h3 className="text-base font-extrabold">Marksheet Verified Valid</h3>
                  </div>
                </div>
                <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Marksheet No</span>
                    <span className="font-mono font-bold text-slate-900">{marksheet.marksheetNumber}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Candidate Name</span>
                    <span className="font-bold text-slate-900">{marksheet.studentName}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Course</span>
                    <span className="font-bold text-brand-700">{marksheet.courseName}</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Percentage</span>
                    <span className="font-bold text-slate-900">{marksheet.percentage}%</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center bg-slate-50/50">
                    <span className="text-slate-500 font-medium">Result & Grade</span>
                    <span className="font-black text-emerald-700">{marksheet.result} ({marksheet.grade})</span>
                  </div>
                  <div className="p-3.5 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Issue Date</span>
                    <span className="font-semibold text-slate-700">{marksheet.issueDate}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="text-center py-4 text-xs text-slate-400">
        © 2026 CertiDesk Pro. All rights reserved.
      </footer>
    </div>
  );
}
