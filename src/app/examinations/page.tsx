"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ClipboardList, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Save, 
  Award 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Batch, Course, Student } from "@/types";

export default function ExaminationsPage() {
  const { institute } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [examName, setExamName] = useState("Semester 1 Final Examination");
  const [examDate, setExamDate] = useState(new Date().toISOString().split("T")[0]);

  // Selected student marks input
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [subjectMarks, setSubjectMarks] = useState<
    { name: string; maxTheory: number; maxPractical: number; obTheory: number; obPractical: number }[]
  >([]);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!institute) return;
      const b = await dataStore.getBatches(institute.id);
      const c = await dataStore.getCourses(institute.id);
      setBatches(b);
      setCourses(c);
      if (b.length > 0) setSelectedBatchId(b[0].id);
    }
    load();
  }, [institute]);

  useEffect(() => {
    async function loadStudents() {
      if (!institute || !selectedBatchId) return;
      const { students: sList } = await dataStore.getStudents(institute.id, { batchId: selectedBatchId });
      setStudents(sList);
      if (sList.length > 0) {
        setSelectedStudentId(sList[0].id);
      }
    }
    loadStudents();
  }, [institute, selectedBatchId]);

  const activeBatch = batches.find((b) => b.id === selectedBatchId);
  const activeCourse = courses.find((c) => c.id === activeBatch?.courseId) || courses[0];

  useEffect(() => {
    if (activeCourse?.subjects) {
      setSubjectMarks(
        activeCourse.subjects.map((s) => ({
          name: s.name,
          maxTheory: s.maxTheory,
          maxPractical: s.maxPractical,
          obTheory: Math.round(s.maxTheory * 0.8),
          obPractical: Math.round(s.maxPractical * 0.85),
        }))
      );
    }
  }, [activeCourse]);

  // Calculation helpers
  const totalMax = subjectMarks.reduce((acc, s) => acc + s.maxTheory + s.maxPractical, 0);
  const totalObtained = subjectMarks.reduce((acc, s) => acc + s.obTheory + s.obPractical, 0);
  const percentage = totalMax > 0 ? Number(((totalObtained / totalMax) * 100).toFixed(1)) : 0;
  const grade = percentage >= 85 ? "A+" : percentage >= 75 ? "A" : percentage >= 60 ? "B" : percentage >= 50 ? "C" : "D";
  const isPassed = percentage >= 40;

  const handleSaveMarks = async () => {
    const student = students.find((s) => s.id === selectedStudentId);
    if (!student || !institute || !activeBatch || !activeCourse) return;

    // Check obtained <= max
    for (const sub of subjectMarks) {
      if (sub.obTheory > sub.maxTheory || sub.obPractical > sub.maxPractical) {
        setError(`Obtained marks cannot exceed maximum marks for ${sub.name}`);
        return;
      }
    }

    try {
      await dataStore.createMarksheet({
        instituteId: institute.id,
        instituteName: institute.name,
        studentId: student.id,
        studentName: student.fullName,
        fatherName: student.fatherName,
        enrollmentNo: student.enrollmentNo,
        courseId: activeCourse.id,
        courseName: activeCourse.name,
        batchName: activeBatch.name,
        examDate,
        subjects: subjectMarks.map((s) => ({
          subjectName: s.name,
          maxTheory: s.maxTheory,
          maxPractical: s.maxPractical,
          obtainedTheory: s.obTheory,
          obtainedPractical: s.obPractical,
          totalMax: s.maxTheory + s.maxPractical,
          totalObtained: s.obTheory + s.obPractical,
          grade: (s.obTheory + s.obPractical) / (s.maxTheory + s.maxPractical) >= 0.75 ? "A" : "B",
        })),
        grandTotalMax: totalMax,
        grandTotalObtained: totalObtained,
        percentage,
        grade,
        result: isPassed ? "PASS" : "FAIL",
        issueDate: new Date().toISOString().split("T")[0],
      });

      setSavedSuccess(true);
      setError(null);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      setError(err.message || "Failed to save marks");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Examinations & Marks Entry</h2>
          <p className="text-xs text-slate-500">Record candidate marks, calculate percentages and issue marksheets.</p>
        </div>

        <Link
          href="/marksheets"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>View Marksheets</span>
        </Link>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">Official Marksheet Generated Successfully!</span>
          </div>
          <Link href="/marksheets" className="font-bold underline text-emerald-900">
            Open Marksheet List →
          </Link>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Select Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div>
          <label className="font-semibold text-slate-700 block mb-1">Select Batch</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.courseName})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Select Student</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
          >
            {students.map((st) => (
              <option key={st.id} value={st.id}>
                {st.fullName} ({st.enrollmentNo})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold text-slate-700 block mb-1">Exam Date</label>
          <input
            type="date"
            value={examDate}
            onChange={(e) => setExamDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
          />
        </div>
      </div>

      {/* Marks Entry Sheet */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-5">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-3">
          Subject-Wise Evaluation Form: {activeCourse?.name}
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase">
                <th className="p-3">Subject Name</th>
                <th className="p-3">Max Theory</th>
                <th className="p-3">Obt. Theory</th>
                <th className="p-3">Max Practical</th>
                <th className="p-3">Obt. Practical</th>
                <th className="p-3">Total Marks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjectMarks.map((sub, idx) => (
                <tr key={idx}>
                  <td className="p-3 font-bold text-slate-900 max-w-[200px]">{sub.name}</td>
                  <td className="p-3 text-slate-500 font-mono">{sub.maxTheory}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      max={sub.maxTheory}
                      value={sub.obTheory}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSubjectMarks((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, obTheory: val } : item))
                        );
                      }}
                      className="w-20 px-2 py-1 border rounded-lg font-mono font-bold text-brand-700"
                    />
                  </td>
                  <td className="p-3 text-slate-500 font-mono">{sub.maxPractical}</td>
                  <td className="p-3">
                    <input
                      type="number"
                      min="0"
                      max={sub.maxPractical}
                      value={sub.obPractical}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setSubjectMarks((prev) =>
                          prev.map((item, i) => (i === idx ? { ...item, obPractical: val } : item))
                        );
                      }}
                      className="w-20 px-2 py-1 border rounded-lg font-mono font-bold text-brand-700"
                    />
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-900">
                    {sub.obTheory + sub.obPractical} / {sub.maxTheory + sub.maxPractical}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-500 block">Total Obtained</span>
              <span className="text-base font-bold text-slate-900">
                {totalObtained} / {totalMax}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Percentage</span>
              <span className="text-base font-bold text-brand-600">{percentage}%</span>
            </div>
            <div>
              <span className="text-slate-500 block">Grade</span>
              <span className="text-base font-black text-slate-900">{grade}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Status</span>
              <span
                className={`text-xs font-black px-2.5 py-1 rounded-md ${
                  isPassed ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                }`}
              >
                {isPassed ? "PASS" : "FAIL"}
              </span>
            </div>
          </div>

          <button
            onClick={handleSaveMarks}
            className="px-6 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white font-bold rounded-xl shadow-brand text-xs flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Generate Official Marksheet</span>
          </button>
        </div>
      </div>
    </div>
  );
}
