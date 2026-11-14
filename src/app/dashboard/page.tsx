"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Award, 
  Wallet, 
  ArrowLeftRight, 
  Plus, 
  FileText, 
  Edit3, 
  CheckCircle2, 
  ChevronRight, 
  Info, 
  Headphones, 
  MessageSquare, 
  MoreVertical, 
  GraduationCap, 
  Activity,
  Keyboard,
  Laptop,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Student, WalletTransaction } from "@/types";
import { 
  subscribeRealtimeStudents, 
  subscribeRealtimeTransactions 
} from "@/lib/firebase/services";
import RechargeModal from "@/components/modals/RechargeModal";
import EditStudentModal from "@/components/modals/EditStudentModal";
import { AlertModal } from "@/components/ui/FeedbackModal";

export default function DashboardPage() {
  const { user, institute, walletBalance, refreshInstitute } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    certificatesGenerated: 0,
    walletBalance: 0,
    totalTransactions: 0,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [dashboardAlert, setDashboardAlert] = useState<{ title: string; message: string; type: "info" | "error" | "success" } | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic fee rules set by Super Admin
  const admissionFee = institute?.settings?.admissionFee ?? 150;
  const profileEditFee = institute?.settings?.profileEditFee ?? 100;
  const certificateFee = institute?.settings?.certificateFee ?? 0;
  const marksheetFee = institute?.settings?.marksheetFee ?? 0;

  const fetchDashboardData = async () => {
    if (!institute) return;
    try {
      const dbStats = await dataStore.getDashboardStats(institute.id);
      const { students: stList } = await dataStore.getStudents(institute.id, { limit: 5 });
      const txList = await dataStore.getTransactions(institute.id);

      setStats({
        totalStudents: dbStats.totalStudents,
        certificatesGenerated: dbStats.certificatesGenerated,
        walletBalance: dbStats.walletBalance,
        totalTransactions: dbStats.totalTransactions,
      });
      setStudents(stList);
      setTransactions(txList.slice(0, 5));
    } catch (err) {
      console.error("Dashboard data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    if (!institute?.id) return;

    // Realtime listener for students in this institute
    const unsubStudents = subscribeRealtimeStudents(institute.id, (liveStudents) => {
      setStudents(liveStudents.slice(0, 5));
      setStats((prev) => ({
        ...prev,
        totalStudents: liveStudents.length,
      }));
    });

    // Realtime listener for wallet transactions in this institute
    const unsubTx = subscribeRealtimeTransactions(institute.id, (liveTx) => {
      setTransactions(liveTx.slice(0, 5));
      setStats((prev) => ({
        ...prev,
        totalTransactions: liveTx.length,
      }));
    });

    return () => {
      unsubStudents();
      unsubTx();
    };
  }, [institute]);

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Super Admin Preview Bar */}
      {user?.role === "super_admin" && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs border border-slate-800 shadow-sm">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Super Admin View:</strong> You are viewing {institute?.name || "Institute"} ({institute?.id})
            </span>
          </div>
          <Link
            href="/su"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 border border-slate-700 shadow-xs"
          >
            <span>Return to Master Control</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Clean Modern Welcome Hero Banner matching minimalist SaaS reference */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-7 border border-slate-800 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-[11px] font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>{institute?.name || "Institute Management"} ({institute?.id || "INST"})</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">
            Welcome to CertiDesk Pro
          </h2>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-xl">
            Admit students, manage batches, track transactions, and issue verified digital certificates with instant QR validation.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/students/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-slate-900 hover:bg-slate-100 text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4 text-slate-900" />
              <span>Add Student (₹{admissionFee})</span>
            </Link>

            <Link
              href="/certificates/generate"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/90 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Generate Certificate</span>
            </Link>

            <button
              onClick={() => setShowRechargeModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700/90 text-white text-xs font-semibold rounded-xl border border-slate-700 transition-all cursor-pointer"
            >
              <Wallet className="w-4 h-4 text-emerald-400" />
              <span>Recharge Wallet</span>
            </button>
          </div>
        </div>

        {/* Clean Subtle Gradient Accent at Corner */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-slate-800/40 to-transparent pointer-events-none hidden md:block"></div>
      </div>

      {/* 4 Key Stat Cards (Real Isolated Institute Data Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-900">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Students</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Enrolled</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalStudents}</h3>
              <span className="text-xs font-medium text-slate-500">
                {stats.totalStudents > 0 ? "Active candidates" : "No admissions yet"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Certificates Generated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Award className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Issued</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Certificates Generated</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.certificatesGenerated}</h3>
              <span className="text-xs font-medium text-slate-500">
                {stats.certificatesGenerated > 0 ? "Verified awards" : "Ready to issue"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Wallet Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Wallet className="w-5 h-5" />
            </div>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="text-[11px] font-bold text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              Recharge
            </button>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Wallet Balance</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1 font-mono">
              ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Card 4: Total Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Audit</span>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Transactions</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black text-slate-900 font-mono">{stats.totalTransactions.toLocaleString()}</h3>
              <span className="text-xs text-slate-400">Total ledger logs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/students/add"
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 hover:border-slate-900 hover:shadow-xs rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Add Student</p>
              <p className="text-[10px] text-slate-500 truncate">(₹{admissionFee} per admission)</p>
            </div>
          </Link>

          <button
            onClick={() => {
              if (students.length > 0) {
                setSelectedStudentForEdit(students[0]);
              } else {
                setDashboardAlert({
                  title: "No Students Found",
                  message: "There are no students enrolled in your institute yet. Please admit a student first before editing.",
                  type: "info"
                });
              }
            }}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 hover:border-slate-900 hover:shadow-xs rounded-2xl transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Edit Student</p>
              <p className="text-[10px] text-slate-500 truncate">(₹{profileEditFee} per update)</p>
            </div>
          </button>

          <Link
            href="/certificates/generate"
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 hover:border-slate-900 hover:shadow-xs rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-600 text-amber-700 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Award className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Generate Certificate</p>
              <p className="text-[10px] text-slate-500 truncate">
                {certificateFee > 0 ? `(₹${certificateFee} fee)` : "Free / Included"}
              </p>
            </div>
          </Link>

          <Link
            href="/students"
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 hover:border-slate-900 hover:shadow-xs rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-100 group-hover:bg-slate-900 text-slate-800 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Student List</p>
              <p className="text-[10px] text-slate-500 truncate">View & Manage</p>
            </div>
          </Link>

          <button
            onClick={() => setShowRechargeModal(true)}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200 hover:border-slate-900 hover:shadow-xs rounded-2xl transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-700 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Recharge Wallet</p>
              <p className="text-[10px] text-slate-500 truncate">Instant Credit</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Grid: 70% Left Column / 30% Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Students & Recent Activities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Students Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">Recent Students</h3>
              </div>
              <Link
                href="/students"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            {students.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-800">No students enrolled yet</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Admit your first student with custom roll number and batch assignment to get started.
                </p>
                <div className="pt-2">
                  <Link
                    href="/students/add"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Student (₹{admissionFee})</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4 w-10">#</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Course</th>
                      <th className="py-3 px-4">Enroll. No.</th>
                      <th className="py-3 px-4">Added On</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {students.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                        <td className="py-3.5 px-4">
                          <Link
                            href={`/students/${student.id}`}
                            className="font-bold text-slate-900 hover:text-slate-700"
                          >
                            {student.fullName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-100 text-slate-800"
                          >
                            {student.courseCode || student.courseName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                          {student.enrollmentNo}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(student.admissionDate).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {student.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/certificates/generate?studentId=${student.id}`}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Generate Certificate"
                            >
                              <Award className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => setSelectedStudentForEdit(student)}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                              title={`Edit Student (₹${profileEditFee})`}
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <Link
                              href={`/students/${student.id}`}
                              className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                              title="View Full Profile"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Activities Feed Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-sm text-slate-900">Recent Activities</h3>
              </div>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            {transactions.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Activity className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-700">No recent transactions</p>
                <p className="text-[11px] text-slate-400">Recharges, admissions, and updates will be logged here in real-time.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const isCredit = tx.type === "credit";
                  const isStudentAdd = tx.purpose === "admission";

                  return (
                    <div key={tx.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            isCredit
                              ? "bg-emerald-50 text-emerald-700"
                              : isStudentAdd
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isCredit ? (
                            <Wallet className="w-4 h-4" />
                          ) : isStudentAdd ? (
                            <Users className="w-4 h-4" />
                          ) : (
                            <Edit3 className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{tx.description}</p>
                          <p className="text-[11px] text-slate-500">
                            {isCredit
                              ? `Payment via Razorpay`
                              : `₹${tx.amount} deducted from wallet`}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Pricing, Certificate Courses, Wallet Summary, Help */}
        <div className="lg:col-span-4 space-y-6">
          {/* Certificate Courses card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Award className="w-5 h-5 text-slate-800" />
              <h3 className="font-bold text-sm text-slate-900">Certificate Courses</h3>
            </div>

            <div className="space-y-2">
              <Link
                href="/courses"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-slate-800">ADCA Certificate</h4>
                    <p className="text-[10px] text-slate-500">Advanced Diploma in Computer Application</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
              </Link>

              <Link
                href="/courses"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-slate-800">Typing Certificate</h4>
                    <p className="text-[10px] text-slate-500">Computer Typing Proficiency</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900" />
              </Link>
            </div>
          </div>

          {/* Dynamic Pricing & Charges Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-base font-bold text-slate-800">₹</span>
              <h3 className="font-bold text-sm text-slate-900">Pricing & Charges</h3>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-bold">
                    +
                  </div>
                  <span className="font-medium text-slate-700">New Admission (Add Student)</span>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                  ₹{admissionFee}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-bold">
                    ✎
                  </div>
                  <span className="font-medium text-slate-700">Profile Edit / Update</span>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                  ₹{profileEditFee}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center text-[10px] font-bold">
                    ★
                  </div>
                  <span className="font-medium text-slate-700">Certificate Generation</span>
                </div>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 font-mono">
                  {certificateFee > 0 ? `₹${certificateFee}` : "Free"}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Automatic Deductions:</strong> Charges are automatically deducted from your institute wallet balance upon action.
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Summary Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-5 h-5 text-slate-800" />
              <h3 className="font-bold text-sm text-slate-900">Wallet Summary</h3>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 font-medium">Available Balance</p>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5 font-mono">
                ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h4>
            </div>

            <button
              onClick={() => setShowRechargeModal(true)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Recharge Wallet</span>
            </button>

            {/* Quick recharge pill amounts */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setShowRechargeModal(true)}
                  className="py-1.5 px-1 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer"
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-5 h-5 text-slate-800" />
              <h3 className="font-bold text-sm text-slate-900">Need Assistance?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Have questions regarding student admission, certificates, or recharge? Reach out to support.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <Link
                href="/support"
                className="flex-1 py-2 px-3 border border-slate-200 hover:bg-slate-50 text-slate-800 text-xs font-bold rounded-xl text-center transition-all"
              >
                Contact Support
              </Link>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-xs"
                title="WhatsApp Support"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Real Recharge Modal */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={fetchDashboardData}
        />
      )}

      {/* Edit Student Modal */}
      {selectedStudentForEdit && (
        <EditStudentModal
          student={selectedStudentForEdit}
          isOpen={Boolean(selectedStudentForEdit)}
          onClose={() => setSelectedStudentForEdit(null)}
          onSuccess={() => {
            setSelectedStudentForEdit(null);
            fetchDashboardData();
            refreshInstitute();
          }}
        />
      )}

      {/* In-App Feedback Dialog */}
      {dashboardAlert && (
        <AlertModal
          isOpen={Boolean(dashboardAlert)}
          title={dashboardAlert.title}
          message={dashboardAlert.message}
          type={dashboardAlert.type}
          buttonText="Understood"
          onClose={() => setDashboardAlert(null)}
        />
      )}
    </div>
  );
}
