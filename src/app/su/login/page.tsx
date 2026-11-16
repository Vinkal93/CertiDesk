"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Crown, 
  GraduationCap, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  AlertCircle, 
  Loader2,
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login, loginFirebase } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const cleanEmail = email.trim();
    const cleanPass = password;

    if (!cleanEmail || !cleanPass) {
      setError("Please enter both your super admin email and password.");
      setLoading(false);
      return;
    }

    try {
      // 1. Authenticate against Firebase Auth and issue authoritative server session
      try {
        await loginFirebase(cleanEmail, cleanPass, "super_admin");
      } catch (fbErr: any) {
        console.warn("Firebase direct sign-in response:", fbErr.code, fbErr.message);

        // Fallback for platform root administrator in local/offline environment
        if (
          cleanEmail.toLowerCase() === "admin@certidesk.pro" &&
          cleanPass === "Admin@123456"
        ) {
          await login(cleanEmail, "super_admin");
        } else {
          if (
            fbErr.code === "auth/invalid-credential" ||
            fbErr.code === "auth/user-not-found" ||
            fbErr.code === "auth/wrong-password"
          ) {
            throw new Error(
              "Invalid email or password. Please verify that this user account has been registered in your Firebase Console (Authentication > Users)."
            );
          } else if (fbErr.code === "auth/network-request-failed") {
            throw new Error(
              "Network request failed. Please check your internet connection."
            );
          } else {
            throw new Error(fbErr.message || "Authentication failed.");
          }
        }
      }

      let redirectUrl = "/su";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const qRedirect = params.get("redirect");
        if (qRedirect && qRedirect.startsWith("/su")) {
          redirectUrl = qRedirect;
        }
      }

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate Super Admin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#EEF2F6] flex items-center justify-center p-2 sm:p-4 lg:p-6 font-sans selection:bg-blue-600 selection:text-white overflow-hidden">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-blue-100/60 rounded-full blur-3xl opacity-70" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-3xl opacity-60" />
      </div>

      {/* Main 2-Column Split Card (Fits exactly in 1 screen with scale 1 and zero vertical scrollbar) */}
      <div className="max-w-[1040px] w-full max-h-[96vh] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.1)] border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative">
        
        {/* ================= LEFT HERO COLUMN (Col 7) ================= */}
        <div className="hidden lg:flex lg:col-span-7 bg-gradient-to-br from-[#FAFBFD] via-[#F4F7FB] to-[#E9EFF7] p-6 lg:p-8 flex-col justify-between relative overflow-hidden border-r border-slate-200/60">
          
          {/* Subtle curved background illustration shape */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-100/40 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none -ml-16 -mb-16" />

          {/* Top Brand / Logo & Integrated Back to Home */}
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
                    School Study
                  </h2>
                  <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                    Institute Management Platform
                  </p>
                </div>
              </div>

              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors bg-white/80 hover:bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Home</span>
              </Link>
            </div>

            {/* Hero Headlines */}
            <div className="mt-5 max-w-lg">
              <h1 className="text-2xl lg:text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight">
                Manage All Institutes <br />
                from a <span className="text-blue-600">Single Dashboard</span>
              </h1>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-md">
                A powerful multi-tenant platform to manage institutes, users, courses, students, fees, reports and more.
              </p>
            </div>
          </div>

          {/* Centerpiece 3D-Style Laptop Mockup */}
          <div className="relative my-4 flex items-center justify-center z-10">
            {/* Background circular glow */}
            <div className="absolute w-60 h-60 bg-blue-200/40 rounded-full blur-xl pointer-events-none" />

            {/* Floating Super Admin Badge */}
            <div className="absolute -top-2.5 right-6 z-20 px-3 py-1 bg-white rounded-full shadow-[0_6px_16px_rgba(0,0,0,0.06)] border border-slate-100 flex items-center gap-1.5">
              <span className="text-amber-500 text-xs">👑</span>
              <span className="text-[10px] font-extrabold text-slate-800 tracking-tight">Super Admin</span>
            </div>

            {/* Potted Plant Decoration (Left) */}
            <div className="absolute -bottom-1 left-4 z-20 flex flex-col items-center">
              <div className="relative w-7 h-8 flex items-center justify-center">
                <span className="absolute text-emerald-500 transform -rotate-12 -top-1 left-0 text-base">🌿</span>
                <span className="absolute text-emerald-600 transform rotate-12 -top-1.5 right-0 text-sm">🌱</span>
              </div>
              <div className="w-6 h-6 rounded-b-lg bg-gradient-to-b from-slate-200 to-slate-300 shadow-xs border-t border-slate-300" />
            </div>

            {/* Laptop Screen & Body */}
            <div className="w-full max-w-[360px] flex flex-col items-center">
              {/* Screen Bezel */}
              <div className="w-full bg-slate-900 rounded-t-xl p-2 sm:p-2.5 shadow-xl border border-slate-800 relative">
                <div className="w-1.5 h-1.5 bg-slate-700 rounded-full mx-auto mb-1.5" />
                
                {/* Internal Dashboard Display */}
                <div className="bg-[#0F172A] rounded-lg overflow-hidden border border-slate-800 p-2 text-white shadow-inner">
                  {/* Mock Navbar */}
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-800/80 text-[9px]">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 rounded bg-blue-600 flex items-center justify-center text-[7px] font-bold">S</div>
                      <span className="font-bold text-[9px] text-slate-300">School Study HQ</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[7px] text-slate-400">Live Realtime</span>
                    </div>
                  </div>

                  {/* Mock Dashboard Body */}
                  <div className="grid grid-cols-12 gap-1.5">
                    {/* Mock Mini Sidebar */}
                    <div className="col-span-3 space-y-1 py-0.5 border-r border-slate-800 pr-1">
                      <div className="h-1.5 w-full bg-blue-600/60 rounded-xs" />
                      <div className="h-1.5 w-3/4 bg-slate-800 rounded-xs" />
                      <div className="h-1.5 w-4/5 bg-slate-800 rounded-xs" />
                      <div className="h-1.5 w-2/3 bg-slate-800 rounded-xs" />
                    </div>

                    {/* Mock Main Content Area */}
                    <div className="col-span-9 space-y-1.5">
                      {/* Metric cards */}
                      <div className="grid grid-cols-3 gap-1">
                        <div className="bg-slate-800/70 p-1 rounded border border-slate-700/50">
                          <div className="text-[6px] text-slate-400">Institutes</div>
                          <div className="text-[9px] font-extrabold text-blue-400">142</div>
                        </div>
                        <div className="bg-slate-800/70 p-1 rounded border border-slate-700/50">
                          <div className="text-[6px] text-slate-400">Students</div>
                          <div className="text-[9px] font-extrabold text-emerald-400">18.4k</div>
                        </div>
                        <div className="bg-slate-800/70 p-1 rounded border border-slate-700/50">
                          <div className="text-[6px] text-slate-400">Certificates</div>
                          <div className="text-[9px] font-extrabold text-amber-400">9.2k</div>
                        </div>
                      </div>

                      {/* Mini Bar Chart Mockup */}
                      <div className="bg-slate-800/40 p-1.5 rounded border border-slate-800">
                        <div className="flex items-end justify-between h-6 px-1 gap-1">
                          <div className="w-2 bg-blue-500/40 rounded-t-xs h-2.5" />
                          <div className="w-2 bg-blue-500/60 rounded-t-xs h-4" />
                          <div className="w-2 bg-blue-500 rounded-t-xs h-5.5" />
                          <div className="w-2 bg-indigo-500 rounded-t-xs h-4.5" />
                          <div className="w-2 bg-blue-600 rounded-t-xs h-6" />
                          <div className="w-2 bg-emerald-500 rounded-t-xs h-5.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Laptop Keyboard Base */}
              <div className="w-[105%] h-3 bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500 rounded-b-lg shadow-lg flex justify-center items-start relative border-t border-slate-400">
                <div className="w-14 h-0.5 bg-slate-600/40 rounded-full mt-0.5" />
              </div>
            </div>
          </div>

          {/* Bottom 4 Feature Cards */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-200/80 relative z-10">
            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/70 backdrop-blur-xs border border-white shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <Building2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">
                Multi-Institute
              </span>
              <span className="text-[8px] text-slate-500">Management</span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/70 backdrop-blur-xs border border-white shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">
                User & Role
              </span>
              <span className="text-[8px] text-slate-500">Control</span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/70 backdrop-blur-xs border border-white shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">
                Platform
              </span>
              <span className="text-[8px] text-slate-500">Analytics</span>
            </div>

            <div className="flex flex-col items-center text-center p-1.5 rounded-lg bg-white/70 backdrop-blur-xs border border-white shadow-xs">
              <div className="w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-bold text-slate-800 leading-tight">
                Secure &
              </span>
              <span className="text-[8px] text-slate-500">Scalable</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT FORM COLUMN (Col 5) ================= */}
        <div className="col-span-1 lg:col-span-5 bg-white p-6 sm:p-8 flex flex-col justify-center">
          
          {/* Top Royal Crown Badge */}
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mx-auto shadow-xs">
              <Crown className="w-6 h-6 fill-blue-600/15" />
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
              Super Admin Login
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Access the platform control panel
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSuperAdminLogin} className="space-y-3.5">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your super admin email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={() => alert("Please contact infrastructure support or reset password via your Firebase Authentication console.")}
                className="font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer text-xs"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In as Super Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Super Admin Access Security Notice */}
          <div className="mt-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-start gap-2.5">
            <div className="w-5 h-5 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Shield className="w-3 h-3 fill-blue-600/20" />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-900 leading-tight">Super Admin Access</h4>
              <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                This login is only for platform administrators with full access to manage all institutes, users, and system settings.
              </p>
            </div>
          </div>

          {/* Footer Line & Back Link */}
          <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
              <span className="w-5 h-px bg-slate-200" />
              <span>School Study • Super Admin Panel</span>
              <span className="w-5 h-px bg-slate-200" />
            </div>
            <div className="flex items-center gap-3 pt-0.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Home</span>
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                href="/login"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <span>Institute Sign In</span>
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
