"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Building,
  User,
  BookOpen,
  Palette,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  ShieldCheck,
  Loader2,
  Layers,
  Image,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { OnboardingState } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { institute, refreshInstitute } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states across wizard steps
  const [personalInfo, setPersonalInfo] = useState({
    ownerName: "",
    directorName: "",
    profilePhotoUrl: "",
    contactNumber: "",
    email: "",
    designation: "Director",
  });

  const [instituteInfo, setInstituteInfo] = useState({
    logoUrl: "",
    name: "",
    address: "",
    contactInfo: "",
    website: "",
    officialEmail: "",
    establishedYear: "2020",
    instituteType: "Computer Education Institute",
  });

  const [academicConfig, setAcademicConfig] = useState({
    academicSession: "2026-2027",
    studentIdPrefix: "SBCI",
    courseCategories: "ADCA, DCA, Typing Proficiency, Tally ERP, Web Design",
    defaultBatchTiming: "08:00 AM - 10:00 AM",
  });

  const [branding, setBranding] = useState({
    primaryColor: "#0F172A",
    secondaryColor: "#4F46E5",
    certificateSignatureUrl: "",
    instituteStampUrl: "",
  });

  // Load existing onboarding state
  useEffect(() => {
    async function loadState() {
      setLoading(true);
      try {
        const res = await fetch("/api/onboarding");
        const data = await res.json();

        if (data.success && data.onboarding) {
          const ob: OnboardingState = data.onboarding;
          if (ob.personalInfo) setPersonalInfo((prev) => ({ ...prev, ...ob.personalInfo }));
          if (ob.instituteInfo) setInstituteInfo((prev) => ({ ...prev, ...ob.instituteInfo }));
          if (ob.academicConfig) {
            setAcademicConfig((prev) => ({
              ...prev,
              ...ob.academicConfig,
              courseCategories: Array.isArray(ob.academicConfig?.courseCategories)
                ? ob.academicConfig.courseCategories.join(", ")
                : prev.courseCategories,
            }));
          }
          if (ob.branding) setBranding((prev) => ({ ...prev, ...ob.branding }));

          // Resume from step parameter or current saved step
          const stepParam = searchParams.get("step");
          if (stepParam && Number(stepParam) >= 1 && Number(stepParam) <= 6) {
            setCurrentStep(Number(stepParam));
          } else if (ob.step && ob.step >= 1 && ob.step <= 6) {
            setCurrentStep(ob.step);
          }
        } else if (institute) {
          setPersonalInfo((prev) => ({
            ...prev,
            ownerName: institute.ownerName || "",
            directorName: institute.ownerName || "",
            contactNumber: institute.mobile || "",
            email: institute.email || "",
          }));
          setInstituteInfo((prev) => ({
            ...prev,
            name: institute.name || "",
            address: institute.address || "",
            officialEmail: institute.email || "",
            logoUrl: institute.logoUrl || "",
          }));
          setAcademicConfig((prev) => ({
            ...prev,
            studentIdPrefix: institute.code || "SBCI",
          }));
        }
      } catch (e) {
        console.warn("Failed to load onboarding:", e);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, [institute, searchParams]);

  // Save current step progress
  const saveStepProgress = async (nextStep: number, isComplete = false) => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        action: isComplete ? "complete" : "save_step",
        step: nextStep,
        isCompleted: isComplete,
        personalInfo,
        instituteInfo,
        academicConfig: {
          ...academicConfig,
          courseCategories: academicConfig.courseCategories
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        },
        branding,
      };

      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save progress.");
      }

      await refreshInstitute();

      if (isComplete) {
        router.push("/dashboard");
      } else {
        setCurrentStep(nextStep);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save step.");
    } finally {
      setSaving(false);
    }
  };

  // Skip for Later handler
  const handleSkipForLater = async () => {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "skip",
          step: currentStep,
          personalInfo,
          instituteInfo,
          academicConfig: {
            ...academicConfig,
            courseCategories: academicConfig.courseCategories
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean),
          },
          branding,
        }),
      });

      await refreshInstitute();
      router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setSaving(false);
    }
  };

  const stepsList = [
    { num: 1, title: "Welcome", icon: Sparkles },
    { num: 2, title: "Personal", icon: User },
    { num: 3, title: "Institute", icon: Building },
    { num: 4, title: "Academic", icon: BookOpen },
    { num: 5, title: "Branding", icon: Palette },
    { num: 6, title: "Finish", icon: CheckCircle2 },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-slate-800 mx-auto" />
          <p className="text-xs font-semibold text-slate-600">Loading your onboarding wizard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between py-6 px-4 selection:bg-slate-900 selection:text-white">
      {/* Top Navbar */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-bold shadow-xs">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
              CertiDesk Pro
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">Institute Onboarding Setup</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSkipForLater}
          disabled={saving}
          className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
        >
          Skip for Later →
        </button>
      </div>

      {/* Main Wizard Card */}
      <div className="max-w-3xl w-full mx-auto bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-10 space-y-6">
        
        {/* Step Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Step {currentStep} of 6: {stepsList[currentStep - 1]?.title}</span>
            <span className="text-slate-400 font-mono">{Math.round((currentStep / 6) * 100)}% Complete</span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>

          {/* Step Pills */}
          <div className="flex justify-between pt-1 overflow-x-auto gap-1 text-[11px]">
            {stepsList.map((s) => {
              const Icon = s.icon;
              const isActive = s.num === currentStep;
              const isPast = s.num < currentStep;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    isActive
                      ? "bg-slate-900 text-white font-bold"
                      : isPast
                      ? "text-emerald-700 font-semibold hover:bg-slate-50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================= STEP 1: WELCOME ================= */}
        {currentStep === 1 && (
          <div className="text-center py-6 space-y-6 animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Estimated Time: 3 Minutes</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Welcome, {institute?.name || "Institute Director"}!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Let's configure your institute profile, courses, and digital branding so you can immediately admit students and issue verified certificates.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left text-xs space-y-2">
              <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                What we'll set up together:
              </div>
              <ul className="space-y-1.5 text-slate-600 font-medium">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Personal & Director credentials
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Institute address, logo & contact channels
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Academic sessions & student ID prefix
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500 font-bold">✓</span> Official certificate stamps & signature
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => saveStepProgress(2)}
                disabled={saving}
                className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Continue Setup (Step 2) →</span>
              </button>

              <button
                type="button"
                onClick={handleSkipForLater}
                className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Skip for Later
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PERSONAL INFORMATION ================= */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Step 2: Director / Personal Information</h2>
              <p className="text-xs text-slate-500">Provide official details of the center owner or principal administrator.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Owner / Founder Name *</label>
                <input
                  type="text"
                  value={personalInfo.ownerName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, ownerName: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Director Name (For Certificates) *</label>
                <input
                  type="text"
                  value={personalInfo.directorName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, directorName: e.target.value })}
                  placeholder="e.g. Dr. R. Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Contact Number *</label>
                <input
                  type="tel"
                  value={personalInfo.contactNumber}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, contactNumber: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Director Email Address *</label>
                <input
                  type="email"
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  placeholder="director@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Designation</label>
                <input
                  type="text"
                  value={personalInfo.designation}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, designation: e.target.value })}
                  placeholder="e.g. Managing Director / Principal"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Profile Photo URL (Optional)</label>
                <input
                  type="url"
                  value={personalInfo.profilePhotoUrl}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, profilePhotoUrl: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkipForLater}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Skip for Later
                </button>
                <button
                  type="button"
                  onClick={() => saveStepProgress(3)}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {saving ? "Saving..." : "Save & Continue (Step 3) →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: INSTITUTE INFORMATION ================= */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Step 3: Institute Information</h2>
              <p className="text-xs text-slate-500">Configure your official educational institute details and web presence.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Institute Name *</label>
                <input
                  type="text"
                  value={instituteInfo.name}
                  onChange={(e) => setInstituteInfo({ ...instituteInfo, name: e.target.value })}
                  placeholder="e.g. SBCI Computer Institute"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Established Year</label>
                <input
                  type="text"
                  value={instituteInfo.establishedYear}
                  onChange={(e) => setInstituteInfo({ ...instituteInfo, establishedYear: e.target.value })}
                  placeholder="e.g. 2020"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Website URL (Optional)</label>
                <input
                  type="url"
                  value={instituteInfo.website}
                  onChange={(e) => setInstituteInfo({ ...instituteInfo, website: e.target.value })}
                  placeholder="https://myinstitute.in"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Public Email</label>
                <input
                  type="email"
                  value={instituteInfo.officialEmail}
                  onChange={(e) => setInstituteInfo({ ...instituteInfo, officialEmail: e.target.value })}
                  placeholder="contact@myinstitute.in"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Institute Logo URL (Recommended)</label>
                <input
                  type="url"
                  value={instituteInfo.logoUrl}
                  onChange={(e) => setInstituteInfo({ ...instituteInfo, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  This logo will appear on all generated certificates, student marksheets, and student ID cards.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Complete Campus Address</label>
                <input
                  type="text"
                  value={instituteInfo.address}
                  onChange={(e) => setInstituteInfo({ ...instituteInfo, address: e.target.value })}
                  placeholder="e.g. Utrethoo Bazar, Ambedkar Nagar, UP"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkipForLater}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Skip for Later
                </button>
                <button
                  type="button"
                  onClick={() => saveStepProgress(4)}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {saving ? "Saving..." : "Save & Continue (Step 4) →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: ACADEMIC CONFIGURATION ================= */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Step 4: Academic Configuration</h2>
              <p className="text-xs text-slate-500">Configure academic sessions, student enrollment prefix, and course domains.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Current Academic Session *</label>
                <input
                  type="text"
                  value={academicConfig.academicSession}
                  onChange={(e) => setAcademicConfig({ ...academicConfig, academicSession: e.target.value })}
                  placeholder="e.g. 2026-2027"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Enrollment Prefix *</label>
                <input
                  type="text"
                  value={academicConfig.studentIdPrefix}
                  onChange={(e) => setAcademicConfig({ ...academicConfig, studentIdPrefix: e.target.value.toUpperCase() })}
                  placeholder="e.g. SBCI"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-bold font-mono focus:ring-2 focus:ring-slate-900 uppercase"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Prefix used for student numbers e.g. <strong>{academicConfig.studentIdPrefix || "SBCI"}/ADCA/0268</strong>
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Course Categories / Domains (Comma-Separated)</label>
                <input
                  type="text"
                  value={academicConfig.courseCategories}
                  onChange={(e) => setAcademicConfig({ ...academicConfig, courseCategories: e.target.value })}
                  placeholder="e.g. ADCA, DCA, Typing Proficiency, Tally ERP, Web Design"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Default Batch Schedule</label>
                <input
                  type="text"
                  value={academicConfig.defaultBatchTiming}
                  onChange={(e) => setAcademicConfig({ ...academicConfig, defaultBatchTiming: e.target.value })}
                  placeholder="e.g. 08:00 AM - 10:00 AM"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkipForLater}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Skip for Later
                </button>
                <button
                  type="button"
                  onClick={() => saveStepProgress(5)}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {saving ? "Saving..." : "Save & Continue (Step 5) →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: BRANDING ================= */}
        {currentStep === 5 && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Step 5: Visual Branding & Certificate Seals</h2>
              <p className="text-xs text-slate-500">Customize colors, signature stamps, and digital marks.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Primary Theme Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.primaryColor}
                    onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Secondary Brand Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={branding.secondaryColor}
                    onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Certificate Digital Signature URL</label>
                <input
                  type="url"
                  value={branding.certificateSignatureUrl}
                  onChange={(e) => setBranding({ ...branding, certificateSignatureUrl: e.target.value })}
                  placeholder="https://example.com/signature.png"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institute Stamp / Seal URL</label>
                <input
                  type="url"
                  value={branding.instituteStampUrl}
                  onChange={(e) => setBranding({ ...branding, instituteStampUrl: e.target.value })}
                  placeholder="https://example.com/stamp.png"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900"
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSkipForLater}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Skip for Later
                </button>
                <button
                  type="button"
                  onClick={() => saveStepProgress(6)}
                  disabled={saving}
                  className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {saving ? "Saving..." : "Review & Finish (Step 6) →"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: COMPLETION ================= */}
        {currentStep === 6 && (
          <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Your Institute Setup Is Complete!
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                All basic academic, director, and branding configurations have been saved successfully for <strong>{institute?.name || "your institute"}</strong>.
              </p>
            </div>

            <div className="max-w-md mx-auto bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold">
                <span className="text-slate-600">Setup Completion:</span>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  100% Completed
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Institute ID:</span>
                <span className="font-mono font-bold text-slate-900">{institute?.id}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Director:</span>
                <span className="font-bold text-slate-900">{personalInfo.directorName || personalInfo.ownerName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Session:</span>
                <span className="font-mono text-slate-900">{academicConfig.academicSession}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Student ID Prefix:</span>
                <span className="font-mono font-bold text-slate-900">{academicConfig.studentIdPrefix}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => saveStepProgress(6, true)}
              disabled={saving}
              className="px-8 py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              <span>Go to Institute Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
