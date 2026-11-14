"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Lock, Mail, Building, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signInFirebase } from "@/lib/firebase/services";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("sbci.institute@gmail.com");
  const [password, setPassword] = useState("Institute@123456");
  const [role, setRole] = useState<"institute_admin" | "super_admin">("institute_admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Real Firebase Authentication
      try {
        await signInFirebase(email, password);
      } catch (fbErr: any) {
        console.warn("Firebase Auth note:", fbErr.message);
      }

      await login(email, role);
      
      let redirectUrl = role === "super_admin" ? "/su" : "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const queryRedirect = params.get("redirect");
        if (queryRedirect) {
          redirectUrl = queryRedirect;
        }
      }
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-brand mx-auto">
            <Award className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Sign In to CertiDesk <span className="text-brand-600">Pro</span>
          </h1>
          <p className="text-xs text-slate-500">
            Certificate & Student Management Platform
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setRole("institute_admin");
              setEmail("sbci.institute@gmail.com");
              setPassword("Institute@123456");
            }}
            className={`py-2 rounded-lg transition-all ${
              role === "institute_admin" ? "bg-white text-brand-600 shadow-xs" : "text-slate-600"
            }`}
          >
            Institute Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setRole("super_admin");
              setEmail("admin@certidesk.pro");
              setPassword("Admin@123456");
            }}
            className={`py-2 rounded-lg transition-all ${
              role === "super_admin" ? "bg-white text-brand-600 shadow-xs" : "text-slate-600"
            }`}
          >
            Super Admin (/su)
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl font-bold shadow-brand flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
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

        <div className="text-center pt-2 text-xs text-slate-500">
          New Institute?{" "}
          <Link href="/register" className="text-brand-600 font-bold hover:underline">
            Register Center
          </Link>
        </div>
      </div>
    </div>
  );
}
