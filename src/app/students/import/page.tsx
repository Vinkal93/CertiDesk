"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  ArrowLeft, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Users 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Course, Batch } from "@/types";

export default function BulkImportPage() {
  const { institute, walletBalance, refreshInstitute } = useAuth();
  const [csvData, setCsvData] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const admissionFee = institute?.settings.admissionFee ?? 150;

  const handleDownloadSample = () => {
    const sampleHeaders = "FullName,FatherName,MotherName,Mobile,Email,CourseCode,Qualification,Address\n";
    const sampleRow1 = "Rahul Kumar,Suresh Kumar,Anita Devi,9876543210,rahul@gmail.com,ADCA,12th Pass,Civil Lines Gorakhpur\n";
    const sampleRow2 = "Pooja Verma,Dinesh Verma,Sunita Verma,9876543211,pooja@gmail.com,TYP,Graduation,Mohaddipur Gorakhpur\n";
    
    const blob = new Blob([sampleHeaders + sampleRow1 + sampleRow2], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "CertiDesk_Bulk_Import_Sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setError("CSV must contain a header row and at least 1 record.");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const values = lines[i].split(",").map((v) => v.trim());
      const row: any = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });
      records.push(row);
    }

    setParsedRows(records);
    setError(null);
  };

  const handleImport = async () => {
    if (!institute) return;
    if (parsedRows.length === 0) return;

    const totalCost = parsedRows.length * admissionFee;
    if (walletBalance < totalCost) {
      setError(`Insufficient wallet balance. Total cost is ₹${totalCost.toLocaleString()} (₹${admissionFee} × ${parsedRows.length}), but current balance is ₹${walletBalance}. Please recharge first.`);
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      let imported = 0;
      for (const row of parsedRows) {
        await dataStore.createStudent({
          instituteId: institute.id,
          fullName: row.fullname || "Student Candidate",
          fatherName: row.fathername || "Parent Name",
          motherName: row.mothername || "Mother Name",
          dob: "2004-01-01",
          gender: "Male",
          mobile: row.mobile || "9870000000",
          email: row.email || "candidate@example.com",
          address: row.address || "Gorakhpur",
          state: institute.state || "Uttar Pradesh",
          district: institute.district || "Gorakhpur",
          pincode: institute.pincode || "273001",
          qualification: row.qualification || "12th Pass",
          schoolCollege: "Affiliated College",
          courseId: "c-adca",
          courseName: row.coursecode || "ADCA",
          courseCode: row.coursecode || "ADCA",
          batchId: "batch-sbci-adca-m",
          batchName: "ADCA Morning Batch",
          session: "2026-2027",
          courseDuration: "12 Months",
          courseFee: 12000,
          status: "Active",
          admissionDate: new Date().toISOString().split("T")[0],
        });
        imported++;
      }

      await refreshInstitute();
      setResultMessage(`Successfully imported ${imported} students! ₹${totalCost.toLocaleString()} deducted.`);
      setParsedRows([]);
    } catch (err: any) {
      setError(err.message || "Failed during bulk import.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/students"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Bulk Student Import</h2>
            <p className="text-xs text-slate-500">Upload CSV file to admit multiple students in one batch.</p>
          </div>
        </div>

        <button
          onClick={handleDownloadSample}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <Download className="w-4 h-4 text-brand-600" />
          <span>Download Sample CSV</span>
        </button>
      </div>

      {resultMessage ? (
        <div className="p-8 bg-white border border-emerald-200 rounded-2xl shadow-soft text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">Import Complete!</h3>
          <p className="text-xs text-slate-600">{resultMessage}</p>
          <Link
            href="/students"
            className="inline-block mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
          >
            Go to Student Directory
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Area */}
          <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center space-y-3 hover:border-brand-500 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Select or drop your CSV file</p>
              <p className="text-xs text-slate-400 mt-0.5">Supports UTF-8 CSV with standard candidate columns</p>
            </div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 cursor-pointer"
            />
          </div>

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Preview Records ({parsedRows.length} candidates)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Total admission fee: ₹{(parsedRows.length * admissionFee).toLocaleString()} (₹{admissionFee}/student)
                  </p>
                </div>

                <button
                  onClick={handleImport}
                  disabled={isProcessing}
                  className="px-5 py-2 bg-[#6529E8] hover:bg-[#541FD0] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-2 cursor-pointer"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <span>Confirm & Import ({parsedRows.length})</span>
                  )}
                </button>
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Father Name</th>
                      <th className="p-2.5">Mobile</th>
                      <th className="p-2.5">Course</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 font-bold">{row.fullname}</td>
                        <td className="p-2.5">{row.fathername}</td>
                        <td className="p-2.5 font-mono">{row.mobile}</td>
                        <td className="p-2.5 font-semibold text-brand-600">{row.coursecode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
