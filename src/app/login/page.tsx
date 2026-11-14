"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Lock, Building, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { signInFirebase } from "@/lib/firebase/services";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("SBCI1001");
  const [password, setPassword] = useState("Institute@123456");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const trimmedId = identifier.trim();
      if (!trimmedId) {
        throw new Error("Please enter your Institute ID or registered Email address.");
      }
      if (!password) {
        throw new Error("Please enter your password.");
      }

      // Check institute records in dataStore
      const allInstitutes = await dataStore.getAllInstitutes();
      const matched = allInstitutes.find(
        (i) =>
          i.id.toUpperCase() === trimmedId.toUpperCase() ||
          i.email.toLowerCase() === trimmedId.toLowerCase()
      );

      if (!matched) {
        throw new Error("No institute account found matching this Institute ID or Email address.");
      }

      // Validate account status
      if (matched.status === "pending") {
        throw new Error("Your institute account is pending verification and approval by the platform administrator.");
      }
      if (matched.status === "suspended") {
        throw new Error("This institute account has been suspended. Please contact platform support.");
      }

      // Validate password
      const expectedPassword = matched.password || "Institute@123456";
      let passwordValid = password === expectedPassword;

      if (!passwordValid && matched.email) {
        // Also verify against Firebase Auth if configured
        try {
          await signInFirebase(matched.email, password);
          passwordValid = true;
        } catch {
          // Keep false
        }
      }

      if (!passwordValid) {
        throw new Error("Invalid password. Please check your credentials or contact the administrator.");
      }

      // Authenticate session as institute admin
      await login(matched.email, "institute_admin", matched.id);

      let redirectUrl = "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const queryRedirect = params.get("redirect");
        if (queryRedirect && !queryRedirect.startsWith("/su")) {
          redirectUrl = queryRedirect;
        }
      }

      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 selection:bg-slate-900 selection:text-white">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-slate-200/90 p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-black shadow-sm">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">CertiDesk Pro</span>
          </Link>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Institute Sign In
          </h1>
          <p className="text-xs text-slate-500">
            Sign in with your Center ID or Email to access students & certificates.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Institute ID or Email Address
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. SBCI1001 or institute@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:outline-hidden transition-all text-slate-800"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Enter the Institute ID (e.g. SBCI1001) or Email assigned to your center.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-semibold text-slate-700">Password</label>
              <Link href="/support" className="text-[11px] text-slate-600 hover:text-slate-900 hover:underline font-medium">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your login password"
                className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:border-transparent focus:outline-hidden transition-all text-slate-800"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl font-bold shadow-sm flex items-center justify-center gap-2 text-xs transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Want to register a new institute center?{" "}
          <Link href="/register" className="text-slate-900 font-bold hover:underline">
            Register Center
          </Link>
        </div>
      </div>
    </div>
  );
}
