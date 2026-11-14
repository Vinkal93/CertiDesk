"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Award, 
  Users, 
  Layers, 
  Wallet, 
  GraduationCap, 
  FileText, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  QrCode, 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Search, 
  Sparkles, 
  Check, 
  Sliders, 
  Headphones, 
  TrendingUp, 
  HelpCircle,
  ExternalLink,
  Laptop,
  CheckCircle,
  Star,
  Sun
} from "lucide-react";

export default function LandingPage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedCertTemplate, setSelectedCertTemplate] = useState<string>("adca");

  const featureTabs = [
    {
      id: "student",
      title: "Student Management",
      icon: Users,
      badge: "Core Feature",
      heading: "Student Management",
      description: "Add, manage and track student records with a complete digital profile.",
      points: [
        "Quick student registration (₹150)",
        "Bulk import from Excel/CSV",
        "Complete student profile & history",
        "Course and batch assignment",
        "ID card and admission records"
      ],
      linkText: "Learn More →",
      linkHref: "/students",
    },
    {
      id: "batch",
      title: "Course & Batch",
      icon: Layers,
      badge: "Cohort Tracking",
      heading: "Course & Batch Management",
      description: "Organize academic cohorts, schedule timings, and track student attendance effortlessly.",
      points: [
        "Create morning, evening & weekend batches",
        "Transfer students between batches with history",
        "Daily attendance register with export",
        "Batch progress & completion ratio tracking",
        "Pre-loaded ADCA, DCA, Typing & CCC curriculum"
      ],
      linkText: "Explore Batches →",
      linkHref: "/batches",
    },
    {
      id: "exam",
      title: "Examination & Results",
      icon: ClipboardList,
      badge: "Grading Engine",
      heading: "Examination & Marks Management",
      description: "Record theory, practical and internal marks with automatic grade calculations.",
      points: [
        "Subject-wise marks entry with max marks validation",
        "Automatic percentage and grade calculation (A+, A, B)",
        "One-click professional A4 marksheet generation",
        "Configurable passing criteria per course",
        "Batch-wise result correction and audit history"
      ],
      linkText: "View Examinations →",
      linkHref: "/examinations",
    },
    {
      id: "certificate",
      title: "Certificate Generator",
      icon: Award,
      badge: "Instant PDF",
      heading: "Professional Certificate Engine",
      description: "Generate print-ready high-resolution certificates with verifiable QR codes.",
      points: [
        "Upload custom certificate background images (PNG/JPG)",
        "Drag & drop student name, roll number, dates & grade",
        "Instant tamper-proof QR code verification",
        "ADCA, Typing, DCA, CCC & custom formats",
        "High-res vector print export at 300 DPI"
      ],
      linkText: "Open Certificate Studio →",
      linkHref: "/certificates/templates",
    },
    {
      id: "wallet",
      title: "Wallet & Billing",
      icon: Wallet,
      badge: "Pay-As-You-Go",
      heading: "Transparent Wallet Billing",
      description: "No monthly recurring charges. Pay only when you enroll a student or update records.",
      points: [
        "Zero monthly subscription or hidden fees",
        "₹150 deducted per new student admission",
        "₹100 deducted per student profile edit",
        "Unlimited certificate & marksheet generation (₹0)",
        "Instant Razorpay recharge via UPI, Cards & NetBanking"
      ],
      linkText: "View Wallet System →",
      linkHref: "/wallet",
    },
    {
      id: "reports",
      title: "Reports & Analytics",
      icon: TrendingUp,
      badge: "Data Insights",
      heading: "Institute Reports & Analytics",
      description: "Comprehensive reporting on admission trends, course popularity, and revenue.",
      points: [
        "Monthly admission trends and enrollment graphs",
        "Course-wise revenue and student distribution",
        "Upcoming batch completion alerts",
        "One-click Excel and PDF roster exports",
        "Complete financial audit logs and ledger"
      ],
      linkText: "See Analytics →",
      linkHref: "/billing",
    }
  ];

  const faqs = [
    {
      q: "How do I register my institute?",
      a: "Click 'Create Free Institute' and enter your institute name, owner details, contact number, and address. Your unique Institute ID (e.g. SBCI1001) is generated instantly, and you can start adding students immediately."
    },
    {
      q: "How does wallet recharge work?",
      a: "CertiDesk Pro operates on a prepaid wallet model. You recharge your wallet using Razorpay (supports UPI, Google Pay, PhonePe, Cards, Net Banking). When you admit a new student, ₹150 is deducted from your balance."
    },
    {
      q: "How much does a new student admission cost?",
      a: "Each new student admission costs exactly ₹150. This covers automatic unique enrollment number generation, student profile management, batch assignment, and unlimited certificate and marksheet generations for that student."
    },
    {
      q: "Can I upload my own certificate design?",
      a: "Yes! You can upload your existing certificate background design in PNG, JPG, or WebP format. Our visual template editor allows you to place dynamic fields like student name, course, roll number, issue date, and QR code precisely where you want."
    },
    {
      q: "Can I generate marksheets?",
      a: "Yes. You can enter subject-wise theory and practical marks. The system automatically computes total marks, percentage, and grade (A+, A, B, etc.) and generates an authentic, print-ready A4 marksheet with your institute's branding."
    },
    {
      q: "How does QR verification work?",
      a: "Every certificate and marksheet generated includes a unique encrypted QR code. Anyone (employers, colleges, or students) scanning the QR code is directed to a secure public verification page displaying the authentic institute credentials."
    },
    {
      q: "Is student data secure?",
      a: "Absolutely. All records are isolated in our multi-tenant Firestore database with enterprise-grade security rules. Only authorized institute staff can access your student records, and automated cloud backups prevent any data loss."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white font-sans antialiased">
      
      {/* 1. CLEAN MINIMALIST NAVBAR (Matching Reference Image) */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-none">
                CertiDesk Pro
              </span>
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mt-1">
                INSTITUTE & CERTIFICATE SAAS
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-slate-950 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-slate-950 transition-colors">Pricing</a>
            <a href="#capabilities" className="hover:text-slate-950 transition-colors">Charges & Wallet</a>
            <a href="#how-it-works" className="hover:text-slate-950 transition-colors">How It Works</a>
            <a href="#why-us" className="hover:text-slate-950 transition-colors">Security</a>
            <a href="#faqs" className="hover:text-slate-950 transition-colors">FAQ</a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center justify-center w-8 h-8 rounded-xl border border-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer">
              <Sun className="w-4 h-4" />
            </div>

            <Link
              href="/login"
              className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Open Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (CENTERED MINIMALIST TYPOGRAPHY MATCHING REFERENCE IMAGE) */}
      <section className="pt-16 pb-20 md:pt-24 md:pb-28 bg-white text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          {/* Centered Pill Badge (Like Reference Image) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-50 border border-slate-200/90 text-slate-700 shadow-xs mb-8">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Version 2.0 • Statutory Charges Aware & Multi-Tenant</span>
          </div>

          {/* Main Headline (Record. Review. Reflect style) */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-950 tracking-tight leading-[1.08] max-w-4xl mx-auto">
            Manage. Examine.{" "}
            <span className="bg-blue-50 text-blue-600 px-7 py-1 rounded-full inline-block mt-2">
              Certify.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
            The high-performance certificate & student management platform built for serious computer institutes. Track admissions, manage courses & batches, evaluate exam marks, and issue tamper-proof QR certificates without bloated spreadsheets.
          </p>

          {/* Dual Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <Link
              href="/dashboard"
              className="px-6 py-3.5 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>Try Interactive Demo</span>
            </Link>

            <Link
              href="/register"
              className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs rounded-xl border border-slate-300 shadow-xs flex items-center gap-1.5 transition-all"
            >
              <span>Create Free Institute</span>
              <ArrowRight className="w-4 h-4 text-slate-600" />
            </Link>
          </div>

          {/* Trust Subtext */}
          <p className="text-xs text-slate-400 mt-6 font-medium">
            No credit card required • Instant wallet access • Tamper-proof QR certificates
          </p>

          {/* 3. CENTERED PURE-CSS PRODUCT PREVIEW CARD (NO IMAGES / NO CLUNKY LAPTOP BEZEL) */}
          <div className="mt-14 max-w-5xl mx-auto">
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-[0_20px_60px_rgba(15,23,42,0.06)] overflow-hidden text-left">
              
              {/* Window Header */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" />
                </div>

                <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-600 font-mono shadow-2xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>certidesk.pro/dashboard</span>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Live Synchronized</span>
                </div>
              </div>

              {/* Context Strip */}
              <div className="px-6 py-4 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">SBCI Computer Institute</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Active
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">Institute ID: SBCI1001</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-slate-600" />
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold leading-none">Wallet</span>
                      <span className="text-xs font-mono font-bold text-slate-900 leading-none">₹ 2,850.00</span>
                    </div>
                  </div>
                  <Link
                    href="/wallet"
                    className="px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold shadow-xs"
                  >
                    + Recharge
                  </Link>
                </div>
              </div>

              {/* 4 Clean Metric Cards */}
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-semibold block">Total Students</span>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-2xl font-black text-slate-900 font-mono">482</span>
                      <span className="text-[10px] text-emerald-600 font-bold">↑ +12 mo</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-semibold block">Certificates Issued</span>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-2xl font-black text-slate-900 font-mono">738</span>
                      <span className="text-[10px] text-blue-600 font-bold">QR Ready</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-semibold block">Active Batches</span>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-2xl font-black text-slate-900 font-mono">24</span>
                      <span className="text-[10px] text-slate-600 font-bold">Running</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                    <span className="text-[11px] text-slate-500 font-semibold block">Admission Charge</span>
                    <div className="flex items-baseline justify-between mt-1.5">
                      <span className="text-2xl font-black text-slate-900 font-mono">₹ 150</span>
                      <span className="text-[10px] text-slate-600 font-bold">Prepaid</span>
                    </div>
                  </div>
                </div>

                {/* Live Admissions Roster */}
                <div className="rounded-2xl border border-slate-200/90 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Recent Student Admissions & Enrolled Batches</span>
                    <Link href="/students" className="text-blue-600 font-bold hover:underline">
                      View All Roster →
                    </Link>
                  </div>

                  <div className="divide-y divide-slate-100 text-xs">
                    <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                          KP
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Khushbu Prajapati</p>
                          <p className="text-[11px] text-slate-400 font-mono">Enroll: SBCI/ADCA/0268</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                          ADCA (1 Year)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          HV
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Himanshu Vishwakarma</p>
                          <p className="text-[11px] text-slate-400 font-mono">Enroll: SBCI/TYP/0267</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                          Typing Proficiency
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs">
                          SG
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Sneha Gupta</p>
                          <p className="text-[11px] text-slate-400 font-mono">Enroll: SBCI/ADCA/0266</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">
                          ADCA (1 Year)
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. PRODUCT CAPABILITIES STRIP (4 CLEAN COLUMNS) */}
      <section id="capabilities" className="bg-[#F8FAFC] border-y border-slate-200/80 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            
            {/* Col 1 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4 first:pl-0">
              <div className="w-11 h-11 rounded-xl bg-white text-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-2xs">
                <GraduationCap className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Student Management</h3>
                <p className="text-xs text-slate-500 mt-1">Admission, profile, batch & records</p>
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-11 h-11 rounded-xl bg-white text-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-2xs">
                <Layers className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Course & Batch</h3>
                <p className="text-xs text-slate-500 mt-1">Manage cohorts, timings & attendance</p>
              </div>
            </div>

            {/* Col 3 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-11 h-11 rounded-xl bg-white text-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-2xs">
                <Award className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Certificate & Marksheet</h3>
                <p className="text-xs text-slate-500 mt-1">Template based, print-ready PDF</p>
              </div>
            </div>

            {/* Col 4 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-11 h-11 rounded-xl bg-white text-slate-900 flex items-center justify-center flex-shrink-0 border border-slate-200 shadow-2xs">
                <Wallet className="w-5 h-5 text-slate-700" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Wallet & Billing</h3>
                <p className="text-xs text-slate-500 mt-1">Recharge, auto-deduction & reports</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE CERTIDESK PRO */}
      <section id="why-us" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
              Why Choose CertiDesk Pro?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              A Complete Digital Solution for Computer Institutes
            </h2>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed">
              Everything you need to run your center smoothly — from student admissions to print-ready certificates with instant QR verification.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-800">
                  <Users className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Multi-Course Support</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Admission, ADCA, Typing, DCA, CCC, and custom curriculum configured for your center.
                </p>
              </div>

              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-800">
                  <Layers className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Batch Management</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Create, manage and track morning, evening & weekend batches with complete history.
                </p>
              </div>

              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-800">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Examination & Results</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Conduct exams and generate automatic marksheets with theory, practical & grades.
                </p>
              </div>

              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-800">
                  <Award className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Custom Certificate Backgrounds</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Upload your institute design and dynamically overlay student name, roll & grade.
                </p>
              </div>

              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-800">
                  <Wallet className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Transparent Wallet System</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  ₹150 per new admission, ₹100 per profile update. Zero recurring monthly rental.
                </p>
              </div>

              <div className="bg-slate-50/60 p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
                <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-3 text-slate-800">
                  <QrCode className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Instant QR Verification</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Online verification portal where employers and colleges can verify student credentials.
                </p>
              </div>
            </div>

            {/* Right Certificate Card */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[440px] bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200">
                <div className="border border-slate-200 rounded-2xl p-6 text-center space-y-4 bg-slate-50/50">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#0F172A] flex items-center justify-center text-white">
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                      SBCI Computer Institute
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif italic text-slate-800 font-bold">
                      Certificate of Completion
                    </h3>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 mt-0.5">
                      Academic Session 2025-2026
                    </p>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="text-[11px] text-slate-400">Awarded to</p>
                    <p className="text-base font-bold text-slate-900 underline decoration-slate-300 underline-offset-4">
                      Khushbu Prajapati
                    </p>
                    <p className="text-[11px] leading-relaxed pt-1">
                      for completing <strong>Advance Diploma in Computer Application (ADCA)</strong> with Grade <strong>A+</strong>.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-left text-[9px] text-slate-500">
                    <div>
                      <p className="font-mono font-bold text-slate-700">Roll: SBCI/ADCA/0268</p>
                      <p>Issue Date: 04 Oct 2026</p>
                      <p className="font-serif italic text-slate-800 font-bold mt-2">Director Signature</p>
                    </div>

                    <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-center">
                      <QrCode className="w-full h-full text-slate-800" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PLATFORM STATISTICS (Clean Dark Slate Bar) */}
      <section className="bg-[#0F172A] text-white py-14 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="pt-4 md:pt-0 space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">2,500+</h3>
              <p className="text-xs text-slate-400 font-medium">Institutes Trust Us</p>
            </div>

            <div className="pt-4 md:pt-0 space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">2.5 Lakh+</h3>
              <p className="text-xs text-slate-400 font-medium">Students Managed</p>
            </div>

            <div className="pt-4 md:pt-0 space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">5 Lakh+</h3>
              <p className="text-xs text-slate-400 font-medium">Certificates Generated</p>
            </div>

            <div className="pt-4 md:pt-0 space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">99.9%</h3>
              <p className="text-xs text-slate-400 font-medium">Platform Reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. POWERFUL FEATURES (Clean Interactive Switcher) */}
      <section id="features" className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              Everything Your Institute Needs
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              A streamlined SaaS workflow designed to eliminate manual spreadsheet work.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Tabs List */}
            <div className="lg:col-span-4 space-y-2">
              {featureTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeFeatureTab === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(idx)}
                    className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between border ${
                      isActive
                        ? "bg-[#0F172A] text-white border-slate-900 shadow-sm"
                        : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-700"
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-xs">{tab.title}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                    }`}>
                      {tab.badge}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Tab Content */}
            <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-sm">
              <div className="space-y-4">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
                  {featureTabs[activeFeatureTab].badge}
                </span>
                
                <h3 className="text-2xl font-black text-slate-900">
                  {featureTabs[activeFeatureTab].heading}
                </h3>
                
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                  {featureTabs[activeFeatureTab].description}
                </p>

                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {featureTabs[activeFeatureTab].points.map((pt, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-medium">{pt}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-6">
                  <Link
                    href={featureTabs[activeFeatureTab].linkHref}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                  >
                    <span>{featureTabs[activeFeatureTab].linkText}</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. HOW IT WORKS */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
              Simple 4-Step Process
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              How CertiDesk Pro Works
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Get your entire institute up and running in under five minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs">
                01
              </span>
              <h4 className="font-bold text-sm text-slate-900">Register Institute</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fill in basic institute details to get your unique Center ID instantly.
              </p>
            </div>

            <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs">
                02
              </span>
              <h4 className="font-bold text-sm text-slate-900">Add Courses & Batches</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select ADCA, CCC, Typing or create custom course durations and timings.
              </p>
            </div>

            <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs">
                03
              </span>
              <h4 className="font-bold text-sm text-slate-900">Admit Students</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add students individually or bulk import from Excel for ₹150 per student.
              </p>
            </div>

            <div className="bg-slate-50/60 p-6 rounded-2xl border border-slate-200/90 space-y-3">
              <span className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-mono font-bold text-xs">
                04
              </span>
              <h4 className="font-bold text-sm text-slate-900">Generate & Print</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Instantly export high-resolution certificates and marksheets with live QR codes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. TRANSPARENT WALLET PRICING */}
      <section id="pricing" className="py-20 md:py-28 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
              Clear & Transparent Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              Pay As You Enroll. Zero Monthly Rents.
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              No mandatory subscriptions, setup costs, or renewal fees.
            </p>
          </div>

          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Student Admission</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-950 font-mono">₹ 150</span>
                <span className="text-xs text-slate-500">/ student</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deducted once upon admission. Includes lifetime profile storage and unlimited certificate generations.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border-2 border-slate-900 shadow-sm space-y-4 relative">
              <span className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-0.5 bg-[#0F172A] text-white text-[10px] font-bold rounded-full">
                UNLIMITED USAGE
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Certificate Issuance</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-950 font-mono">₹ 0</span>
                <span className="text-xs text-slate-500">/ free</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Generate, download and verify unlimited PDF certificates and marksheets for every enrolled student.
              </p>
            </div>

            <div className="bg-white p-7 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Student Profile Edit</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-slate-950 font-mono">₹ 100</span>
                <span className="text-xs text-slate-500">/ update</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Applies only when editing student personal details post-admission to ensure academic record audit integrity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FREQUENTLY ASKED QUESTIONS */}
      <section id="faqs" className="py-20 md:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-14">
            <h2 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm">
              Answers to common queries regarding registration, billing, and certificates.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:bg-slate-50 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaqIndex === idx ? "rotate-180" : ""
                  }`} />
                </button>
                {openFaqIndex === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. CALL TO ACTION BANNER */}
      <section className="py-16 md:py-20 bg-[#0F172A] text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Ready to Streamline Your Institute Management?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Register your center today and generate authentic tamper-proof certificates with QR verification.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <Link
              href="/register"
              className="px-6 py-3.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              Get Started Free →
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition-all"
            >
              Login to Portal
            </Link>
          </div>
        </div>
      </section>

      {/* 12. COMPREHENSIVE FOOTER (ZERO /SU LINKS) */}
      <footer className="bg-white text-slate-600 py-14 border-t border-slate-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-200">
            
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#0F172A] flex items-center justify-center text-white">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <span className="font-black text-slate-900 text-base">CertiDesk Pro</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed max-w-sm">
                Production-grade multi-institute student, batch, course, marksheet and certificate management platform built for modern educational coaching centers.
              </p>
              <p className="text-slate-400 font-mono text-[10px]">
                Powered by Firebase Cloud • Hosted on Vercel
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/students" className="hover:text-slate-900 transition-colors">Student Management</Link></li>
                <li><Link href="/batches" className="hover:text-slate-900 transition-colors">Batch Management</Link></li>
                <li><Link href="/courses" className="hover:text-slate-900 transition-colors">Course Catalog</Link></li>
                <li><Link href="/certificates/templates" className="hover:text-slate-900 transition-colors">Certificate Generator</Link></li>
                <li><Link href="/marksheets" className="hover:text-slate-900 transition-colors">Marksheets Engine</Link></li>
                <li><Link href="/wallet" className="hover:text-slate-900 transition-colors">Wallet Billing</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Solutions</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Computer Institutes</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Typing Centers</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Coaching Academies</span></li>
                <li><span className="hover:text-slate-900 transition-colors cursor-pointer">Skill Development Centers</span></li>
                <li><Link href="/verification" className="hover:text-slate-900 transition-colors">Public QR Verification</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">Account & Support</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-slate-900 transition-colors">Institute Sign In</Link></li>
                <li><Link href="/register" className="hover:text-slate-900 transition-colors">Register Center</Link></li>
                <li><Link href="/verification" className="hover:text-slate-900 transition-colors">Verify Certificate / QR</Link></li>
                <li><Link href="/support" className="hover:text-slate-900 transition-colors">Help & WhatsApp Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
            <p>© 2026 CertiDesk Pro. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-slate-700 cursor-pointer">Privacy Policy</span>
              <span className="hover:text-slate-700 cursor-pointer">Terms of Service</span>
              <span className="hover:text-slate-700 cursor-pointer">Security Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
