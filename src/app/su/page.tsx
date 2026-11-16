"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Building, 
  Users, 
  Wallet, 
  Award, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Plus, 
  Search, 
  TrendingUp, 
  Settings, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  BookOpen,
  DollarSign,
  ShieldAlert,
  Sliders,
  Filter,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Key,
  Copy,
  Check,
  FileCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Institute, WalletTransaction, Student, Course, AuditLog } from "@/types";
import { 
  subscribeRealtimeAllInstitutes, 
  subscribeRealtimeAllStudents, 
  subscribeRealtimeAllTransactions 
} from "@/lib/firebase/services";
import { AlertModal } from "@/components/ui/FeedbackModal";

export default function SuperAdminMasterControlPage() {
  const { user, switchInstitute } = useAuth();
  
  // Data states
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [students, setAllStudents] = useState<Student[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: institutes | students | courses | financials | audit
  const [activeTab, setActiveTab] = useState<"institutes" | "students" | "courses" | "financials" | "audit">("institutes");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("all");

  // Modals
  const [showCreditModal, setShowCreditModal] = useState<Institute | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1000);
  const [creditType, setCreditType] = useState<"credit" | "debit">("credit");
  const [creditNote, setCreditNote] = useState<string>("HQ Promotional Bonus");

  const [showFeeModal, setShowFeeModal] = useState<Institute | null>(null);
  const [admissionFee, setAdmissionFee] = useState<number>(150);
  const [profileEditFee, setProfileEditFee] = useState<number>(100);
  const [certificateFee, setCertificateFee] = useState<number>(0);
  const [marksheetFee, setMarksheetFee] = useState<number>(0);
  const [feedbackAlert, setFeedbackAlert] = useState<{ title: string; message: string; type: "success" | "error" | "info" } | null>(null);

  const [showAddInstituteModal, setShowAddInstituteModal] = useState(false);
  const [newInstName, setNewInstName] = useState("");
  const [newInstOwner, setNewInstOwner] = useState("");
  const [newInstEmail, setNewInstEmail] = useState("");
  const [newInstPassword, setNewInstPassword] = useState("Institute@123456");
  const [newInstInitialWallet, setNewInstInitialWallet] = useState<number>(1000);
  const [newInstMobile, setNewInstMobile] = useState("");
  const [newInstCity, setNewInstCity] = useState("");
  const [newInstState, setNewInstState] = useState("Uttar Pradesh");

  // Manage Credentials Modal
  const [showCredentialsModal, setShowCredentialsModal] = useState<Institute | null>(null);
  const [editPassword, setEditPassword] = useState("");
  const [createdCredentialsAlert, setCreatedCredentialsAlert] = useState<{
    id: string;
    name: string;
    email: string;
    password: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const inst = await dataStore.getAllInstitutes();
      const st = await dataStore.getAllStudents();
      const tx = await dataStore.getAllTransactions();
      const crs = await dataStore.getCourses("SBCI1001");
      const logs = await dataStore.getAuditLogs();

      setInstitutes(inst);
      setAllStudents(st);
      setTransactions(tx);
      setCourses(crs);
      setAuditLogs(logs);
    } catch (e) {
      console.error("Super Admin load error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Realtime listeners for Master Super Admin
    const unsubInstitutes = subscribeRealtimeAllInstitutes((liveInsts) => {
      if (liveInsts.length > 0) setInstitutes(liveInsts);
    });

    const unsubStudents = subscribeRealtimeAllStudents((liveStudents) => {
      if (liveStudents.length > 0) setAllStudents(liveStudents);
    });

    const unsubTx = subscribeRealtimeAllTransactions((liveTx) => {
      if (liveTx.length > 0) setTransactions(liveTx);
    });

    return () => {
      unsubInstitutes();
      unsubStudents();
      unsubTx();
    };
  }, []);

  // Platform Metrics
  const totalPlatformRechargeRevenue = transactions
    .filter((t) => t.purpose === "recharge")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalPlatformUsageConsumed = transactions
    .filter((t) => t.purpose === "admission" || t.purpose === "profile_update")
    .reduce((acc, t) => acc + t.amount, 0);

  // Status Change (Approve / Suspend)
  const handleStatusChange = async (id: string, status: "active" | "pending" | "suspended") => {
    await dataStore.updateInstituteStatus(id, status);
    await loadData();
  };

  // Adjust Wallet Balance / Credit Grant
  const handleSaveWalletAdjustment = async () => {
    if (!showCreditModal) return;
    try {
      if (creditType === "credit") {
        await dataStore.creditPromoBalance(showCreditModal.id, creditAmount, creditNote);
      } else {
        await dataStore.deductWallet(
          showCreditModal.id,
          creditAmount,
          "profile_update",
          `HQ Admin Debit: ₹${creditAmount} - ${creditNote}`
        );
      }
      setShowCreditModal(null);
      await loadData();
      setFeedbackAlert({
        title: "Wallet Updated",
        message: `Successfully adjusted wallet for ${showCreditModal.name}.`,
        type: "success"
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Adjustment Failed",
        message: err.message || "Failed to adjust wallet",
        type: "error"
      });
    }
  };

  // Update Institute Fee Rules
  const handleSaveFeeRules = async () => {
    if (!showFeeModal) return;
    try {
      await dataStore.updateInstitute(showFeeModal.id, {
        settings: {
          ...showFeeModal.settings,
          admissionFee,
          profileEditFee,
          certificateFee,
          marksheetFee,
        },
      });
      setShowFeeModal(null);
      await loadData();
      setFeedbackAlert({
        title: "Fee Rules Applied",
        message: `Updated pricing for ${showFeeModal.name}: Admission ₹${admissionFee}, Profile Edit ₹${profileEditFee}, Certificate ₹${certificateFee}, Marksheet ₹${marksheetFee}.`,
        type: "success"
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Update Failed",
        message: err.message || "Failed to save fee rules",
        type: "error"
      });
    }
  };

  // Create Institute from HQ
  const handleCreateInstituteHQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await dataStore.createInstitute({
        name: newInstName,
        code: newInstName.slice(0, 4).toUpperCase(),
        ownerName: newInstOwner,
        email: newInstEmail,
        password: newInstPassword || "Institute@123456",
        mobile: newInstMobile,
        address: `${newInstCity}, ${newInstState}`,
        district: newInstCity,
        state: newInstState,
        pincode: "273001",
        status: "active",
        walletBalance: Number(newInstInitialWallet) || 1000,
        assignedCourses: ["c-adca", "c-typ", "c-dca"],
        settings: {
          admissionFee: 150,
          profileEditFee: 100,
          certificateFee: 0,
          marksheetFee: 0,
          autoApproveStudents: true,
        },
      });

      setShowAddInstituteModal(false);
      setCreatedCredentialsAlert({
        id: created.id,
        name: created.name,
        email: created.email,
        password: newInstPassword || "Institute@123456",
      });

      setNewInstName("");
      setNewInstOwner("");
      setNewInstEmail("");
      setNewInstPassword("Institute@123456");
      setNewInstInitialWallet(1000);
      setNewInstMobile("");
      setNewInstCity("");
      await loadData();
    } catch (err: any) {
      setFeedbackAlert({
        title: "Onboarding Failed",
        message: err.message || "Failed to create institute",
        type: "error"
      });
    }
  };

  // Update Institute Password / Credentials
  const handleSaveCredentials = async () => {
    if (!showCredentialsModal || !editPassword.trim()) return;
    try {
      await dataStore.updateInstitutePassword(showCredentialsModal.id, editPassword.trim());
      setShowCredentialsModal(null);
      setEditPassword("");
      await loadData();
      setFeedbackAlert({
        title: "Credentials Updated",
        message: `Password updated successfully for ${showCredentialsModal.name}.`,
        type: "success"
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Password Update Failed",
        message: err.message || "Failed to update password",
        type: "error"
      });
    }
  };

  // Filters
  const filteredInstitutes = institutes.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.ownerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobile.includes(searchQuery);
    const matchesInst = instituteFilter === "all" || s.instituteId === instituteFilter;
    return matchesSearch && matchesInst;
  });

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top HQ Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-xs">
                HQ Master Control
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Realtime Active
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              Platform Master Control Plane
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Complete multi-tenant authority: Manage institutes, student rosters nationwide, course catalogs, wallet balances, and pricing rules.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAddInstituteModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Onboard Institute</span>
            </button>

            <Link
              href="/certificates/templates"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all"
            >
              <Award className="w-4 h-4 text-purple-300" />
              <span>Certificate Studio</span>
            </Link>

            <Link
              href="/certificates/history"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all"
            >
              <FileCheck className="w-4 h-4 text-emerald-300" />
              <span>Certificates Ledger</span>
            </Link>

            <Link
              href="/verify"
              target="_blank"
              className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/20 backdrop-blur-xs transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-300" />
              <span>Public Verification</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Global Stat Cards (Light Mode) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Institutes */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6529E8] flex items-center justify-center mb-3">
            <Building className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">Total Registered Institutes</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900">{institutes.length}</h3>
            <span className="text-xs font-bold text-emerald-600">
              {institutes.filter((i) => i.status === "active").length} Active
            </span>
          </div>
        </div>

        {/* Card 2: Students */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">Total Students Nationwide</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900">{students.length}</h3>
            <span className="text-xs text-slate-400">Across all centers</span>
          </div>
        </div>

        {/* Card 3: Platform Recharges */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">Gross Platform Inflow (Recharges)</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-emerald-700 font-mono">
              ₹ {totalPlatformRechargeRevenue.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>

        {/* Card 4: Platform Consumption */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-card">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <Wallet className="w-5 h-5" />
          </div>
          <p className="text-xs text-slate-500 font-semibold">Admission & Edit Charges Billed</p>
          <div className="flex items-baseline gap-2 mt-1">
            <h3 className="text-2xl font-black text-slate-900 font-mono">
              ₹ {totalPlatformUsageConsumed.toLocaleString("en-IN")}
            </h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs (Master Control Modules) */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab("institutes")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "institutes"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Institutes Manager ({institutes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "students"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>All Students Database ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("courses")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "courses"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Master Courses Catalog ({courses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("financials")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "financials"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Platform Ledger ({transactions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>System Audit Logs ({auditLogs.length})</span>
        </button>
      </div>

      {/* TAB 1: INSTITUTES MANAGEMENT */}
      {activeTab === "institutes" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Institutes Control & Directory</h2>
              <p className="text-xs text-slate-500">
                Grant promotional wallet credits, edit fee rules, approve centers, or access their view.
              </p>
            </div>

            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by institute name, ID, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Center ID</th>
                  <th className="p-3.5">Institute Details</th>
                  <th className="p-3.5">Owner & Contact</th>
                  <th className="p-3.5">Login Credentials</th>
                  <th className="p-3.5">Wallet Balance</th>
                  <th className="p-3.5">Pricing Rules</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInstitutes.map((inst) => (
                  <tr key={inst.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-[#6529E8]">{inst.id}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm">{inst.name}</p>
                      <p className="text-[11px] text-slate-500">{inst.district}, {inst.state}</p>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{inst.ownerName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{inst.mobile}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{inst.email}</p>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-1 bg-slate-50 border border-slate-200/80 p-2 rounded-xl">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-semibold">User ID:</span>
                          <span className="font-mono font-bold text-[#6529E8]">{inst.id}</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-400 font-semibold">Pass:</span>
                          <span className="font-mono text-slate-700 font-medium">{inst.password || "Institute@123456"}</span>
                        </div>
                        <button
                          onClick={() => {
                            setShowCredentialsModal(inst);
                            setEditPassword(inst.password || "Institute@123456");
                          }}
                          className="w-full text-center text-[10px] text-indigo-600 hover:text-indigo-800 font-bold flex items-center justify-center gap-1 pt-1 border-t border-slate-200/60 cursor-pointer"
                        >
                          <Key className="w-2.5 h-2.5" />
                          <span>Set Password</span>
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          ₹ {inst.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </span>
                        <button
                          onClick={() => {
                            setShowCreditModal(inst);
                            setCreditAmount(1000);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200"
                          title="Adjust balance / Grant promo credit"
                        >
                          ± Edit
                        </button>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <button
                        onClick={() => {
                          setShowFeeModal(inst);
                          setAdmissionFee(inst.settings.admissionFee ?? 150);
                          setProfileEditFee(inst.settings.profileEditFee ?? 100);
                          setCertificateFee(inst.settings.certificateFee ?? 0);
                          setMarksheetFee(inst.settings.marksheetFee ?? 0);
                        }}
                        className="text-[11px] font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1"
                      >
                        <Sliders className="w-3 h-3" />
                        <span>₹{inst.settings.admissionFee} Adm / ₹{inst.settings.profileEditFee} Edit / ₹{inst.settings.certificateFee ?? 0} Cert</span>
                      </button>
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          inst.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : inst.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {inst.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Status Toggle */}
                        {inst.status !== "active" ? (
                          <button
                            onClick={() => handleStatusChange(inst.id, "active")}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-xs cursor-pointer"
                          >
                            Approve
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(inst.id, "suspended")}
                            className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] border border-rose-200 cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}

                        {/* Login as Institute */}
                        <button
                          onClick={async () => {
                            await switchInstitute(inst.id);
                            window.location.href = "/";
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer"
                          title="Open this institute's portal"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Login As</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS MASTER ROSTER */}
      {activeTab === "students" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">National Students Master Roster</h2>
              <p className="text-xs text-slate-500">Cross-tenant student records across all educational institutes.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Institute Filter */}
              <select
                value={instituteFilter}
                onChange={(e) => setInstituteFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
              >
                <option value="all">All Institutes ({institutes.length})</option>
                {institutes.map((i) => (
                  <option key={i.id} value={i.id}>{i.name} ({i.id})</option>
                ))}
              </select>

              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search students..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Enrollment No</th>
                  <th className="p-3.5">Student Name</th>
                  <th className="p-3.5">Institute Center</th>
                  <th className="p-3.5">Course</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-[#6529E8]">{st.enrollmentNo}</td>
                    <td className="p-3.5 font-bold text-slate-900">{st.fullName}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-800">
                        {institutes.find((i) => i.id === st.instituteId)?.name || st.instituteId}
                      </span>
                      <p className="text-[10px] text-slate-400 font-mono">{st.instituteId}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold text-[10px]">
                        {st.courseName}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-600">{st.mobile}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {st.status}
                      </span>
                    </td>
                    <td className="p-3.5 text-center">
                      <Link
                        href={`/students/${st.id}`}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MASTER COURSES */}
      {activeTab === "courses" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Global Course Catalog</h2>
              <p className="text-xs text-slate-500">Master syllabus and curriculum available to all institutes.</p>
            </div>
            <Link
              href="/courses"
              className="px-3.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-500"
            >
              + Create Global Course
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((crs) => (
              <div key={crs.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-indigo-100 text-indigo-700">
                    {crs.code}
                  </span>
                  <span className="text-xs font-bold text-slate-900">₹{crs.fee.toLocaleString()}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{crs.name}</h4>
                <p className="text-xs text-slate-500">{crs.duration} Duration</p>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
                  <span>{crs.subjects?.length || 0} Core Subjects</span>
                  <span className="text-emerald-600 font-bold">Enabled Globally</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PLATFORM FINANCIALS */}
      {activeTab === "financials" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="border-b pb-4">
            <h2 className="text-base font-extrabold text-slate-900">Platform Financial Ledger</h2>
            <p className="text-xs text-slate-500">Live feed of all wallet recharges and billing deductions nationwide.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Tx ID</th>
                  <th className="p-3.5">Institute</th>
                  <th className="p-3.5">Type & Purpose</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {transactions.slice(0, 20).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{tx.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{tx.instituteId}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        tx.type === "credit" ? "bg-emerald-100 text-emerald-700" : "bg-purple-100 text-[#6529E8]"
                      }`}>
                        {tx.type.toUpperCase()} ({tx.purpose})
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{tx.description}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900">
                      {tx.type === "credit" ? "+" : "-"} ₹{tx.amount.toLocaleString()}
                    </td>
                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(tx.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM AUDIT LOGS */}
      {activeTab === "audit" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="border-b pb-4">
            <h2 className="text-base font-extrabold text-slate-900">System Security Audit Logs</h2>
            <p className="text-xs text-slate-500">Complete audit trail of actions taken across the entire SaaS platform.</p>
          </div>

          <div className="divide-y divide-slate-100 font-mono text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                      {log.action}
                    </span>
                    <span className="text-slate-900 font-bold font-sans text-xs">{log.instituteId}</span>
                    <span className="text-slate-400 text-[11px]">({log.userEmail})</span>
                  </div>
                  <p className="text-slate-600 font-sans text-xs">{log.details}</p>
                </div>
                <span className="text-slate-400 text-[10px] whitespace-nowrap">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: WALLET ADJUSTMENT & PROMO CREDIT */}
      {showCreditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Adjust Wallet: {showCreditModal.name} ({showCreditModal.id})
              </h3>
              <button onClick={() => setShowCreditModal(null)} className="text-slate-400 hover:text-slate-700 text-lg">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Current Balance: <strong className="text-slate-900 font-mono">₹{showCreditModal.walletBalance.toLocaleString()}</strong>
            </p>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl font-bold">
                <button
                  type="button"
                  onClick={() => setCreditType("credit")}
                  className={`py-2 rounded-lg transition-all ${
                    creditType === "credit" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600"
                  }`}
                >
                  + Add Credit (Grant)
                </button>
                <button
                  type="button"
                  onClick={() => setCreditType("debit")}
                  className={`py-2 rounded-lg transition-all ${
                    creditType === "debit" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600"
                  }`}
                >
                  - Deduct Balance
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Amount (₹)</label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-sm"
                  min="1"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  placeholder="e.g. Welcome promo / refund"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreditModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWalletAdjustment}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT PRICING RULES */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Pricing Rules: {showFeeModal.name}
              </h3>
              <button onClick={() => setShowFeeModal(null)} className="text-slate-400 hover:text-slate-700 text-lg">
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Configure how much is deducted from this center's wallet per action.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Student Admission Fee (₹)</label>
                <input
                  type="number"
                  value={admissionFee}
                  onChange={(e) => setAdmissionFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
                />
                <span className="text-[10px] text-slate-400">Default: ₹150</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Profile Edit / Update Fee (₹)</label>
                <input
                  type="number"
                  value={profileEditFee}
                  onChange={(e) => setProfileEditFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
                />
                <span className="text-[10px] text-slate-400">Default: ₹100</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Certificate Generation Fee (₹)</label>
                <input
                  type="number"
                  value={certificateFee}
                  onChange={(e) => setCertificateFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
                />
                <span className="text-[10px] text-slate-400">0 for free generation</span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Marksheet Generation Fee (₹)</label>
                <input
                  type="number"
                  value={marksheetFee}
                  onChange={(e) => setMarksheetFee(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold font-mono"
                />
                <span className="text-[10px] text-slate-400">0 for free generation</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowFeeModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveFeeRules}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                Save Fee Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATE INSTITUTE */}
      {showAddInstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <form onSubmit={handleCreateInstituteHQ} className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                + Onboard Educational Institute (HQ)
              </h3>
              <button type="button" onClick={() => setShowAddInstituteModal(false)} className="text-slate-400 hover:text-slate-700 text-lg">
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Institute Name</label>
                <input
                  type="text"
                  required
                  value={newInstName}
                  onChange={(e) => setNewInstName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  placeholder="e.g. Royal Academy of Computer Education"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={newInstOwner}
                    onChange={(e) => setNewInstOwner(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    value={newInstMobile}
                    onChange={(e) => setNewInstMobile(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                    placeholder="9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newInstEmail}
                  onChange={(e) => setNewInstEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  placeholder="center@example.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District / City</label>
                  <input
                    type="text"
                    required
                    value={newInstCity}
                    onChange={(e) => setNewInstCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                    placeholder="e.g. Varanasi"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={newInstState}
                    onChange={(e) => setNewInstState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                    placeholder="Uttar Pradesh"
                  />
                </div>
              </div>

              {/* Security & Credentials */}
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-3">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold text-xs">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Login Credentials & Wallet Setup</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Login Password</label>
                    <input
                      type="text"
                      required
                      value={newInstPassword}
                      onChange={(e) => setNewInstPassword(e.target.value)}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-medium"
                      placeholder="e.g. Institute@123456"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Initial Wallet (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={100}
                      value={newInstInitialWallet}
                      onChange={(e) => setNewInstInitialWallet(Number(e.target.value))}
                      className="w-full p-2 bg-white border border-indigo-200 rounded-xl font-mono font-medium"
                      placeholder="1000"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-slate-500">
                  Institute Admin will log in at <span className="font-mono font-bold text-slate-700">/login</span> using their generated Institute ID or Email and this password.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowAddInstituteModal(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Create Institute Account
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 4: EDIT CREDENTIALS / PASSWORD */}
      {showCredentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Manage Institute Credentials
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    ID: {showCredentialsModal.id} ({showCredentialsModal.name})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCredentialsModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Institute ID:</span>
                  <span className="font-mono font-bold text-[#6529E8] text-sm">{showCredentialsModal.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Registered Email:</span>
                  <span className="font-medium text-slate-800">{showCredentialsModal.email}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Set New Login Password
                </label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter new password"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Once saved, the institute admin can immediately log in with this new password at /login.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setShowCredentialsModal(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCredentials}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Save & Update Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: CREATED INSTITUTE CREDENTIALS ALERT */}
      {createdCredentialsAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-emerald-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    Institute Created Successfully!
                  </h3>
                  <p className="text-[10px] text-slate-500">{createdCredentialsAlert.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCreatedCredentialsAlert(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl space-y-2 text-xs">
              <p className="text-emerald-900 font-bold mb-2">Login Credentials for Institute Admin:</p>
              
              <div className="flex justify-between items-center py-1 border-b border-emerald-100 font-mono">
                <span className="text-slate-600 font-sans">Institute ID:</span>
                <span className="font-bold text-[#6529E8] text-sm">{createdCredentialsAlert.id}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100 font-mono">
                <span className="text-slate-600 font-sans">Login Email:</span>
                <span className="font-semibold text-slate-800">{createdCredentialsAlert.email}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-emerald-100 font-mono">
                <span className="text-slate-600 font-sans">Password:</span>
                <span className="font-bold text-slate-900">{createdCredentialsAlert.password}</span>
              </div>
              <div className="flex justify-between items-center py-1 font-mono">
                <span className="text-slate-600 font-sans">Login URL:</span>
                <span className="text-slate-700 text-[11px]">/login</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const copyText = `*CertiDesk Pro - Institute Credentials*\nInstitute Name: ${createdCredentialsAlert.name}\nInstitute ID: ${createdCredentialsAlert.id}\nEmail: ${createdCredentialsAlert.email}\nPassword: ${createdCredentialsAlert.password}\nLogin Portal: /login`;
                  navigator.clipboard.writeText(copyText);
                  setCopiedId(createdCredentialsAlert.id);
                  setTimeout(() => setCopiedId(null), 2500);
                }}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                {copiedId === createdCredentialsAlert.id ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Credentials</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setCreatedCredentialsAlert(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global In-App Feedback / Error / Success Modal */}
      {feedbackAlert && (
        <AlertModal
          isOpen={Boolean(feedbackAlert)}
          title={feedbackAlert.title}
          message={feedbackAlert.message}
          type={feedbackAlert.type}
          buttonText="Understood"
          onClose={() => setFeedbackAlert(null)}
        />
      )}
    </div>
  );
}
