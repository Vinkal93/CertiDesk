"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  UserPlus, 
  ArrowLeft, 
  Wallet, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2, 
  Upload, 
  GraduationCap, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Course, Batch } from "@/types";
import RechargeModal from "@/components/modals/RechargeModal";

export default function AddStudentPage() {
  const router = useRouter();
  const { institute, walletBalance, refreshInstitute } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ name: string; enrollNo: string } | null>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [dob, setDob] = useState("2004-01-01");
  const [gender, setGender] = useState<"Male" | "Female" | "Other">("Male");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState(institute?.district || "Gorakhpur");
  const [state, setState] = useState(institute?.state || "Uttar Pradesh");
  const [pincode, setPincode] = useState("273001");
  const [qualification, setQualification] = useState("12th Pass");
  const [schoolCollege, setSchoolCollege] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [session, setSession] = useState("2026-2027");
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);

  const admissionFee = institute?.settings.admissionFee ?? 150;
  const hasSufficientBalance = walletBalance >= admissionFee;

  useEffect(() => {
    async function init() {
      if (!institute) return;
      const c = await dataStore.getCourses(institute.id);
      const b = await dataStore.getBatches(institute.id);
      setCourses(c);
      setBatches(b);
      if (c.length > 0) setCourseId(c[0].id);
      if (b.length > 0) setBatchId(b[0].id);
    }
    init();
  }, [institute]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const selectedBatch = batches.find((b) => b.id === batchId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;

    if (!fullName.trim() || !fatherName.trim() || !mobile.trim()) {
      setError("Please fill in Student Name, Father's Name, and Mobile Number.");
      return;
    }

    if (!hasSufficientBalance) {
      setError(`Insufficient wallet balance. You need ₹${admissionFee}, but your balance is ₹${walletBalance}. Please recharge.`);
      setShowRechargeModal(true);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await dataStore.createStudent({
        instituteId: institute.id,
        fullName: fullName.trim(),
        fatherName: fatherName.trim(),
        motherName: motherName.trim() || "N/A",
        dob,
        gender,
        mobile: mobile.trim(),
        email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, "")}@student.certidesk`,
        address: address.trim() || "Main Campus Area",
        state,
        district,
        pincode,
        qualification,
        schoolCollege: schoolCollege.trim() || "District Degree College",
        courseId: selectedCourse?.id || "c-adca",
        courseName: selectedCourse?.name || "ADCA",
        courseCode: selectedCourse?.code || "ADCA",
        batchId: selectedBatch?.id || "batch-1",
        batchName: selectedBatch?.name || "Morning Batch",
        session,
        courseDuration: selectedCourse?.duration || "12 Months",
        courseFee: selectedCourse?.fee || 12000,
        status: "Active",
        admissionDate,
      });

      await refreshInstitute();
      setSuccessResult({
        name: result.student.fullName,
        enrollNo: result.student.enrollmentNo,
      });
    } catch (err: any) {
      setError(err.message || "Failed to create student admission.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Breadcrumb & Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/students"
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">New Student Admission</h2>
            <p className="text-xs text-slate-500">Register a new candidate and assign course & batch.</p>
          </div>
        </div>

        {/* Live Wallet Balance Chip */}
        <div className="flex items-center gap-2 bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 shadow-xs">
          <Wallet className="w-4 h-4 text-brand-600" />
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-semibold leading-none">Wallet Balance</p>
            <p className="text-xs font-bold text-slate-900 mt-0.5">
              ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white rounded-2xl border border-emerald-200 shadow-soft p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Admission Created Successfully!</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Candidate <strong>{successResult.name}</strong> has been registered. ₹{admissionFee} was deducted from your wallet.
          </p>
          <div className="inline-block px-4 py-2 bg-brand-50 border border-brand-200 rounded-xl font-mono text-sm font-bold text-brand-700">
            Enrollment No: {successResult.enrollNo}
          </div>
          <div className="flex items-center justify-center gap-3 pt-4">
            <Link
              href="/students"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Back to Students List
            </Link>
            <button
              onClick={() => {
                setSuccessResult(null);
                setFullName("");
                setFatherName("");
                setMobile("");
              }}
              className="px-5 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand"
            >
              + Admit Another Student
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
              {!hasSufficientBalance && (
                <button
                  type="button"
                  onClick={() => setShowRechargeModal(true)}
                  className="px-3 py-1 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 text-xs"
                >
                  Recharge Now
                </button>
              )}
            </div>
          )}

          {/* Pricing Confirmation Banner */}
          <div className="bg-brand-50/70 border border-brand-200/80 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center font-bold text-sm">
                ₹
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Admission Fee: ₹{admissionFee}</h4>
                <p className="text-[11px] text-slate-600">
                  This charge will be atomically deducted from your wallet upon enrollment creation.
                </p>
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-lg border ${
                hasSufficientBalance
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {hasSufficientBalance ? "Balance Sufficient" : "Low Balance - Recharge Needed"}
            </span>
          </div>

          {/* 1. Admission & Course Details */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GraduationCap className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                1. Course & Admission Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  required
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Batch *</label>
                <select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  required
                >
                  {batches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.timing})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Academic Session</label>
                <input
                  type="text"
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Admission Date</label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Duration</label>
                <input
                  type="text"
                  disabled
                  value={selectedCourse?.duration || "12 Months"}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Course Fee (₹)</label>
                <input
                  type="text"
                  disabled
                  value={`₹${selectedCourse?.fee?.toLocaleString() || 0}`}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-medium text-slate-500"
                />
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <UserPlus className="w-4 h-4 text-brand-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                2. Personal Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Student Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Khushbu Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Father's Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rameshwar Prasad"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mother's Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Devi"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98711 00268"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. khushbu@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Highest Qualification</label>
                <input
                  type="text"
                  placeholder="e.g. 12th / Graduation"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">School / College Name</label>
                <input
                  type="text"
                  placeholder="e.g. DDU Gorakhpur University"
                  value={schoolCollege}
                  onChange={(e) => setSchoolCollege(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1 text-xs">Residential Address</label>
              <textarea
                rows={2}
                placeholder="Street address, colony, landmark..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/90 shadow-card">
            <Link
              href="/students"
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting || !hasSufficientBalance}
              className="px-6 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-2 cursor-pointer transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Admission & Wallet Debit...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Confirm Admission (Deduct ₹{admissionFee})</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Recharge Modal if user has insufficient funds */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={refreshInstitute}
        />
      )}
    </div>
  );
}
