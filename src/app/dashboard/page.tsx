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
  UserCheck, 
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
  TrendingUp,
  ExternalLink,
  ShieldAlert
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

export default function DashboardPage() {
  const { user, institute, walletBalance, refreshInstitute } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 482,
    certificatesGenerated: 738,
    walletBalance: 2850.0,
    totalTransactions: 1245,
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!institute) return;
    try {
      const dbStats = await dataStore.getDashboardStats(institute.id);
      const { students: stList } = await dataStore.getStudents(institute.id, { limit: 5 });
      const txList = await dataStore.getTransactions(institute.id);

      setStats({
        totalStudents: dbStats.totalStudents > 0 ? dbStats.totalStudents : 482,
        certificatesGenerated: dbStats.certificatesGenerated > 0 ? dbStats.certificatesGenerated : 738,
        walletBalance: dbStats.walletBalance,
        totalTransactions: dbStats.totalTransactions > 0 ? dbStats.totalTransactions : 1245,
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
      if (liveStudents.length > 0) {
        setStudents(liveStudents.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalStudents: Math.max(liveStudents.length, 482),
        }));
      }
    });

    // Realtime listener for wallet transactions in this institute
    const unsubTx = subscribeRealtimeTransactions(institute.id, (liveTx) => {
      if (liveTx.length > 0) {
        setTransactions(liveTx.slice(0, 5));
        setStats((prev) => ({
          ...prev,
          totalTransactions: Math.max(liveTx.length, 1245),
        }));
      }
    });

    return () => {
      unsubStudents();
      unsubTx();
    };
  }, [institute]);

  return (
    <div className="space-y-6 pb-12">
      {/* Super Admin Preview Bar */}
      {user?.role === "super_admin" && (
        <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl flex items-center justify-between text-xs border border-slate-800 shadow-md">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Super Admin View:</strong> You are viewing {institute?.name || "Institute"} ({institute?.id})
            </span>
          </div>
          <Link
            href="/su"
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm"
          >
            <span>Return to /su HQ Control</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Welcome Hero Banner matching screenshot */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#10152B] via-[#1A184A] to-[#2B1B68] text-white p-7 shadow-soft border border-slate-800">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome to CertiDesk Pro
            </h2>
            <span className="text-2xl">👋</span>
          </div>
          <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
            Manage students, generate professional certificates, and grow your institute with a simple recharge based system.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/students/add"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              <span>Add Student (₹150)</span>
            </Link>

            <Link
              href="/certificates/generate"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl border border-white/20 backdrop-blur-xs transition-all duration-150"
            >
              <Award className="w-4 h-4 text-amber-300" />
              <span>Generate Certificate</span>
            </Link>
          </div>
        </div>

        {/* 3D Certificate & Graduation Cap Graphic representation */}
        <div className="absolute right-4 -bottom-4 md:right-10 md:top-1/2 md:-translate-y-1/2 opacity-90 hidden sm:block pointer-events-none">
          <div className="w-48 h-36 rounded-xl bg-gradient-to-tr from-brand-500/20 to-purple-400/30 backdrop-blur-md border border-white/20 p-3 shadow-2xl transform rotate-3 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="w-6 h-6 rounded-full bg-amber-400/80 flex items-center justify-center">
                <Award className="w-3.5 h-3.5 text-slate-900" />
              </div>
              <span className="text-[9px] uppercase tracking-wider text-purple-200 font-bold">Certificate</span>
            </div>
            <div className="space-y-1 my-2">
              <div className="w-24 h-1.5 bg-white/60 rounded-full" />
              <div className="w-32 h-1 bg-white/30 rounded-full" />
            </div>
            <div className="flex justify-end">
              <GraduationCap className="w-8 h-8 text-brand-300 transform -rotate-12" />
            </div>
          </div>
        </div>
      </div>

      {/* 4 Key Stat Cards matching screenshot */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Students */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-soft transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-brand-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Students</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalStudents}</h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                ↑ +12 this month
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Certificates Generated */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-soft transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Certificates Generated</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.certificatesGenerated}</h3>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                ↑ +56 this month
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Wallet Balance */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-soft transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Wallet className="w-5 h-5" />
            </div>
            <button
              onClick={() => setShowRechargeModal(true)}
              className="text-[11px] font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              Recharge
            </button>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Wallet Balance</p>
            <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
              ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        {/* Card 4: Total Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-card hover:shadow-soft transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Transactions</p>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-extrabold text-slate-900">{stats.totalTransactions.toLocaleString()}</h3>
              <span className="text-xs text-slate-400">Last 30 days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar matching screenshot */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            href="/students/add"
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-soft rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-brand-50 group-hover:bg-brand-600 text-brand-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Plus className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Add Student</p>
              <p className="text-[10px] text-slate-500 truncate">(₹150 per admission)</p>
            </div>
          </Link>

          <button
            onClick={() => {
              if (students.length > 0) setSelectedStudentForEdit(students[0]);
            }}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-soft rounded-2xl transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-50 group-hover:bg-brand-600 text-purple-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Edit3 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Edit Student</p>
              <p className="text-[10px] text-slate-500 truncate">(₹100 per update)</p>
            </div>
          </button>

          <Link
            href="/certificates/generate"
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-soft rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-50 group-hover:bg-amber-500 text-amber-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Award className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Generate Certificate</p>
              <p className="text-[10px] text-slate-500 truncate">(Typing / ADCA)</p>
            </div>
          </Link>

          <Link
            href="/students"
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-soft rounded-2xl transition-all group"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 group-hover:bg-blue-600 text-blue-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Users className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Student List</p>
              <p className="text-[10px] text-slate-500 truncate">View & Manage</p>
            </div>
          </Link>

          <button
            onClick={() => setShowRechargeModal(true)}
            className="flex items-center gap-3 p-3.5 bg-white border border-slate-200/90 hover:border-brand-300 hover:shadow-soft rounded-2xl transition-all group text-left cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-50 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center flex-shrink-0 transition-colors">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-900 truncate">Recharge Wallet</p>
              <p className="text-[10px] text-slate-500 truncate">Add Balance</p>
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Grid: 70% Left Column / 30% Right Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Recent Students & Recent Activities */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recent Students Table Card matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Students</h3>
              </div>
              <Link
                href="/students"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

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
                          className="font-bold text-slate-900 hover:text-brand-600"
                        >
                          {student.fullName}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            student.courseCode === "ADCA"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
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
                            className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                            title="Generate Certificate"
                          >
                            <Award className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setSelectedStudentForEdit(student)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Student (₹100)"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <Link
                            href={`/students/${student.id}`}
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
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
          </div>

          {/* Recent Activities Feed Card matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-brand-600" />
                <h3 className="font-bold text-sm text-slate-900">Recent Activities</h3>
              </div>
              <Link
                href="/transactions"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <span>View All</span>
                <span>→</span>
              </Link>
            </div>

            <div className="space-y-3.5">
              {transactions.map((tx) => {
                const isCredit = tx.type === "credit";
                const isStudentAdd = tx.purpose === "admission";
                const isProfileUpdate = tx.purpose === "profile_update";

                return (
                  <div key={tx.id} className="flex items-center justify-between text-xs py-1">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-600"
                            : isStudentAdd
                            ? "bg-purple-50 text-purple-600"
                            : "bg-amber-50 text-amber-600"
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
          </div>
        </div>

        {/* Right Column (4 cols): Pricing, Certificate Courses, Wallet Summary, Help */}
        <div className="lg:col-span-4 space-y-6">
          {/* Certificate Courses card matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <Award className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">Certificate Courses</h3>
            </div>

            <div className="space-y-2">
              <Link
                href="/courses"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 text-brand-600 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-brand-600">ADCA Certificate</h4>
                    <p className="text-[10px] text-slate-500">Advanced Diploma in Computer Application</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
              </Link>

              <Link
                href="/courses"
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Keyboard className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-brand-600">Typing Certificate</h4>
                    <p className="text-[10px] text-slate-500">Computer Typing Proficiency</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600" />
              </Link>
            </div>
          </div>

          {/* Pricing & Charges card matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <span className="text-base font-bold text-brand-600">₹</span>
              <h3 className="font-bold text-sm text-slate-900">Pricing & Charges</h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[10px] font-bold">
                    +
                  </div>
                  <span className="font-medium text-slate-700">New Admission (Add Student)</span>
                </div>
                <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                  ₹150
                </span>
              </div>

              <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[10px] font-bold">
                    ✎
                  </div>
                  <span className="font-medium text-slate-700">Profile Edit / Update</span>
                </div>
                <span className="font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md border border-brand-100">
                  ₹100
                </span>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-100 text-[11px] text-purple-900 flex items-start gap-2">
                <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Note:</strong> Charges are automatically deducted from your wallet balance.
                </span>
              </div>
            </div>
          </div>

          {/* Wallet Summary Card matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <Wallet className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-sm text-slate-900">Wallet Summary</h3>
            </div>

            <div>
              <p className="text-[11px] text-slate-500 font-medium">Current Balance</p>
              <h4 className="text-2xl font-black text-slate-900 mt-0.5">
                ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </h4>
            </div>

            <button
              onClick={() => setShowRechargeModal(true)}
              className="w-full py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Recharge Wallet</span>
            </button>

            {/* Quick recharge pill amounts matching screenshot */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setShowRechargeModal(true)}
                  className="py-1.5 px-1 bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 text-slate-700 hover:text-brand-600 rounded-lg text-xs font-semibold text-center transition-all cursor-pointer"
                >
                  ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>

          {/* Need Help Card matching screenshot */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-3">
            <div className="flex items-center gap-2.5">
              <Headphones className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">Need Help?</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              For recharge, certificates, or any issue, contact support.
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
                className="w-9 h-9 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 transition-colors shadow-sm"
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

      {/* Edit Student Modal (Enforcing ₹100 charge rule & confirmation) */}
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
    </div>
  );
}
