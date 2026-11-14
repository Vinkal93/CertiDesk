"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Award, ShieldAlert, Loader2, Lock, ArrowRight } from "lucide-react";
import Link from "next/link";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  const isPublicPage =
    pathname === "/" ||
    pathname === "/landing" ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/su/login") ||
    pathname.startsWith("/verify");

  useEffect(() => {
    if (loading) return;

    // Public pages are always allowed
    if (isPublicPage) {
      setAuthorized(true);
      return;
    }

    // Super Admin Routes Protection (/su and /su/*)
    if (pathname.startsWith("/su")) {
      if (!user) {
        setAuthorized(false);
        router.replace(`/su/login?redirect=${encodeURIComponent(pathname)}`);
        return;
      }
      if (user.role !== "super_admin") {
        setAuthorized(false);
        return;
      }
      setAuthorized(true);
      return;
    }

    // Protected Institute Routes (/dashboard, /students, /courses, etc.)
    if (!user) {
      setAuthorized(false);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setAuthorized(true);
  }, [user, loading, pathname, isPublicPage, router]);

  // Loading Screen while verifying authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6529E8] to-[#8B5CF6] flex items-center justify-center text-white shadow-brand mx-auto animate-pulse">
            <Award className="w-7 h-7 text-amber-300" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-extrabold text-slate-900">CertiDesk Pro</h3>
            <p className="text-xs text-slate-500 font-medium flex items-center justify-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6529E8]" />
              <span>Verifying Authentication & Security Clearance...</span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Public pages render directly
  if (isPublicPage) {
    return <>{children}</>;
  }

  // Unauthorized Access Denied state for non-super-admins trying to access /su
  if (user && user.role !== "super_admin" && pathname.startsWith("/su")) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-white">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Access Denied: 403 Forbidden</h2>
            <p className="text-xs text-slate-400">
              Your account (<strong>{user.email}</strong>) does not have Super Admin platform permissions to view this control plane.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/dashboard"
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg inline-flex items-center gap-2"
            >
              <span>Return to Institute Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated on protected route, show redirecting state
  if (!user) {
    return (
      <div className="min-h-screen bg-[#F7F8FC] flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 mx-auto">
            <Lock className="w-5 h-5 text-slate-700" />
          </div>
          <p className="text-xs text-slate-600 font-bold">Authentication Required</p>
          <p className="text-[11px] text-slate-400">Redirecting to secure login portal...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
