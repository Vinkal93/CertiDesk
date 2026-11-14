"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Building, 
  Wallet, 
  Bell, 
  Plus, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  LogOut, 
  Settings, 
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import RechargeModal from "@/components/modals/RechargeModal";

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export default function Header({ onToggleSidebar }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, institute, walletBalance, logout } = useAuth();
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Super Admin portal is STRICTLY accessed on /su routes
  const isSuperAdminPortal = pathname.startsWith("/su") || pathname.startsWith("/super-admin");

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
        {/* Left: Institute vs Super Admin Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs flex-shrink-0 ${
              isSuperAdminPortal 
                ? "bg-slate-900 text-amber-400 border border-slate-800" 
                : "bg-slate-100 border border-slate-200 text-slate-900"
            }`}>
              {isSuperAdminPortal ? (
                <ShieldCheck className="w-5 h-5 text-amber-300" />
              ) : (
                <Building className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm leading-none">
                  {isSuperAdminPortal ? "CertiDesk Pro HQ" : (institute?.name || "SBCI Computer Institute")}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  isSuperAdminPortal 
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200" 
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full mr-1 ${
                    isSuperAdminPortal ? "bg-indigo-600 animate-pulse" : "bg-emerald-500 animate-pulse"
                  }`} />
                  {isSuperAdminPortal ? "Master HQ" : "Active"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {isSuperAdminPortal ? "Master Control Plane" : `Institute ID: ${institute?.id || "SBCI1001"}`}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Wallet, Notifications, Profile */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {/* Notification Bell */}
          <button 
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Wallet Balance Card matching screenshot (Shown for Institute Portal) */}
          {!isSuperAdminPortal ? (
            <div className="flex items-center bg-slate-50 border border-slate-200/90 rounded-xl px-3 py-1.5 gap-2.5 md:gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-semibold text-slate-500 tracking-wider leading-none">
                    Wallet Balance
                  </p>
                  <p className="text-xs md:text-sm font-bold text-slate-900 mt-0.5 font-mono">
                    ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRechargeModal(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-2.5 md:px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Recharge</span>
              </button>
            </div>
          ) : (
            /* Super Admin Status Badge */
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-slate-900" />
              <span>HQ Root Access</span>
            </div>
          )}

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors text-left"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs bg-slate-900">
                {isSuperAdminPortal ? "SU" : (institute?.ownerName ? institute.ownerName.charAt(0) : "A")}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {isSuperAdminPortal ? "Super Admin" : (institute?.ownerName || "Vinkal Prajapati")}
                </p>
                <p className="text-[11px] text-slate-500 capitalize">
                  {isSuperAdminPortal ? "Root Admin" : "Institute Admin"}
                </p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-dropdown border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">
                    {isSuperAdminPortal ? "Super Administrator" : (institute?.ownerName || "Institute Admin")}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {isSuperAdminPortal ? "admin@certidesk.pro" : (institute?.email || "sbci.institute@gmail.com")}
                  </p>
                </div>

                <div className="py-1">
                  {!isSuperAdminPortal ? (
                    <>
                      <Link
                        href="/institute/profile"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>Institute Profile</span>
                      </Link>

                      <Link
                        href="/institute/settings"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Settings className="w-3.5 h-3.5 text-slate-400" />
                        <span>System Settings</span>
                      </Link>
                    </>
                  ) : (
                    <Link
                      href="/"
                      onClick={() => setShowUserDropdown(false)}
                      className="w-full text-left px-4 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center gap-2 font-bold"
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span>Switch to Institute Portal</span>
                    </Link>
                  )}
                </div>

                <div className="pt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      logout();
                      router.push(isSuperAdminPortal ? "/su/login" : "/login");
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Real Razorpay Recharge Modal */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
        />
      )}
    </>
  );
}
