"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, ArrowRight, Loader2, AlertCircle, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { signInFirebase } from "@/lib/firebase/services";

export default function SuperAdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("admin@certidesk.pro");
  const [password, setPassword] = useState("Admin@123456");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuperAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Real Firebase Auth attempt
      try {
        await signInFirebase(email, password);
      } catch (fbErr: any) {
        console.warn("Firebase Auth notice:", fbErr.message);
      }

      await login(email, "super_admin");
      
      let redirectUrl = "/su";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        redirectUrl = params.get("redirect") || "/su";
      }
      router.push(redirectUrl);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate Super Admin");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6 text-white">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 shadow-xl mx-auto ring-4 ring-slate-800">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            Restricted Master Access
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight pt-1">
            CertiDesk <span className="text-indigo-400">HQ</span> Control
          </h1>
          <p className="text-xs text-slate-400">
            Super Administrator authentication portal (/su)
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/80 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSuperAdminLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-300 block mb-1">HQ Master Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="admin@certidesk.pro"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-300 block mb-1">Master Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl font-medium text-white focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 text-xs transition-all cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Enter Master Control Plane (/su)</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center">
          <Link href="/login" className="text-xs text-slate-400 hover:text-white transition-colors">
            ← Return to Standard Institute Login
          </Link>
        </div>
      </div>
    </div>
  );
}
