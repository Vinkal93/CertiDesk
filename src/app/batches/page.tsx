"use client";

import React, { useState, useEffect } from "react";
import { Layers, Plus, Calendar, Clock, Users, ArrowRightLeft, X, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Batch, Course, Student } from "@/types";

export default function BatchesPage() {
  const { institute } = useAuth();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  // Transfer modal
  const [transferStudent, setTransferStudent] = useState<Student | null>(null);
  const [targetBatchId, setTargetBatchId] = useState("");

  // New Batch fields
  const [batchName, setBatchName] = useState("");
  const [batchCode, setBatchCode] = useState("");
  const [courseId, setCourseId] = useState("");
  const [timing, setTiming] = useState("09:00 AM - 11:00 AM");
  const [instructor, setInstructor] = useState("Er. Ramesh Verma");
  const [maxStudents, setMaxStudents] = useState(30);

  const loadBatches = async () => {
    if (!institute) return;
    const b = await dataStore.getBatches(institute.id);
    const c = await dataStore.getCourses(institute.id);
    const { students: s } = await dataStore.getStudents(institute.id);
    setBatches(b);
    setCourses(c);
    setStudents(s);
    if (c.length > 0) setCourseId(c[0].id);
  };

  useEffect(() => {
    loadBatches();
  }, [institute]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;

    const course = courses.find((c) => c.id === courseId);
    await dataStore.createBatch({
      instituteId: institute.id,
      name: batchName.trim(),
      code: batchCode.trim() || `B-${Date.now().toString().slice(-4)}`,
      courseId,
      courseName: course?.name || "ADCA",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 90 * 86400000).toISOString().split("T")[0],
      timing,
      instructor,
      maxStudents: Number(maxStudents),
      status: "Active",
      description: "Regular daily classroom session.",
    });

    setShowAddModal(false);
    setBatchName("");
    setBatchCode("");
    loadBatches();
  };

  const handleTransfer = async () => {
    if (!transferStudent || !targetBatchId) return;
    await dataStore.transferStudentBatch(transferStudent.id, targetBatchId);
    setTransferStudent(null);
    loadBatches();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Batch Management</h2>
          <p className="text-xs text-slate-500">
            Create academic cohorts, manage enrollments, track timings and capacity.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {batches.map((batch) => {
          const enrolled = students.filter((s) => s.batchId === batch.id);
          const capacityPercent = Math.min(100, Math.round((enrolled.length / (batch.maxStudents || 30)) * 100));

          return (
            <div
              key={batch.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4 hover:shadow-soft transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-purple-50 text-purple-700 font-mono">
                  {batch.code}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {batch.status}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900">{batch.name}</h3>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">{batch.courseName}</p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{batch.timing}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Instructor: {batch.instructor}</span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                  <span>Enrolled: {enrolled.length} / {batch.maxStudents}</span>
                  <span>{capacityPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      capacityPercent >= 90 ? "bg-rose-500" : "bg-brand-600"
                    }`}
                    style={{ width: `${capacityPercent}%` }}
                  />
                </div>
              </div>

              {/* View / Transfer Students action */}
              <button
                onClick={() => setSelectedBatch(batch)}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                View Batch Students ({enrolled.length})
              </button>
            </div>
          );
        })}
      </div>

      {/* Batch Students Detail Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{selectedBatch.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedBatch.timing}</p>
              </div>
              <button onClick={() => setSelectedBatch(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {students.filter((s) => s.batchId === selectedBatch.id).length === 0 ? (
                <p className="text-center py-8 text-slate-400 text-xs">No students currently in this batch.</p>
              ) : (
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Enrollment No</th>
                      <th className="p-2.5">Mobile</th>
                      <th className="p-2.5 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {students
                      .filter((s) => s.batchId === selectedBatch.id)
                      .map((st) => (
                        <tr key={st.id}>
                          <td className="p-2.5 font-bold text-slate-900">{st.fullName}</td>
                          <td className="p-2.5 font-mono text-slate-600">{st.enrollmentNo}</td>
                          <td className="p-2.5 text-slate-600">{st.mobile}</td>
                          <td className="p-2.5 text-center">
                            <button
                              onClick={() => {
                                setTransferStudent(st);
                                setTargetBatchId(
                                  batches.find((b) => b.id !== selectedBatch.id)?.id || ""
                                );
                              }}
                              className="px-2.5 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold rounded-lg flex items-center gap-1 mx-auto"
                            >
                              <ArrowRightLeft className="w-3 h-3" />
                              <span>Transfer</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transfer Batch Confirmation Modal */}
      {transferStudent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Transfer Student</h4>
            <p className="text-xs text-slate-600">
              Transfer <strong>{transferStudent.fullName}</strong> to another batch without losing past historical records:
            </p>

            <select
              value={targetBatchId}
              onChange={(e) => setTargetBatchId(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl text-xs font-medium"
            >
              {batches
                .filter((b) => b.id !== transferStudent.batchId)
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.timing})
                  </option>
                ))}
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTransferStudent(null)}
                className="px-3 py-1.5 border rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                className="px-4 py-1.5 bg-[#6529E8] text-white rounded-xl text-xs font-bold shadow-brand"
              >
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create New Batch</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Batch Name *</label>
                <input
                  type="text"
                  placeholder="e.g. ADCA Morning Batch"
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Class Timing</label>
                  <input
                    type="text"
                    value={timing}
                    onChange={(e) => setTiming(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={maxStudents}
                    onChange={(e) => setMaxStudents(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Instructor</label>
                <input
                  type="text"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-xl font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#6529E8] text-white rounded-xl font-bold shadow-brand"
                >
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
