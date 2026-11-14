"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  MoreVertical, 
  Award, 
  Edit3, 
  Archive, 
  Eye, 
  ChevronLeft, 
  ChevronRight,
  FileSpreadsheet,
  CheckCircle2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Student, Course, Batch } from "@/types";
import { subscribeRealtimeStudents } from "@/lib/firebase/services";
import EditStudentModal from "@/components/modals/EditStudentModal";

export default function StudentsListPage() {
  const { institute, refreshInstitute } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [editStudent, setEditStudent] = useState<Student | null>(null);

  const loadData = async () => {
    if (!institute) return;
    setLoading(true);
    try {
      const crs = await dataStore.getCourses(institute.id);
      const bth = await dataStore.getBatches(institute.id);
      setCourses(crs);
      setBatches(bth);

      const res = await dataStore.getStudents(institute.id, {
        search: searchQuery,
        status: selectedStatus === "All" ? undefined : selectedStatus,
        courseId: selectedCourse || undefined,
        batchId: selectedBatch || undefined,
        page: currentPage,
        limit: pageSize,
      });

      // Filter out archived students by default unless explicitly chosen
      const list = selectedStatus === "Archived" 
        ? res.students 
        : res.students.filter((s) => s.status !== "Archived");

      setStudents(list);
      setTotalCount(res.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    if (!institute?.id) return;
    const unsub = subscribeRealtimeStudents(institute.id, () => {
      loadData();
    });

    return () => {
      unsub();
    };
  }, [institute, searchQuery, selectedStatus, selectedCourse, selectedBatch, currentPage]);

  const handleArchive = async (studentId: string) => {
    if (confirm("Are you sure you want to archive this student?")) {
      await dataStore.archiveStudent(studentId);
      await loadData();
    }
  };

  const handleExportCSV = () => {
    if (students.length === 0) return;
    const headers = ["Enrollment No", "Full Name", "Father Name", "Course", "Batch", "Mobile", "Email", "Status", "Admission Date"];
    const rows = students.map((s) => [
      s.enrollmentNo,
      `"${s.fullName}"`,
      `"${s.fatherName}"`,
      `"${s.courseName}"`,
      `"${s.batchName}"`,
      s.mobile,
      s.email,
      s.status,
      s.admissionDate,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CertiDesk_Students_${institute?.id || "Export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage admissions, view profiles, generate marksheets and certificates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <Link
            href="/students/import"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition-all"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Bulk Import</span>
          </Link>

          <Link
            href="/students/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Student (₹150)</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by student name, enrollment no, mobile, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status select */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="Dropped">Dropped</option>
          </select>

          {/* Course select */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>

          {/* Batch select */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-2 bg-slate-50/70 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Batches</option>
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4">Student & Parents</th>
                <th className="py-3 px-4">Enrollment No</th>
                <th className="py-3 px-4">Course & Batch</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No students found matching your filters.
                  </td>
                </tr>
              ) : (
                students.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <Link
                          href={`/students/${student.id}`}
                          className="font-bold text-slate-900 hover:text-brand-600 flex items-center gap-1.5"
                        >
                          <span>{student.fullName}</span>
                        </Link>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          S/O or D/O: {student.fatherName}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] font-semibold text-brand-700">
                      {student.enrollmentNo}
                    </td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] bg-purple-100 text-purple-700">
                          {student.courseName}
                        </span>
                        <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {student.batchName}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-mono text-[11px] text-slate-700">{student.mobile}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{student.email}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(student.admissionDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {student.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <Link
                          href={`/students/${student.id}`}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <Link
                          href={`/certificates/generate?studentId=${student.id}`}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                          title="Generate Certificate"
                        >
                          <Award className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => setEditStudent(student)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Edit Profile (₹100 charge)"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleArchive(student.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Archive Student"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing {Math.min(totalCount, (currentPage - 1) * pageSize + 1)} to{" "}
            {Math.min(totalCount, currentPage * pageSize)} of {totalCount} students
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-slate-700">Page {currentPage}</span>
            <button
              disabled={currentPage * pageSize >= totalCount}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Student Modal */}
      {editStudent && (
        <EditStudentModal
          student={editStudent}
          isOpen={Boolean(editStudent)}
          onClose={() => setEditStudent(null)}
          onSuccess={() => {
            setEditStudent(null);
            loadData();
            refreshInstitute();
          }}
        />
      )}
    </div>
  );
}
