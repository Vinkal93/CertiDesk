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
  FileCheck,
  Palette,
  Clock,
  Crown,
  UserPlus,
  Lock,
  Shield
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore, PlatformSettings } from "@/lib/db";
import { Institute, WalletTransaction, Student, Course, AuditLog, SuperAdminUser, AccountStatus } from "@/types";
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

  // Active Tab: institutes | students | courses | financials | audit | branding | super_admins
  const [activeTab, setActiveTab] = useState<"institutes" | "students" | "courses" | "financials" | "audit" | "branding" | "super_admins">("institutes");

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [instituteFilter, setInstituteFilter] = useState("all");

  // Super Admins Management State
  const [superAdmins, setSuperAdmins] = useState<any[]>([]);
  const [showCreateSuperAdminModal, setShowCreateSuperAdminModal] = useState(false);
  const [showEditSuperAdminModal, setShowEditSuperAdminModal] = useState<any | null>(null);
  const [newSuName, setNewSuName] = useState("");
  const [newSuEmail, setNewSuEmail] = useState("");
  const [newSuPassword, setNewSuPassword] = useState("");
  const [newSuPin, setNewSuPin] = useState("");
  const [newSuPermissions, setNewSuPermissions] = useState({
    canManageInstitutes: true,
    canManageSuperAdmins: true,
    canManageFinancials: true,
    canManageBranding: true,
    canManageAuditLogs: true,
  });

  const [editSuName, setEditSuName] = useState("");
  const [editSuStatus, setEditSuStatus] = useState<"active" | "suspended">("active");
  const [editSuPassword, setEditSuPassword] = useState("");
  const [editSuPin, setEditSuPin] = useState("");
  const [editSuPermissions, setEditSuPermissions] = useState({
    canManageInstitutes: true,
    canManageSuperAdmins: true,
    canManageFinancials: true,
    canManageBranding: true,
    canManageAuditLogs: true,
  });

  // Edit Institute Full Details Modal
  const [showEditInstituteModal, setShowEditInstituteModal] = useState<Institute | null>(null);
  const [editInstName, setEditInstName] = useState("");
  const [editInstOwner, setEditInstOwner] = useState("");
  const [editInstEmail, setEditInstEmail] = useState("");
  const [editInstMobile, setEditInstMobile] = useState("");
  const [editInstAddress, setEditInstAddress] = useState("");
  const [editInstDistrict, setEditInstDistrict] = useState("");
  const [editInstState, setEditInstState] = useState("");
  const [editInstPincode, setEditInstPincode] = useState("");
  const [editInstStatus, setEditInstStatus] = useState<AccountStatus>("active");

  // Platform Branding & Theme settings
  const [platformSettings, setPlatformSettings] = useState<PlatformSettings>({
    siteTitle: "CertiDesk Pro",
    siteSubtitle: "Institute & Certificate Management SaaS",
    logoUrl: "",
    primaryColor: "#0F172A",
    buttonRadius: "12px",
    themePreset: "slate",
  });

  // Modals
  const [showCreditModal, setShowCreditModal] = useState<Institute | null>(null);
  const [creditAmount, setCreditAmount] = useState<number>(1000);
  const [creditType, setCreditType] = useState<"credit" | "debit" | "set_exact">("credit");
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
      const ps = await dataStore.getPlatformSettings();

      setInstitutes(inst);
      setAllStudents(st);
      setTransactions(tx);
      setCourses(crs);
      setAuditLogs(logs);
      if (ps) setPlatformSettings(ps);

      // Fetch Super Admins
      fetch("/api/admin/super-admins")
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.superAdmins) {
            setSuperAdmins(d.superAdmins);
          }
        })
        .catch(console.warn);
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

  // Adjust Wallet Balance / Credit Grant / Exact Overwrite
  const handleSaveWalletAdjustment = async () => {
    if (!showCreditModal) return;
    try {
      if (creditType === "credit") {
        await dataStore.creditPromoBalance(showCreditModal.id, creditAmount, creditNote);
      } else if (creditType === "debit") {
        await dataStore.deductWallet(
          showCreditModal.id,
          creditAmount,
          "profile_update",
          `HQ Admin Debit: ₹${creditAmount} - ${creditNote}`
        );
      } else {
        await dataStore.setExactWalletBalance(showCreditModal.id, creditAmount, creditNote);
      }
      setShowCreditModal(null);
      await loadData();
      setFeedbackAlert({
        title: "Wallet Updated",
        message: creditType === "set_exact" 
          ? `Successfully overwritten wallet balance to ₹${creditAmount.toLocaleString()} for ${showCreditModal.name}.`
          : `Successfully adjusted wallet for ${showCreditModal.name}.`,
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

  // Save Platform Theme, Colors & Branding
  const handleSavePlatformSettings = async () => {
    try {
      const updated = await dataStore.updatePlatformSettings(platformSettings);
      if (typeof document !== "undefined") {
        document.documentElement.style.setProperty("--theme-primary", updated.primaryColor);
        document.documentElement.style.setProperty("--theme-radius", updated.buttonRadius);
      }
      setFeedbackAlert({
        title: "Platform Branding Saved",
        message: "Platform title, colors, button styles and logo updated successfully across the system.",
        type: "success"
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Save Failed",
        message: err.message || "Failed to save platform settings",
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
      const res = await fetch("/api/admin/provision-institute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
          walletBalance: Number(newInstInitialWallet) || 1000,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to provision institute.");
      }

      const created = data.institute;

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
      const res = await fetch("/api/admin/update-credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituteId: showCredentialsModal.id,
          newPassword: editPassword.trim(),
          email: showCredentialsModal.email,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update credentials.");
      }

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

  // Super Admin CRUD Handlers
  const handleCreateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!newSuPin || newSuPin.length !== 6) {
        throw new Error("Security PIN must be exactly 6 numeric digits.");
      }

      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: newSuName.trim(),
          email: newSuEmail.trim(),
          password: newSuPassword.trim(),
          pin: newSuPin.trim(),
          permissions: newSuPermissions,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to create Super Admin.");
      }

      setShowCreateSuperAdminModal(false);
      setNewSuName("");
      setNewSuEmail("");
      setNewSuPassword("");
      setNewSuPin("");
      await loadData();

      setFeedbackAlert({
        title: "Super Admin Created",
        message: `Successfully provisioned Super Admin ${data.admin.name} (${data.admin.email}).`,
        type: "success",
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Creation Failed",
        message: err.message || "Failed to create Super Admin account.",
        type: "error",
      });
    }
  };

  const handleUpdateSuperAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditSuperAdminModal) return;
    try {
      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          id: showEditSuperAdminModal.id,
          name: editSuName.trim(),
          status: editSuStatus,
          permissions: editSuPermissions,
          newPassword: editSuPassword.trim() || undefined,
          newPin: editSuPin.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to update Super Admin.");
      }

      setShowEditSuperAdminModal(null);
      setEditSuPassword("");
      setEditSuPin("");
      await loadData();

      setFeedbackAlert({
        title: "Super Admin Updated",
        message: `Updated account details for ${showEditSuperAdminModal.name}.`,
        type: "success",
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Update Failed",
        message: err.message || "Failed to update Super Admin.",
        type: "error",
      });
    }
  };

  const handleDeleteSuperAdmin = async (admin: any) => {
    if (!confirm(`Are you sure you want to delete Super Admin "${admin.name}" (${admin.email})?`)) {
      return;
    }
    try {
      const res = await fetch("/api/admin/super-admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete",
          id: admin.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete Super Admin.");
      }

      await loadData();
      setFeedbackAlert({
        title: "Super Admin Deleted",
        message: `Account for ${admin.name} deleted successfully.`,
        type: "success",
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Deletion Failed",
        message: err.message || "Failed to delete Super Admin.",
        type: "error",
      });
    }
  };

  // Full Institute Details Edit Handler
  const handleSaveInstituteDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditInstituteModal) return;
    try {
      await dataStore.updateInstitute(showEditInstituteModal.id, {
        name: editInstName.trim(),
        ownerName: editInstOwner.trim(),
        email: editInstEmail.trim(),
        mobile: editInstMobile.trim(),
        address: editInstAddress.trim(),
        district: editInstDistrict.trim(),
        state: editInstState.trim(),
        pincode: editInstPincode.trim(),
        status: editInstStatus,
      });

      setShowEditInstituteModal(null);
      await loadData();

      setFeedbackAlert({
        title: "Institute Updated",
        message: `Successfully saved profile and contact details for ${editInstName}.`,
        type: "success",
      });
    } catch (err: any) {
      setFeedbackAlert({
        title: "Update Failed",
        message: err.message || "Failed to save institute details.",
        type: "error",
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

        <button
          onClick={() => setActiveTab("branding")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "branding"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Palette className="w-4 h-4 text-purple-400" />
          <span>Branding & Theme Studio</span>
        </button>

        <button
          onClick={() => setActiveTab("super_admins")}
          className={`px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === "super_admins"
              ? "bg-slate-900 text-white shadow-sm"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>Super Admins Control ({superAdmins.length})</span>
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
                    <td className="p-3.5 font-mono font-bold text-[#6529E8]">
                      <div>{inst.id}</div>
                      {inst.registeredAt && (
                        <div className="text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                          {new Date(inst.registeredAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900 text-sm">{inst.name}</p>
                      <p className="text-[11px] text-slate-500">{inst.district}, {inst.state}</p>
                      <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                        {inst.onboarding_completed ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            Setup Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                            <Clock className="w-2.5 h-2.5" />
                            Setup Incomplete
                          </span>
                        )}
                        {inst.institute_type && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium border border-slate-200">
                            {inst.institute_type}
                          </span>
                        )}
                      </div>
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

                        {/* Edit Institute Details */}
                        <button
                          onClick={() => {
                            setShowEditInstituteModal(inst);
                            setEditInstName(inst.name);
                            setEditInstOwner(inst.ownerName);
                            setEditInstEmail(inst.email);
                            setEditInstMobile(inst.mobile);
                            setEditInstAddress(inst.address);
                            setEditInstDistrict(inst.district);
                            setEditInstState(inst.state);
                            setEditInstPincode(inst.pincode);
                            setEditInstStatus(inst.status);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 cursor-pointer flex items-center gap-1"
                          title="Edit full institute profile & details"
                        >
                          <Edit2 className="w-3 h-3 text-slate-500" />
                          <span>Edit</span>
                        </button>

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

      {/* TAB 6: PLATFORM BRANDING, COLORS & THEME */}
      {activeTab === "branding" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6">
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/60 mb-2">
                Super Admin Design Engine
              </div>
              <h2 className="text-lg font-black text-slate-900">Platform Branding, Theme & Logo Studio</h2>
              <p className="text-xs text-slate-500">
                Customize the platform brand name, global primary button colors, border radius curvature, and website logo dynamically.
              </p>
            </div>
            <button
              onClick={handleSavePlatformSettings}
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save & Publish Changes</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Config Controls (Col 7) */}
            <div className="lg:col-span-7 space-y-5">
              {/* Brand Name & Tagline */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Website Platform Title
                  </label>
                  <input
                    type="text"
                    value={platformSettings.siteTitle}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, siteTitle: e.target.value })}
                    placeholder="e.g. CertiDesk Pro"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Platform Tagline / Subtitle
                  </label>
                  <input
                    type="text"
                    value={platformSettings.siteSubtitle}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, siteSubtitle: e.target.value })}
                    placeholder="e.g. Institute & Certificate SaaS"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Logo URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Website Platform Logo URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={platformSettings.logoUrl}
                    onChange={(e) => setPlatformSettings({ ...platformSettings, logoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png (or leave blank to use default icon)"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  />
                  {platformSettings.logoUrl && (
                    <button
                      type="button"
                      onClick={() => setPlatformSettings({ ...platformSettings, logoUrl: "" })}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Upload your logo to any image hosting service (or Firebase Storage) and paste the URL here.
                </p>
              </div>

              {/* Primary Color Palette Presets */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Global Primary & Button Color
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { name: "Dark Slate", hex: "#0F172A" },
                    { name: "Royal Indigo", hex: "#4F46E5" },
                    { name: "Electric Blue", hex: "#2563EB" },
                    { name: "Emerald Pro", hex: "#059669" },
                    { name: "Violet Magic", hex: "#7C3AED" },
                    { name: "Crimson Red", hex: "#DC2626" },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setPlatformSettings({ ...platformSettings, primaryColor: color.hex })}
                      className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                        platformSettings.primaryColor.toLowerCase() === color.hex.toLowerCase()
                          ? "border-slate-900 ring-2 ring-slate-900/20 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <span className="w-6 h-6 rounded-lg shadow-2xs" style={{ backgroundColor: color.hex }} />
                      <span className="text-[10px] font-bold text-slate-700">{color.name}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <span className="text-xs font-semibold text-slate-500">Or Custom Hex:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={platformSettings.primaryColor}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                    />
                    <input
                      type="text"
                      value={platformSettings.primaryColor}
                      onChange={(e) => setPlatformSettings({ ...platformSettings, primaryColor: e.target.value })}
                      className="w-28 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Button Border Radius */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Button & Card Border Radius Curvature
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { label: "Sharp", val: "6px" },
                    { label: "Modern", val: "10px" },
                    { label: "Smooth (Default)", val: "12px" },
                    { label: "Curved", val: "16px" },
                    { label: "Pill Shape", val: "9999px" },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setPlatformSettings({ ...platformSettings, buttonRadius: r.val })}
                      className={`py-2 px-2.5 border text-center transition-all cursor-pointer ${
                        platformSettings.buttonRadius === r.val
                          ? "border-slate-900 bg-slate-900 text-white font-bold shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-semibold text-xs"
                      }`}
                      style={{ borderRadius: r.val }}
                    >
                      <span className="text-xs block">{r.label}</span>
                      <span className="text-[10px] opacity-75">{r.val}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Preview Box (Col 5) */}
            <div className="lg:col-span-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 p-5 space-y-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Live Interactive Component Preview
              </span>

              {/* Mock Brand Header */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-3">
                {platformSettings.logoUrl ? (
                  <img src={platformSettings.logoUrl} alt="Logo" className="w-9 h-9 object-contain rounded-lg" />
                ) : (
                  <div 
                    className="w-9 h-9 flex items-center justify-center text-white font-bold shadow-xs"
                    style={{ backgroundColor: platformSettings.primaryColor, borderRadius: platformSettings.buttonRadius }}
                  >
                    <Award className="w-5 h-5" />
                  </div>
                )}
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {platformSettings.siteTitle || "CertiDesk Pro"}
                  </h4>
                  <p className="text-[10px] text-slate-500">
                    {platformSettings.siteSubtitle || "Institute & Certificate SaaS"}
                  </p>
                </div>
              </div>

              {/* Mock Action Buttons Preview */}
              <div className="space-y-2">
                <button
                  type="button"
                  className="w-full py-3 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    backgroundColor: platformSettings.primaryColor,
                    borderRadius: platformSettings.buttonRadius,
                  }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Sample Primary Button</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    className="w-1/2 py-2 text-white font-semibold text-xs shadow-xs"
                    style={{
                      backgroundColor: platformSettings.primaryColor,
                      borderRadius: platformSettings.buttonRadius,
                      opacity: 0.85
                    }}
                  >
                    Action Button
                  </button>
                  <button
                    type="button"
                    className="w-1/2 py-2 bg-white border border-slate-300 text-slate-700 font-semibold text-xs shadow-2xs"
                    style={{
                      borderRadius: platformSettings.buttonRadius,
                    }}
                  >
                    Secondary Button
                  </button>
                </div>
              </div>

              {/* Color Details Card */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Selected Hex:</span>
                  <span className="font-bold text-slate-900">{platformSettings.primaryColor}</span>
                </div>
                <div className="flex justify-between">
                  <span>Border Curvature:</span>
                  <span className="font-bold text-slate-900">{platformSettings.buttonRadius}</span>
                </div>
                <div className="flex justify-between">
                  <span>Brand Mark:</span>
                  <span className="font-bold text-slate-900">{platformSettings.logoUrl ? "Custom Image URL" : "Default SVG"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SUPER ADMINS MASTER CONTROL */}
      {activeTab === "super_admins" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-base font-extrabold text-slate-900">
                  Super Admins Access & Governance
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage platform root administrators with mandatory 6-digit security PIN verification and custom privileges.
              </p>
            </div>

            <button
              onClick={() => {
                setNewSuName("");
                setNewSuEmail("");
                setNewSuPassword("");
                setNewSuPin("");
                setShowCreateSuperAdminModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-400" />
              <span>+ Provision Super Admin</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Administrator</th>
                  <th className="p-3.5">Authority Tier</th>
                  <th className="p-3.5">Security PIN</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Assigned Permissions</th>
                  <th className="p-3.5">Created / Active</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {superAdmins.map((admin) => {
                  const isRootMaster = admin.isMaster || admin.email?.toLowerCase() === "vinkalp041@gmail.com";
                  return (
                    <tr key={admin.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                            isRootMaster
                              ? "bg-amber-100 text-amber-800 border border-amber-300"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}>
                            {isRootMaster ? <Crown className="w-4 h-4 text-amber-600 fill-amber-500/20" /> : <Shield className="w-4 h-4 text-slate-600" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold text-slate-900">{admin.name}</p>
                              {isRootMaster && (
                                <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200">
                                  Root Master
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-slate-500 font-mono">{admin.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">
                          {isRootMaster ? "Platform Root Master" : "Delegated Super Admin"}
                        </span>
                        <p className="text-[10px] text-slate-400">Global Multi-Tenant Authority</p>
                      </td>

                      <td className="p-3.5">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-mono font-bold text-[11px] border border-slate-200">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{admin.pinMasked || "••••49"}</span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          admin.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}>
                          {admin.status?.toUpperCase() || "ACTIVE"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {admin.permissions?.canManageInstitutes && (
                            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
                              Institutes
                            </span>
                          )}
                          {admin.permissions?.canManageSuperAdmins && (
                            <span className="px-1.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-semibold border border-purple-200">
                              Super Admins
                            </span>
                          )}
                          {admin.permissions?.canManageFinancials && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
                              Wallets
                            </span>
                          )}
                          {admin.permissions?.canManageBranding && (
                            <span className="px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[10px] font-semibold border border-amber-200">
                              Branding
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-500 text-[11px]">
                        <div>{admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : "Master"}</div>
                        {admin.lastLogin && (
                          <div className="text-[10px] text-slate-400">
                            Last: {new Date(admin.lastLogin).toLocaleDateString()}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setShowEditSuperAdminModal(admin);
                              setEditSuName(admin.name);
                              setEditSuStatus(admin.status || "active");
                              setEditSuPassword("");
                              setEditSuPin("");
                              setEditSuPermissions(admin.permissions || {
                                canManageInstitutes: true,
                                canManageSuperAdmins: true,
                                canManageFinancials: true,
                                canManageBranding: true,
                                canManageAuditLogs: true,
                              });
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-[10px] border border-slate-200 cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3 text-slate-500" />
                            <span>Edit</span>
                          </button>

                          {!isRootMaster && (
                            <button
                              onClick={() => handleDeleteSuperAdmin(admin)}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] border border-rose-200 cursor-pointer flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
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
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl font-bold text-[11px]">
                <button
                  type="button"
                  onClick={() => setCreditType("credit")}
                  className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                    creditType === "credit" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  + Add Credit
                </button>
                <button
                  type="button"
                  onClick={() => setCreditType("debit")}
                  className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                    creditType === "debit" ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  - Deduct
                </button>
                <button
                  type="button"
                  onClick={() => setCreditType("set_exact")}
                  className={`py-2 px-1 rounded-lg transition-all text-center cursor-pointer ${
                    creditType === "set_exact" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  = Set Exact (Overwrite)
                </button>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  {creditType === "set_exact" ? "Set New Exact Wallet Balance (₹)" : "Amount (₹)"}
                </label>
                <input
                  type="number"
                  value={creditAmount}
                  onChange={(e) => setCreditAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-bold text-sm"
                  min="0"
                />
                {creditType === "set_exact" && (
                  <span className="text-[10px] text-indigo-600 block mt-1 font-semibold">
                    Super Admin Overwrite: Directly updates wallet balance from ₹{showCreditModal.walletBalance.toLocaleString()} to ₹{creditAmount.toLocaleString()}.
                  </span>
                )}
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={creditNote}
                  onChange={(e) => setCreditNote(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl"
                  placeholder="e.g. Welcome promo / manual balance correction"
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

      {/* MODAL: PROVISION NEW SUPER ADMIN */}
      {showCreateSuperAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Crown className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Provision Super Admin</h3>
                  <p className="text-[10px] text-slate-500">Requires 6-Digit Master Security PIN</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateSuperAdminModal(false)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSuperAdmin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={newSuName}
                  onChange={(e) => setNewSuName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  placeholder="e.g. Rahul Sharma"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={newSuEmail}
                  onChange={(e) => setNewSuEmail(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium font-mono"
                  placeholder="admin@platform.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={newSuPassword}
                    onChange={(e) => setNewSuPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                    placeholder="Min 6 chars"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">6-Digit PIN</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={newSuPin}
                    onChange={(e) => setNewSuPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold tracking-widest text-slate-900"
                    placeholder="630649"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-700 mb-2">Assigned Permissions:</p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={newSuPermissions.canManageInstitutes}
                      onChange={(e) => setNewSuPermissions({ ...newSuPermissions, canManageInstitutes: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Manage Institutes & Centers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={newSuPermissions.canManageSuperAdmins}
                      onChange={(e) => setNewSuPermissions({ ...newSuPermissions, canManageSuperAdmins: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Provision & Edit Other Super Admins</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={newSuPermissions.canManageFinancials}
                      onChange={(e) => setNewSuPermissions({ ...newSuPermissions, canManageFinancials: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Manage Wallet Balances & Platform Ledger</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={newSuPermissions.canManageBranding}
                      onChange={(e) => setNewSuPermissions({ ...newSuPermissions, canManageBranding: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Customize Platform Branding & Themes</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateSuperAdminModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Create Super Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT SUPER ADMIN */}
      {showEditSuperAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Edit Super Admin</h3>
                <p className="text-[10px] text-slate-500">{showEditSuperAdminModal.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditSuperAdminModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateSuperAdmin} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editSuName}
                  onChange={(e) => setEditSuName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={editSuStatus}
                  onChange={(e) => setEditSuStatus(e.target.value as any)}
                  disabled={showEditSuperAdminModal.isMaster}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
                {showEditSuperAdminModal.isMaster && (
                  <p className="text-[10px] text-amber-600 mt-1">Root Master Super Admin status is protected.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reset Password</label>
                  <input
                    type="password"
                    value={editSuPassword}
                    onChange={(e) => setEditSuPassword(e.target.value)}
                    placeholder="Leave blank to keep"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Reset 6-Digit PIN</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editSuPin}
                    onChange={(e) => setEditSuPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="Leave blank"
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-mono font-bold tracking-widest text-slate-900 text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="font-bold text-slate-700 mb-2">Permissions:</p>
                <div className="space-y-1.5">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={editSuPermissions.canManageInstitutes}
                      onChange={(e) => setEditSuPermissions({ ...editSuPermissions, canManageInstitutes: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Manage Institutes & Centers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={editSuPermissions.canManageSuperAdmins}
                      onChange={(e) => setEditSuPermissions({ ...editSuPermissions, canManageSuperAdmins: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Provision & Edit Other Super Admins</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={editSuPermissions.canManageFinancials}
                      onChange={(e) => setEditSuPermissions({ ...editSuPermissions, canManageFinancials: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Manage Wallet Balances & Platform Ledger</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
                    <input
                      type="checkbox"
                      checked={editSuPermissions.canManageBranding}
                      onChange={(e) => setEditSuPermissions({ ...editSuPermissions, canManageBranding: e.target.checked })}
                      className="rounded text-indigo-600"
                    />
                    <span>Customize Platform Branding & Themes</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditSuperAdminModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT INSTITUTE FULL DETAILS */}
      {showEditInstituteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Edit Institute Profile</h3>
                <p className="text-[10px] text-[#6529E8] font-mono font-bold">{showEditInstituteModal.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEditInstituteModal(null)}
                className="text-slate-400 hover:text-slate-700 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveInstituteDetails} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Institute Name</label>
                  <input
                    type="text"
                    required
                    value={editInstName}
                    onChange={(e) => setEditInstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Owner / Director</label>
                  <input
                    type="text"
                    required
                    value={editInstOwner}
                    onChange={(e) => setEditInstOwner(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Official Email</label>
                  <input
                    type="email"
                    required
                    value={editInstEmail}
                    onChange={(e) => setEditInstEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={editInstMobile}
                    onChange={(e) => setEditInstMobile(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Complete Address</label>
                <input
                  type="text"
                  required
                  value={editInstAddress}
                  onChange={(e) => setEditInstAddress(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">District / City</label>
                  <input
                    type="text"
                    required
                    value={editInstDistrict}
                    onChange={(e) => setEditInstDistrict(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={editInstState}
                    onChange={(e) => setEditInstState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PIN Code</label>
                  <input
                    type="text"
                    required
                    value={editInstPincode}
                    onChange={(e) => setEditInstPincode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Account Status</label>
                <select
                  value={editInstStatus}
                  onChange={(e) => setEditInstStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border rounded-xl font-medium"
                >
                  <option value="active">Active (Full Access)</option>
                  <option value="pending">Pending Approval</option>
                  <option value="suspended">Suspended (Access Frozen)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditInstituteModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
                >
                  Save Institute Profile
                </button>
              </div>
            </form>
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
