"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Award, 
  Building, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Copy,
  Check,
  Printer,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function RegisterInstitutePage() {
  const router = useRouter();
  const { refreshInstitute } = useAuth();

  // Form Fields - Institute Info
  const [instituteName, setInstituteName] = useState("");
  const [instituteType, setInstituteType] = useState("Computer Education Institute");
  const [ownerName, setOwnerName] = useState("");
  const [officialEmail, setOfficialEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Gorakhpur");
  const [city, setCity] = useState("Gorakhpur");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("273001");

  // Form Fields - Admin Account Info
  const [adminName, setAdminName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Additional Checkboxes
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [privacyAccepted, setPrivacyAccepted] = useState(true);

  // Status & Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredData, setRegisteredData] = useState<{
    instituteId: string;
    instituteName: string;
    adminLoginId: string;
    adminEmail: string;
    registeredAt: string;
    accountStatus: string;
  } | null>(null);

  const [copiedId, setCopiedId] = useState(false);
  const [copiedAdminId, setCopiedAdminId] = useState(false);

  // Auto-fill admin details when owner details are typed
  const handleOwnerChange = (val: string) => {
    setOwnerName(val);
    if (!adminName || adminName === ownerName) {
      setAdminName(val);
    }
  };

  const handleEmailChange = (val: string) => {
    setOfficialEmail(val);
    if (!adminEmail || adminEmail === officialEmail) {
      setAdminEmail(val);
    }
  };

  const copyToClipboard = (text: string, type: "id" | "adminId") => {
    if (typeof navigator !== "undefined") {
      navigator.clipboard.writeText(text);
      if (type === "id") {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else {
        setCopiedAdminId(true);
        setTimeout(() => setCopiedAdminId(false), 2000);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match. Please re-enter.");
      }
      if (!termsAccepted || !privacyAccepted) {
        throw new Error("Please accept the Terms of Service and Privacy Policy.");
      }

      // Call trusted backend registration API
      const res = await fetch("/api/auth/register-institute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instituteName: instituteName.trim(),
          instituteType,
          ownerName: ownerName.trim(),
          officialEmail: officialEmail.trim(),
          phone: phone.trim(),
          address: address.trim(),
          state: state.trim(),
          district: district.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          adminName: (adminName || ownerName).trim(),
          adminEmail: (adminEmail || officialEmail).trim(),
          password,
          confirmPassword,
          termsAccepted,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Registration failed. Please check your information.");
      }

      // Successfully provisioned
      await refreshInstitute();

      setRegisteredData({
        instituteId: data.credentials.instituteId,
        instituteName: data.institute.name,
        adminLoginId: data.credentials.adminLoginId,
        adminEmail: data.credentials.adminEmail,
        registeredAt: data.credentials.registeredAt,
        accountStatus: "Active",
      });
    } catch (err: any) {
      setError(err.message || "Failed to register institute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-3 sm:p-6 lg:p-10 selection:bg-slate-900 selection:text-white">
      {/* Top Header Navigation */}
      <div className="max-w-2xl w-full mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors bg-white px-3.5 py-1.5 rounded-full border border-slate-200/90 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span className="text-[11px] font-semibold text-slate-500">
            Secure 256-Bit SSL Registration
          </span>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-1">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-black shadow-sm">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">CertiDesk Pro</span>
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Register Your Educational Institute
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Get an authoritative, unique Institute ID (e.g. SBCI-2026-00001) to manage admissions, batches, exams, and verified digital certificates.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        {/* ================= PHASE 3: REGISTRATION SUCCESS POPUP ================= */}
        {registeredData ? (
          <div className="bg-gradient-to-b from-slate-50 to-white border-2 border-slate-900/10 rounded-3xl p-6 sm:p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>🎉 Institute Registered Successfully!</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
                Welcome to CertiDesk Pro
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Your educational center <strong>{registeredData.instituteName}</strong> is now registered and active on the platform.
              </p>
            </div>

            {/* Authoritative Credentials Box */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3.5 text-left text-xs font-mono shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-slate-500 font-sans font-semibold">Institute Name:</span>
                <span className="font-bold text-slate-900 font-sans">{registeredData.instituteName}</span>
              </div>

              {/* Unique Institute ID with Copy Button */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold tracking-wider">
                    Authoritative Institute ID
                  </span>
                  <span className="text-base font-black text-slate-900 tracking-wide">
                    {registeredData.instituteId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(registeredData.instituteId, "id")}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-sans text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copiedId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy ID</span>
                    </>
                  )}
                </button>
              </div>

              {/* Admin Login ID with Copy Button */}
              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold tracking-wider">
                    Admin Login ID / Email
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {registeredData.adminLoginId}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(registeredData.adminLoginId, "adminId")}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-sans text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  {copiedAdminId ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 text-slate-600">
                <span className="font-sans">Account Status:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-sans">
                  ● {registeredData.accountStatus}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px] font-sans">
                <span>Registration Date:</span>
                <span>{new Date(registeredData.registeredAt).toLocaleDateString("en-IN", { dateStyle: "long" })}</span>
              </div>
            </div>

            {/* Action Buttons: [Continue to Setup] & [Go to Dashboard] */}
            <div className="space-y-2 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => router.push(`/onboarding?instituteId=${registeredData.instituteId}`)}
                  className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Continue to Setup Wizard →</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/dashboard")}
                  className="py-3 px-4 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5"
                >
                  <span>Go to Institute Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-semibold pt-2"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Registration Summary</span>
              </button>
            </div>
          </div>
        ) : (
          /* ================= PHASE 1: PROFESSIONAL REGISTRATION FORM ================= */
          <form onSubmit={handleSubmit} className="space-y-6 text-xs">
            
            {/* SECTION 1: INSTITUTE INFORMATION */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <Building className="w-4 h-4 text-blue-600" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  1. Institute Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institute Name *</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Apex Computer Academy"
                      value={instituteName}
                      onChange={(e) => setInstituteName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Institute Type *</label>
                  <select
                    value={instituteType}
                    onChange={(e) => setInstituteType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl font-medium bg-white focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  >
                    <option>Computer Education Institute</option>
                    <option>Vocational Skill Center</option>
                    <option>IT & Software Academy</option>
                    <option>Coaching & Certification Center</option>
                    <option>College / Higher Secondary School</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Owner / Director Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={ownerName}
                      onChange={(e) => handleOwnerChange(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contact Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Official Institute Email *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="center@example.com"
                    value={officialEmail}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Complete Center Address *</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. 2nd Floor, Shubham Plaza, Railway Station Road"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">District *</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">PIN Code *</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: ADMIN ACCOUNT INFORMATION */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2 pb-1 border-b border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                  2. Admin Account Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Admin Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="e.g. Rajesh Kumar"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Admin Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      placeholder="admin@example.com"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="password"
                      placeholder="Re-type password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: TERMS & PRIVACY */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                  required
                />
                <span className="text-xs">
                  I accept the <strong>Terms of Service</strong> and agree to issue authentic academic records.
                </span>
              </label>

              <label className="flex items-start gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-slate-900 rounded border-slate-300 focus:ring-slate-900 cursor-pointer"
                  required
                />
                <span className="text-xs">
                  I consent to the <strong>Privacy Policy</strong> and student data isolation guidelines.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-[#0F172A] hover:bg-slate-800 active:bg-slate-900 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Validating & Provisioning Institute...</span>
                </>
              ) : (
                <>
                  <span>Complete Institute Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Already registered?{" "}
          <Link href="/login" className="text-slate-900 font-bold hover:underline">
            Sign In with Institute ID or Email
          </Link>
        </div>
      </div>
    </div>
  );
}
