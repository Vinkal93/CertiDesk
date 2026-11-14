"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Archive, ArrowLeft, RefreshCw, Eye, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Student } from "@/types";

export default function ArchivedStudentsPage() {
  const { institute } = useAuth();
  const [archivedStudents, setArchivedStudents] = useState<Student[]>([]);
  const [restoredId, setRestoredId] = useState<string | null>(null);

  const loadData = async () => {
    if (!institute) return;
    const res = await dataStore.getStudents(institute.id, { status: "Archived" });
    setArchivedStudents(res.students);
  };

  useEffect(() => {
    loadData();
  }, [institute]);

  const handleRestore = async (id: string) => {
    await dataStore.restoreStudent(id);
    setRestoredId(id);
    await loadData();
    setTimeout(() => setRestoredId(null), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-3">
        <Link
          href="/students"
          className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Archived Students</h2>
          <p className="text-xs text-slate-500">
            Past or dropped student profiles preserved for records. Can be restored anytime.
          </p>
        </div>
      </div>

      {restoredId && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Student restored to active directory!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {archivedStudents.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No students currently archived.
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
              <tr>
                <th className="p-3.5">Candidate Name</th>
                <th className="p-3.5">Enrollment No</th>
                <th className="p-3.5">Course</th>
                <th className="p-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {archivedStudents.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-slate-900">{st.fullName}</td>
                  <td className="p-3.5 font-mono text-slate-600">{st.enrollmentNo}</td>
                  <td className="p-3.5 text-slate-700">{st.courseName}</td>
                  <td className="p-3.5 text-center">
                    <button
                      onClick={() => handleRestore(st.id)}
                      className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs"
                    >
                      Restore to Active
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
