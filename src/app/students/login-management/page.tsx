"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Key,
  ShieldCheck,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Lock,
  Mail,
  UserCheck,
  UserX,
  Copy,
  Check,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  MoreVertical,
  Edit2
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface StudentAccountRow {
  studentId: string;
  fullName: string;
  enrollmentNo: string;
  courseName: string;
  courseCode: string;
  batchName: string;
  mobile: string;
  email: string;
  instituteId: string;
  hasAccount: boolean;
  uid: string | null;
  loginId: string;
  accountStatus: "active" | "inactive";
  passwordStatus: "set" | "pending";
  mustChangePassword: boolean;
  lastLogin: string | null;
  createdAt: string | null;
}

export default function StudentLoginManagementPage() {
  const { institute } = useAuth();

  const [students, setStudents] = useState<StudentAccountRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "no_account">("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState<StudentAccountRow | null>(null);
  const [customPassword, setCustomPassword] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ loginId: string; tempPass: string } | null>(null);

  const [showResetModal, setShowResetModal] = useState<StudentAccountRow | null>(null);
  const [resetResult, setResetResult] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState<StudentAccountRow | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active");

  const [feedback, setFeedback] = useState<{ title: string; message: string; type: "success" | "error" } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/students/login-management");
      const data = await res.json();
      if (data.success && Array.isArray(data.students)) {
        setStudents(data.students);
      }
    } catch (e) {
      console.warn("Failed to load student logins:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [institute]);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.fullName.toLowerCase().includes(q) ||
      s.enrollmentNo.toLowerCase().includes(q) ||
      s.loginId.toLowerCase().includes(q) ||
      s.mobile.includes(q);

    if (!matchesSearch) return false;

    if (statusFilter === "active") return s.hasAccount && s.accountStatus === "active";
    if (statusFilter === "inactive") return s.hasAccount && s.accountStatus === "inactive";
    if (statusFilter === "no_account") return !s.hasAccount;
    return true;
  });

  const copyText = (text: string, keyId: string) => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      setCopiedKey(keyId);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  };

  // Single Account Creation
  const handleCreateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCreateModal) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/students/login-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-login",
          studentId: showCreateModal.studentId,
          loginEmail: customEmail.trim() || undefined,
          customPassword: customPassword.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create account.");
      }

      setCreatedResult({
        loginId: data.account.loginId,
        tempPass: data.temporaryPassword,
      });

      await loadData();
    } catch (err: any) {
      setFeedback({ title: "Account Creation Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Single Password Reset
  const handleResetPassword = async () => {
    if (!showResetModal?.uid) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/students/login-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-password",
          uid: showResetModal.uid,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to reset password.");
      }

      setResetResult(data.temporaryPassword);
      await loadData();
    } catch (err: any) {
      setFeedback({ title: "Password Reset Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Account Active / Inactive
  const handleToggleStatus = async (student: StudentAccountRow) => {
    if (!student.uid) return;
    const target = student.accountStatus === "active" ? "inactive" : "active";

    try {
      const res = await fetch("/api/students/login-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-status",
          uid: student.uid,
          status: target,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update status.");
      }

      setFeedback({
        title: "Account Status Updated",
        message: `Account for ${student.fullName} is now ${target}.`,
        type: "success",
      });
      await loadData();
    } catch (err: any) {
      setFeedback({ title: "Update Failed", message: err.message, type: "error" });
    }
  };

  // Edit Account Details
  const handleEditAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal?.uid) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/students/login-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-account",
          uid: showEditModal.uid,
          loginEmail: editEmail.trim(),
          accountStatus: editStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update account.");
      }

      setShowEditModal(null);
      setFeedback({ title: "Account Updated", message: "Student account details saved.", type: "success" });
      await loadData();
    } catch (err: any) {
      setFeedback({ title: "Update Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Account Creation
  const handleBulkCreate = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);

    try {
      const res = await fetch("/api/students/login-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-create",
          studentIds: selectedIds,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed bulk creation.");
      }

      setFeedback({
        title: "Bulk Creation Completed",
        message: `Created login accounts for ${data.createdCount} students.`,
        type: "success",
      });
      setSelectedIds([]);
      await loadData();
    } catch (err: any) {
      setFeedback({ title: "Bulk Action Failed", message: err.message, type: "error" });
    } finally {
      setActionLoading(false);
    }
  };

  // Export permitted CSV
  const handleExportCSV = () => {
    const rows = [
      ["Enrollment No", "Student Name", "Course", "Login ID / Email", "Account Status", "Password Status", "Last Login"],
      ...filteredStudents.map((s) => [
        s.enrollmentNo,
        s.fullName,
        s.courseName,
        s.loginId,
        s.accountStatus,
        s.passwordStatus,
        s.lastLogin || "Never",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student_logins_${institute?.id || "export"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredStudents.filter((s) => !s.hasAccount).map((s) => s.studentId));
    } else {
      setSelectedIds([]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">Dashboard</Link>
            <span>/</span>
            <Link href="/students" className="hover:text-slate-900 transition-colors">Students</Link>
            <span>/</span>
            <span className="text-slate-900">Manage Student Login</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Key className="w-6 h-6 text-blue-600" />
            <span>Manage Student Login Access</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Create, manage and audit Firebase Authentication accounts for students in {institute?.name} ({institute?.id}).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-all shadow-2xs"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
            <div>
              <strong className="block">{feedback.title}</strong>
              <span className="opacity-90">{feedback.message}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-bold hover:underline"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 space-y-4">
        
        {/* Search & Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by student, enrollment no, login ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              {[
                { key: "all", label: `All (${students.length})` },
                { key: "active", label: `Active (${students.filter((s) => s.hasAccount && s.accountStatus === "active").length})` },
                { key: "inactive", label: `Inactive (${students.filter((s) => s.hasAccount && s.accountStatus === "inactive").length})` },
                { key: "no_account", label: `No Account (${students.filter((s) => !s.hasAccount).length})` },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setStatusFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === f.key
                      ? "bg-white text-slate-900 shadow-xs"
                      : "text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Bulk Action Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleBulkCreate}
                disabled={actionLoading}
                className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Logins for Selected ({selectedIds.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length > 0 &&
                      selectedIds.length === filteredStudents.filter((s) => !s.hasAccount).length
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                  />
                </th>
                <th className="p-3">Student Details</th>
                <th className="p-3">Enrollment No</th>
                <th className="p-3">Login ID / Email</th>
                <th className="p-3">Account Status</th>
                <th className="p-3">Password Status</th>
                <th className="p-3">Last Login</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No students found matching your search or filter.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const isSelected = selectedIds.includes(s.studentId);
                  return (
                    <tr key={s.studentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        {!s.hasAccount && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedIds((prev) => [...prev, s.studentId]);
                              } else {
                                setSelectedIds((prev) => prev.filter((id) => id !== s.studentId));
                              }
                            }}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 cursor-pointer"
                          />
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{s.fullName}</div>
                        <div className="text-[10px] text-slate-400">{s.courseName}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">
                        {s.enrollmentNo}
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-600">
                        {s.hasAccount ? s.loginId : <span className="text-slate-400 italic">Not Provisioned</span>}
                      </td>
                      <td className="p-3">
                        {s.hasAccount ? (
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              s.accountStatus === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            ● {s.accountStatus.toUpperCase()}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-slate-100 text-slate-500">
                            NO LOGIN
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        {s.hasAccount ? (
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                              s.passwordStatus === "set"
                                ? "bg-blue-50 text-blue-700 border border-blue-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {s.passwordStatus === "set" ? "Password Active" : "Setup Pending"}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-400">
                        {s.lastLogin ? new Date(s.lastLogin).toLocaleDateString() : "Never"}
                      </td>
                      <td className="p-3 text-right">
                        {s.hasAccount ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setShowResetModal(s);
                                setResetResult(null);
                              }}
                              className="px-2.5 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-all"
                            >
                              Reset Pass
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(s)}
                              className={`p-1.5 rounded-lg transition-all ${
                                s.accountStatus === "active"
                                  ? "text-rose-600 hover:bg-rose-50"
                                  : "text-emerald-600 hover:bg-emerald-50"
                              }`}
                              title={s.accountStatus === "active" ? "Deactivate" : "Activate"}
                            >
                              {s.accountStatus === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setShowEditModal(s);
                                setEditEmail(s.loginId);
                                setEditStatus(s.accountStatus);
                              }}
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                              title="Edit Details"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setShowCreateModal(s);
                              setCustomEmail(s.email || `${s.enrollmentNo.toLowerCase().replace(/[^a-z0-9]/g, "_")}@student.certidesk`);
                              setCustomPassword(`Std@${s.enrollmentNo.split("/").pop() || "2026"}`);
                              setCreatedResult(null);
                            }}
                            className="px-3 py-1 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition-all shadow-2xs inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Create Login</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL 1: CREATE STUDENT LOGIN ================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Provision Student Login
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            {createdResult ? (
              <div className="text-center py-4 space-y-4 animate-in zoom-in-95">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Student Login Created!</h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Provide these credentials to the student to sign in to the Student Portal.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-left text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-sans">Login ID:</span>
                    <span className="font-bold text-slate-900">{createdResult.loginId}</span>
                  </div>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500 font-sans">Initial Password:</span>
                    <span className="font-bold text-emerald-600">{createdResult.tempPass}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => copyText(`Login: ${createdResult.loginId}\nPassword: ${createdResult.tempPass}`, "creds")}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {copiedKey === "creds" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedKey === "creds" ? "Copied Credentials!" : "Copy Login Credentials"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowCreateModal(null)}
                  className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateLogin} className="space-y-3.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1">
                  <div className="font-bold text-slate-900">{showCreateModal.fullName}</div>
                  <div className="text-[11px] text-slate-500">
                    Enrollment: <strong>{showCreateModal.enrollmentNo}</strong> • Course: {showCreateModal.courseName}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Student Login Email / Identifier *
                  </label>
                  <input
                    type="email"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Student will log in with this email identifier in Firebase Authentication.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Initial / Temporary Password *
                  </label>
                  <input
                    type="text"
                    value={customPassword}
                    onChange={(e) => setCustomPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                    <span>Create Account</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 2: RESET PASSWORD ================= */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                Reset Password: {showResetModal.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setShowResetModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            {resetResult ? (
              <div className="text-center py-2 space-y-3">
                <p className="text-slate-600">
                  Password has been reset. New temporary password:
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-sm text-emerald-700 select-all">
                  {resetResult}
                </div>
                <button
                  type="button"
                  onClick={() => copyText(resetResult, "reset")}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5"
                >
                  {copiedKey === "reset" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "reset" ? "Copied!" : "Copy New Password"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetModal(null)}
                  className="w-full py-2 bg-[#0F172A] text-white font-bold rounded-xl"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-600 leading-relaxed">
                  Are you sure you want to generate a new password for <strong>{showResetModal.fullName}</strong> ({showResetModal.loginId})?
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(null)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Generate New Password</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL 3: EDIT ACCOUNT ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <form onSubmit={handleEditAccount} className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-sm text-slate-900">
                Edit Login Details: {showEditModal.fullName}
              </h3>
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Login Email Address</label>
              <input
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Account Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-slate-900"
              >
                <option value="active">Active (Can log in)</option>
                <option value="inactive">Inactive / Suspended (Blocked)</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl cursor-pointer"
              >
                {actionLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
