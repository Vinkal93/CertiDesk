"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  FileSpreadsheet,
  Award,
  BookOpen,
  Calendar,
  Layers,
  History,
  QrCode,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  Building,
  ShieldCheck,
  Settings,
  Headphones,
  FileText,
  ClipboardList,
  Archive,
  ShieldAlert,
  Sliders,
  DollarSign,
  ArrowUpRight,
  Radio,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, institute, walletBalance, isFirebaseLive } = useAuth();

  // Super Admin portal is STRICTLY accessed on /su routes
  const isSuperAdminPortal = pathname.startsWith("/su") || pathname.startsWith("/super-admin");

  // Institute Admin Navigation Structure (Standard Institute Portal)
  const instituteNavSections: NavSection[] = [
    {
      title: "Student Management",
      items: [
        { name: "Students", href: "/students", icon: Users },
        { 
          name: "Add Student", 
          href: "/students/add", 
          icon: UserPlus, 
          badge: "₹150", 
          badgeColor: "bg-purple-100 text-[#6529E8]" 
        },
        { name: "Import / Bulk Add", href: "/students/import", icon: FileSpreadsheet },
        { name: "Archived Students", href: "/students/archived", icon: Archive },
      ],
    },
    {
      title: "Academic Management",
      items: [
        { name: "Courses", href: "/courses", icon: BookOpen },
        { name: "Batches", href: "/batches", icon: Layers },
        { name: "Attendance", href: "/attendance", icon: Calendar },
      ],
    },
    {
      title: "Examinations",
      items: [
        { name: "Examinations", href: "/examinations", icon: ClipboardList },
        { name: "Marksheet Generator", href: "/marksheets", icon: FileText },
      ],
    },
    {
      title: "Certificate Management",
      items: [
        { name: "Generate Certificate", href: "/certificates/generate", icon: Award },
        { name: "Certificate Templates", href: "/certificates/templates", icon: Layers },
        { name: "Certificate History", href: "/certificates/history", icon: History },
        { name: "Verification (QR)", href: "/verification", icon: QrCode },
      ],
    },
    {
      title: "Financial & Ledger",
      items: [
        { 
          name: "Wallet & Recharge", 
          href: "/wallet", 
          icon: Wallet, 
          badge: `₹${(institute?.walletBalance ?? walletBalance).toLocaleString("en-IN")}`, 
          badgeColor: "bg-emerald-100 text-emerald-700" 
        },
        { name: "Transactions", href: "/transactions", icon: ArrowLeftRight },
        { name: "Usage & Billing", href: "/billing", icon: TrendingUp },
      ],
    },
    {
      title: "Institute Details",
      items: [
        { name: "Institute Profile", href: "/institute/profile", icon: Building },
        { name: "Users & Roles", href: "/institute/users", icon: ShieldCheck },
        { name: "Settings", href: "/institute/settings", icon: Settings },
      ],
    },
  ];

  // Super Admin Navigation Structure (ONLY for /su Portal)
  const superAdminNavSections: NavSection[] = [
    {
      title: "Platform Administration",
      items: [
        { name: "HQ Master Overview", href: "/su", icon: LayoutDashboard },
        { 
          name: "Manage Institutes", 
          href: "/su#institutes", 
          icon: Building, 
          badge: "Control", 
          badgeColor: "bg-amber-100 text-amber-800" 
        },
        { name: "Register New Institute", href: "/register", icon: UserPlus },
      ],
    },
    {
      title: "Global Cohorts & Catalogs",
      items: [
        { name: "All Students (Global)", href: "/su#students", icon: Users },
        { name: "Master Courses Catalog", href: "/courses", icon: BookOpen },
        { name: "Certificate Templates", href: "/certificates/templates", icon: Award },
      ],
    },
    {
      title: "Platform Financials & Revenue",
      items: [
        { name: "Platform Financials", href: "/su#financials", icon: DollarSign },
        { name: "Fee & Pricing Rules", href: "/su#pricing", icon: Sliders },
      ],
    },
    {
      title: "Governance & Security",
      items: [
        { name: "System Audit Logs", href: "/su#audit", icon: ShieldAlert },
        { name: "Global Settings", href: "/institute/settings", icon: Settings },
      ],
    },
  ];

  const sections = isSuperAdminPortal ? superAdminNavSections : instituteNavSections;

  return (
    <aside className="w-64 h-screen bg-white text-slate-700 flex flex-col flex-shrink-0 border-r border-slate-200/90 shadow-[1px_0_4px_rgba(0,0,0,0.02)] z-30 select-none overflow-hidden">
      
      {/* Brand Header - Strict Separation between Institute & Super Admin */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 ${
            isSuperAdminPortal 
              ? "bg-gradient-to-br from-slate-900 to-indigo-950 text-amber-400 ring-2 ring-indigo-200/70" 
              : "bg-gradient-to-br from-[#6529E8] to-[#8B5CF6] shadow-brand"
          }`}>
            {isSuperAdminPortal ? (
              <ShieldCheck className="w-6 h-6 text-amber-300" />
            ) : (
              <Award className="w-6 h-6 text-amber-300" />
            )}
          </div>
          <div className="overflow-hidden">
            <div className="flex items-center gap-1.5">
              <h1 className="text-slate-900 font-extrabold text-lg leading-tight tracking-tight">CertiDesk</h1>
              <span className={`font-black text-lg ${isSuperAdminPortal ? "text-indigo-600" : "text-[#6529E8]"}`}>
                Pro
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase ${
                isSuperAdminPortal 
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200/60" 
                  : "bg-purple-50 text-purple-700 border border-purple-200/60"
              }`}>
                {isSuperAdminPortal ? "Super Admin HQ" : "Institute Portal"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Context Pill */}
        <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
          {isSuperAdminPortal ? (
            <div className="flex items-center justify-between w-full">
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-800 truncate">Platform Control Plane</p>
                <p className="text-[10px] text-slate-500 font-mono">Master Route: /su</p>
              </div>
              <span className="flex h-2 w-2 relative" title="Super Admin Mode Active">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="truncate">
                <p className="text-[11px] font-bold text-slate-800 truncate">{institute?.name || "SBCI Institute"}</p>
                <p className="text-[10px] text-slate-500 font-mono">ID: {institute?.id || "SBCI1001"}</p>
              </div>
              <span className="flex h-2 w-2 relative" title="Institute Active">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Main Nav Scrollable Area (Internal scroll ONLY, page does not scroll this!) */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        
        {/* Primary Dashboard Link */}
        <div>
          <Link
            href={isSuperAdminPortal ? "/su" : "/dashboard"}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
              pathname === (isSuperAdminPortal ? "/su" : "/dashboard")
                ? isSuperAdminPortal 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-[#6529E8] text-white shadow-brand shadow-[#6529E8]/25"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{isSuperAdminPortal ? "Master HQ Control" : "Dashboard"}</span>
          </Link>
        </div>

        {/* Navigation Sections */}
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3.5 mb-1.5">
              {section.title}
            </h3>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? isSuperAdminPortal
                          ? "bg-slate-900 text-white shadow-sm"
                          : "bg-[#6529E8] text-white shadow-sm shadow-[#6529E8]/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 flex-shrink-0 ${
                        isActive 
                          ? "text-white" 
                          : isSuperAdminPortal 
                            ? "text-slate-500" 
                            : "text-slate-400"
                      }`} />
                      <span className="truncate">{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                          isActive 
                            ? "bg-white/20 text-white" 
                            : item.badgeColor || "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer */}
      <div className="p-3 border-t border-slate-200/80 bg-slate-50/50 space-y-2 flex-shrink-0">
        
        {/* Firebase Realtime Connection Pill */}
        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-white border border-slate-200/80 text-[11px]">
          <div className="flex items-center gap-1.5 truncate">
            <Radio className={`w-3.5 h-3.5 ${isFirebaseLive ? "text-emerald-500 animate-pulse" : "text-amber-500"}`} />
            <span className="text-slate-600 font-medium truncate">
              {isFirebaseLive ? "Firebase Realtime" : "Local Sync"}
            </span>
          </div>
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            ONLINE
          </span>
        </div>

        {/* If in Super Admin Portal (/su), offer a quick exit to the Institute Portal */}
        {isSuperAdminPortal ? (
          <Link
            href="/dashboard"
            onClick={onNavigate}
            className="flex items-center justify-between w-full py-2 px-3 text-xs font-bold rounded-xl bg-purple-50 hover:bg-purple-100 text-[#6529E8] border border-purple-200 transition-all"
          >
            <div className="flex items-center gap-2 truncate">
              <Building className="w-3.5 h-3.5" />
              <span className="truncate">View Institute Portal</span>
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
          </Link>
        ) : (
          /* For Institute Admin, standard Help & Support only (No Super Admin backdoor!) */
          <Link
            href="/support"
            onClick={onNavigate}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all duration-150"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>Help & Support</span>
          </Link>
        )}
      </div>
    </aside>
  );
}
