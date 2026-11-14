"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Users, CheckCircle2, XCircle, Clock, ShieldAlert, Save } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Batch, Student } from "@/types";

export default function AttendancePage() {
  const { institute } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, "Present" | "Absent" | "Late" | "Leave">>({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!institute) return;
      const b = await dataStore.getBatches(institute.id);
      setBatches(b);
      if (b.length > 0) setSelectedBatchId(b[0].id);
    }
    load();
  }, [institute]);

  useEffect(() => {
    async function loadBatchStudents() {
      if (!institute || !selectedBatchId) return;
      const { students: sList } = await dataStore.getStudents(institute.id, { batchId: selectedBatchId });
      setStudents(sList);

      // Default all to Present
      const initialMap: Record<string, "Present" | "Absent" | "Late" | "Leave"> = {};
      sList.forEach((st) => {
        initialMap[st.id] = "Present";
      });
      setAttendanceMap(initialMap);
      setSavedSuccess(false);
    }
    loadBatchStudents();
  }, [institute, selectedBatchId]);

  const handleStatusChange = (studentId: string, status: "Present" | "Absent" | "Late" | "Leave") => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    if (!institute || !selectedBatchId) return;

    const records = students.map((st) => ({
      studentId: st.id,
      studentName: st.fullName,
      enrollmentNo: st.enrollmentNo,
      status: attendanceMap[st.id] || "Present",
    }));

    await dataStore.saveAttendance({
      instituteId: institute.id,
      batchId: selectedBatchId,
      date,
      records,
      markedBy: institute.ownerName,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Attendance Management</h2>
          <p className="text-xs text-slate-500">Record daily classroom attendance for batches.</p>
        </div>

        <button
          onClick={handleSaveAttendance}
          className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Attendance</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Attendance successfully recorded for {date}!</span>
        </div>
      )}

      {/* Control Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex flex-wrap items-center gap-4">
        <div className="min-w-[220px]">
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Select Batch</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.timing})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-semibold text-slate-500 block mb-1">Attendance Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
          />
        </div>
      </div>

      {/* Attendance Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        {students.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No active students enrolled in this batch.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5 w-12">#</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Enrollment No</th>
                <th className="p-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {students.map((st, idx) => {
                const currentStatus = attendanceMap[st.id] || "Present";
                return (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-3.5 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-3.5 font-mono text-slate-600">{st.enrollmentNo}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {(["Present", "Absent", "Late", "Leave"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStatusChange(st.id, s)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                              currentStatus === s
                                ? s === "Present"
                                  ? "bg-emerald-600 text-white shadow-xs"
                                  : s === "Absent"
                                  ? "bg-rose-600 text-white shadow-xs"
                                  : s === "Late"
                                  ? "bg-amber-500 text-white shadow-xs"
                                  : "bg-blue-600 text-white shadow-xs"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
