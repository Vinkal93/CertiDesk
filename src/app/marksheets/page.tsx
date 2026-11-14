"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { 
  FileText, 
  Printer, 
  Download, 
  Search, 
  Eye, 
  CheckCircle2, 
  X, 
  Building, 
  Award, 
  QrCode 
} from "lucide-react";
import QRCode from "qrcode";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Marksheet } from "@/types";

export default function MarksheetsPage() {
  const { institute } = useAuth();
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [selectedMarksheet, setSelectedMarksheet] = useState<Marksheet | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const printRef = useRef<HTMLDivElement>(null);

  const loadMarksheets = async () => {
    if (!institute) return;
    const list = await dataStore.getMarksheets(institute.id);
    setMarksheets(list);
  };

  useEffect(() => {
    loadMarksheets();
  }, [institute]);

  useEffect(() => {
    if (selectedMarksheet) {
      const verifyUrl = `${window.location.origin}/verify-marksheet/${selectedMarksheet.marksheetNumber}`;
      QRCode.toDataURL(verifyUrl, { width: 120, margin: 1 })
        .then((url) => setQrDataUrl(url))
        .catch(console.error);
    }
  }, [selectedMarksheet]);

  const handlePrint = () => {
    window.print();
  };

  const filtered = marksheets.filter(
    (m) =>
      m.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.marksheetNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Official Marksheets</h2>
          <p className="text-xs text-slate-500">
            High-grade academic transcripts with QR verification and grade breakdown.
          </p>
        </div>

        <Link
          href="/examinations"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Enter Marks & Generate</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Search marksheets by student name, number, or enrollment..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Marksheets List */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Marksheet No</th>
              <th className="p-3.5">Student Name</th>
              <th className="p-3.5">Enrollment No</th>
              <th className="p-3.5">Course</th>
              <th className="p-3.5">Percentage</th>
              <th className="p-3.5">Result</th>
              <th className="p-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No marksheets generated yet.
                </td>
              </tr>
            ) : (
              filtered.map((ms) => (
                <tr key={ms.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-mono font-bold text-brand-600">{ms.marksheetNumber}</td>
                  <td className="p-3.5 font-bold text-slate-900">{ms.studentName}</td>
                  <td className="p-3.5 font-mono text-slate-600">{ms.enrollmentNo}</td>
                  <td className="p-3.5 text-slate-700">{ms.courseName}</td>
                  <td className="p-3.5 font-bold text-slate-900">{ms.percentage}% ({ms.grade})</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ms.result === "PASS"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {ms.result}
                    </span>
                  </td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => setSelectedMarksheet(ms)}
                      className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View & Print</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Marksheet Preview & Print Modal */}
      {selectedMarksheet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 p-4 text-white flex items-center justify-between no-print">
              <span className="font-bold text-xs font-mono">{selectedMarksheet.marksheetNumber}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-1.5 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-brand"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Marksheet</span>
                </button>
                <button
                  onClick={() => setSelectedMarksheet(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* A4 Printable Marksheet Document */}
            <div ref={printRef} className="p-8 space-y-6 bg-white text-slate-900 print-area">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                <h1 className="text-2xl font-black uppercase tracking-wider text-slate-900">
                  {selectedMarksheet.instituteName}
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Approved Educational Institute & Computer Training Center
                </p>
                <div className="inline-block px-4 py-1 bg-slate-900 text-white font-extrabold text-xs tracking-widest uppercase rounded-sm mt-2">
                  Official Statement of Marks
                </div>
              </div>

              {/* Student Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 border border-slate-200 rounded-lg">
                <div className="space-y-1">
                  <p><strong>Candidate Name:</strong> {selectedMarksheet.studentName}</p>
                  <p><strong>Father's Name:</strong> {selectedMarksheet.fatherName}</p>
                  <p><strong>Enrollment Number:</strong> <span className="font-mono">{selectedMarksheet.enrollmentNo}</span></p>
                </div>
                <div className="space-y-1 text-right">
                  <p><strong>Marksheet Number:</strong> <span className="font-mono">{selectedMarksheet.marksheetNumber}</span></p>
                  <p><strong>Course:</strong> {selectedMarksheet.courseName}</p>
                  <p><strong>Exam Date:</strong> {selectedMarksheet.examDate}</p>
                </div>
              </div>

              {/* Marks Table */}
              <table className="w-full text-left text-xs border border-slate-300 border-collapse">
                <thead className="bg-slate-100 border-b border-slate-300 font-bold text-[11px]">
                  <tr>
                    <th className="p-2.5 border-r border-slate-300">Subject Name</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Max Theory</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Max Practical</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Total Max</th>
                    <th className="p-2.5 border-r border-slate-300 text-center">Marks Obtained</th>
                    <th className="p-2.5 text-center">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {selectedMarksheet.subjects.map((sub, idx) => (
                    <tr key={idx}>
                      <td className="p-2.5 border-r border-slate-300 font-semibold">{sub.subjectName}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-mono">{sub.maxTheory}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-mono">{sub.maxPractical}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-mono font-bold">{sub.totalMax}</td>
                      <td className="p-2.5 border-r border-slate-300 text-center font-mono font-bold">{sub.totalObtained}</td>
                      <td className="p-2.5 text-center font-bold">{sub.grade}</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-black">
                    <td className="p-2.5 border-r border-slate-300 uppercase">Grand Total</td>
                    <td className="p-2.5 border-r border-slate-300 text-center">-</td>
                    <td className="p-2.5 border-r border-slate-300 text-center">-</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono">{selectedMarksheet.grandTotalMax}</td>
                    <td className="p-2.5 border-r border-slate-300 text-center font-mono text-brand-700">{selectedMarksheet.grandTotalObtained}</td>
                    <td className="p-2.5 text-center">{selectedMarksheet.grade}</td>
                  </tr>
                </tbody>
              </table>

              {/* Result Summary & QR Code */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="space-y-1 text-xs">
                  <p><strong>Percentage:</strong> {selectedMarksheet.percentage}%</p>
                  <p><strong>Result:</strong> <span className="font-black text-emerald-700">{selectedMarksheet.result}</span></p>
                  <p><strong>Issue Date:</strong> {selectedMarksheet.issueDate}</p>
                </div>

                {qrDataUrl && (
                  <div className="text-center space-y-1">
                    <img src={qrDataUrl} alt="Verification QR" className="w-20 h-20 border border-slate-200 p-1 mx-auto" />
                    <span className="text-[9px] text-slate-500 font-mono block">Scan to Verify</span>
                  </div>
                )}

                <div className="text-right space-y-6 pt-6">
                  <div className="w-36 border-b border-slate-400 mx-auto" />
                  <p className="text-xs font-bold uppercase text-slate-700">Controller of Examinations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
