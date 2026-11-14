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
  Star
} from "lucide-react";

export default function LandingPage() {
  const [activeFeatureTab, setActiveFeatureTab] = useState<number>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [scrolled, setScrolled] = useState(false);
  const [selectedCertTemplate, setSelectedCertTemplate] = useState<string>("adca");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      previewType: "studentTable"
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
      previewType: "batchCards"
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
      previewType: "examPreview"
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
      previewType: "certPreview"
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
      previewType: "walletLedger"
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
      previewType: "analyticsChart"
    }
  ];

  const faqs = [
    {
      q: "How do I register my institute?",
      a: "Click 'Get Started' and fill in your institute name, owner details, contact number, and address. Your unique Institute ID (e.g. SBCI1001) is generated instantly, and you can start adding students immediately."
    },
    {
      q: "How does wallet recharge work?",
      a: "CertiDesk Pro operates on a prepaid wallet model. You recharge your wallet using Razorpay (supports UPI, Google Pay, PhonePe, Debit/Credit Cards, and Net Banking). Whenever you admit a new student, ₹150 is deducted from your balance."
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
      q: "Can multiple staff members access an institute?",
      a: "Yes. You can create staff accounts with role-based permissions (Teacher, Examination In-Charge, Receptionist) to allow your team to record attendance and exam marks while keeping financial controls restricted to the administrator."
    },
    {
      q: "Is student data secure?",
      a: "Absolutely. All records are isolated in our multi-tenant Firestore database with enterprise-grade security rules. Only authorized institute staff can access your student records, and automated cloud backups prevent any data loss."
    }
  ];

  return (
    <div className="min-h-screen bg-white text-[#17152B] selection:bg-[#6529E8] selection:text-white font-sans antialiased">
      
      {/* 1. STICKY NAVIGATION BAR */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80 py-3" 
          : "bg-[#11132D]/90 backdrop-blur-md border-b border-white/10 py-4"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Left Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6529E8] to-[#8B5CF6] flex items-center justify-center text-white shadow-brand flex-shrink-0">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-none">
                <span className={`font-black text-xl tracking-tight ${scrolled ? "text-slate-900" : "text-white"}`}>
                  CertiDesk
                </span>
                <span className="text-[#8B5CF6] font-black text-xl">Pro</span>
              </div>
              <p className={`text-[10px] mt-0.5 truncate tracking-wide ${scrolled ? "text-slate-500" : "text-slate-400"}`}>
                Certificate & Institute Management
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Matching Screenshot) */}
          <div className="hidden md:flex items-center gap-1">
            <Link 
              href="/" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                scrolled 
                  ? "bg-slate-100 text-slate-900" 
                  : "bg-white/15 text-white"
              }`}
            >
              Home
            </Link>
            
            <a 
              href="#features" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                scrolled ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>Features</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a 
              href="#pricing" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                scrolled ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              Pricing
            </a>

            <a 
              href="#why-us" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                scrolled ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>Solutions</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </a>

            <a 
              href="#how-it-works" 
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1 ${
                scrolled ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100" : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>Resources</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                scrolled
                  ? "border-slate-300 text-slate-700 hover:bg-slate-50"
                  : "border-white/20 text-white hover:bg-white/10"
              }`}
            >
              Login
            </Link>

            <Link
              href="/register"
              className="px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand flex items-center gap-1.5 transition-all"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION (DARK NAVY & PURPLE WITH 3D LAPTOP MOCKUP) */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-b from-[#11132D] via-[#1A184A] to-[#241355] text-white overflow-hidden">
        
        {/* Ambient Radial Glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#6529E8]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 left-10 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Hero Left Text Column */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/10 border border-purple-400/30 text-purple-200 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>All-in-One Institute Management Platform</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.15]">
                Manage Students, Batches, Exams & Generate{" "}
                <span className="text-[#C084FC] underline decoration-purple-500/40 underline-offset-4">
                  Certificates
                </span>
              </h1>

              {/* Description */}
              <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                A complete, wallet-based solution for computer institutes and training centers. Handle admissions, courses, batches, results, professional certificates and marksheets — all in one place.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href="/register"
                  className="px-6 py-3.5 bg-white hover:bg-slate-100 text-[#11132D] font-extrabold text-sm rounded-xl shadow-xl hover:shadow-2xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4 text-[#6529E8]" />
                </Link>

                <Link
                  href="/dashboard"
                  className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-xs flex items-center gap-2 transition-all"
                >
                  <Play className="w-4 h-4 fill-white text-white" />
                  <span>Book a Demo</span>
                </Link>
              </div>

              {/* Trust Checkmarks */}
              <div className="flex flex-wrap items-center gap-6 pt-4 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>No Setup Cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Wallet Based</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Instant Certificate</span>
                </div>
              </div>
            </div>

            {/* Hero Right: Realistic 3D Laptop Mockup matching reference */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[680px]">
                
                {/* Laptop Outer Body */}
                <div className="rounded-[22px] bg-[#1E2038] p-3 pt-3 shadow-[0_30px_90px_rgba(0,0,0,0.6)] border border-slate-700/80 ring-1 ring-white/10">
                  
                  {/* Top Bezel with Camera */}
                  <div className="flex items-center justify-center pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-blue-500/80" />
                    </div>
                  </div>

                  {/* Laptop Screen Content (Actual Realistic CertiDesk Pro Dashboard) */}
                  <div className="rounded-xl overflow-hidden bg-[#F7F8FC] border border-slate-300/60 shadow-inner text-slate-800 text-[11px] select-none">
                    
                    {/* Top Screen App Header */}
                    <div className="h-10 bg-white border-b border-slate-200 px-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-purple-100 text-[#6529E8] flex items-center justify-center">
                          <Award className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-[10px]">SBCI Computer Institute</span>
                            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </div>
                          <p className="text-[8px] text-slate-400 font-mono">Institute ID: SBCI1001</p>
                        </div>
                      </div>

                      {/* Header Right */}
                      <div className="flex items-center gap-2">
                        <div className="bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md flex items-center gap-1.5">
                          <Wallet className="w-3 h-3 text-[#6529E8]" />
                          <div>
                            <span className="text-[7px] uppercase font-bold text-slate-400 block leading-none">Wallet</span>
                            <span className="text-[9px] font-bold text-slate-900 font-mono leading-none">₹ 2,850.00</span>
                          </div>
                          <span className="bg-[#6529E8] text-white text-[7px] font-bold px-1 py-0.5 rounded ml-1">
                            + Recharge
                          </span>
                        </div>
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold flex items-center justify-center text-[9px]">
                          V
                        </div>
                      </div>
                    </div>

                    {/* Screen Body */}
                    <div className="flex min-h-[300px]">
                      
                      {/* Left Mini Sidebar */}
                      <div className="w-36 bg-[#10152B] text-slate-400 p-2 space-y-3 flex-shrink-0 border-r border-slate-800 hidden sm:block">
                        <div className="bg-[#6529E8] text-white px-2 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1.5">
                          <Award className="w-3 h-3" />
                          <span>Dashboard</span>
                        </div>
                        <div className="space-y-1 text-[8px]">
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold block px-1">Students</span>
                          <div className="px-1.5 py-1 text-slate-300 hover:text-white flex items-center gap-1.5">
                            <Users className="w-2.5 h-2.5" />
                            <span>Students List</span>
                          </div>
                          <div className="px-1.5 py-1 text-slate-300 hover:text-white flex items-center gap-1.5">
                            <Plus className="w-2.5 h-2.5" />
                            <span>Add Student</span>
                          </div>
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold block px-1 pt-1">Academic</span>
                          <div className="px-1.5 py-1 text-slate-300 hover:text-white flex items-center gap-1.5">
                            <BookOpen className="w-2.5 h-2.5" />
                            <span>Courses</span>
                          </div>
                          <div className="px-1.5 py-1 text-slate-300 hover:text-white flex items-center gap-1.5">
                            <Layers className="w-2.5 h-2.5" />
                            <span>Batches</span>
                          </div>
                          <span className="text-[7px] uppercase tracking-wider text-slate-500 font-bold block px-1 pt-1">Certificates</span>
                          <div className="px-1.5 py-1 text-slate-300 hover:text-white flex items-center gap-1.5">
                            <Award className="w-2.5 h-2.5" />
                            <span>Templates</span>
                          </div>
                        </div>
                      </div>

                      {/* Right Main Mockup Dashboard Area */}
                      <div className="flex-1 p-3 space-y-2.5 overflow-hidden">
                        
                        {/* Welcome Banner */}
                        <div className="bg-gradient-to-r from-[#10152B] via-[#1A184A] to-[#2B1B68] text-white p-3 rounded-xl flex items-center justify-between shadow-xs">
                          <div className="space-y-1">
                            <p className="font-extrabold text-[11px]">Welcome to CertiDesk Pro 👋</p>
                            <p className="text-[8px] text-slate-300">Manage students, generate certificates, and grow your institute.</p>
                            <div className="flex items-center gap-1.5 pt-1">
                              <span className="bg-[#6529E8] text-white text-[8px] font-bold px-2 py-0.5 rounded">
                                + Add Student (₹150)
                              </span>
                              <span className="bg-white/10 text-white text-[8px] font-bold px-2 py-0.5 rounded border border-white/20">
                                Generate Certificate
                              </span>
                            </div>
                          </div>
                          <div className="w-12 h-10 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center">
                            <Award className="w-6 h-6 text-amber-300" />
                          </div>
                        </div>

                        {/* Stat Widgets Grid */}
                        <div className="grid grid-cols-4 gap-1.5">
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[7px] text-slate-400 block font-semibold">Total Students</span>
                            <span className="font-black text-slate-900 text-xs">482</span>
                            <span className="text-[7px] text-emerald-600 block">↑ +12 mo</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[7px] text-slate-400 block font-semibold">Certificates</span>
                            <span className="font-black text-slate-900 text-xs">738</span>
                            <span className="text-[7px] text-emerald-600 block">↑ +56 mo</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[7px] text-slate-400 block font-semibold">Batches</span>
                            <span className="font-black text-slate-900 text-xs">24</span>
                            <span className="text-[7px] text-purple-600 block">Active</span>
                          </div>
                          <div className="bg-white p-2 rounded-lg border border-slate-200">
                            <span className="text-[7px] text-slate-400 block font-semibold">Wallet</span>
                            <span className="font-black text-slate-900 text-xs">₹2,850</span>
                            <span className="text-[7px] text-emerald-600 block">Active</span>
                          </div>
                        </div>

                        {/* Recent Students Table Mockup */}
                        <div className="bg-white rounded-lg border border-slate-200 p-2">
                          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b text-[8px] font-bold">
                            <span className="text-slate-800">Recent Students</span>
                            <span className="text-[#6529E8]">View All →</span>
                          </div>
                          <div className="space-y-1 text-[8px]">
                            <div className="flex items-center justify-between py-0.5">
                              <span className="font-bold text-slate-800">Khushbu Prajapati</span>
                              <span className="bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-bold">ADCA</span>
                              <span className="text-slate-400 font-mono">SBCI/ADCA/0268</span>
                              <span className="text-emerald-600 font-bold">Active</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                              <span className="font-bold text-slate-800">Himanshu Vishwakarma</span>
                              <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">Typing</span>
                              <span className="text-slate-400 font-mono">SBCI/TYP/0267</span>
                              <span className="text-emerald-600 font-bold">Active</span>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                              <span className="font-bold text-slate-800">Sneha Gupta</span>
                              <span className="bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded font-bold">ADCA</span>
                              <span className="text-slate-400 font-mono">SBCI/ADCA/0266</span>
                              <span className="text-emerald-600 font-bold">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Laptop Base Stand */}
                <div className="relative mx-auto w-5/6 h-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-b-xl shadow-2xl border-t border-slate-800">
                  <div className="mx-auto w-16 h-1 bg-slate-900 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PRODUCT CAPABILITIES STRIP (4 CLEAN COLUMNS) */}
      <section id="capabilities" className="bg-white border-y border-slate-200/80 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
            
            {/* Col 1 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4 first:pl-0">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6529E8] flex items-center justify-center flex-shrink-0 border border-purple-100">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Student Management</h3>
                <p className="text-xs text-slate-500 mt-1">Admission, profile, batch & records</p>
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6529E8] flex items-center justify-center flex-shrink-0 border border-purple-100">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Course & Batch</h3>
                <p className="text-xs text-slate-500 mt-1">Manage courses, batches & attendance</p>
              </div>
            </div>

            {/* Col 3 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6529E8] flex items-center justify-center flex-shrink-0 border border-purple-100">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Certificate & Marksheet</h3>
                <p className="text-xs text-slate-500 mt-1">Template based, professional PDF</p>
              </div>
            </div>

            {/* Col 4 */}
            <div className="flex items-start gap-4 pt-4 sm:pt-0 sm:px-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6529E8] flex items-center justify-center flex-shrink-0 border border-purple-100">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Wallet & Billing</h3>
                <p className="text-xs text-slate-500 mt-1">Recharge, auto-deduction & reports</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. WHY CHOOSE CERTIDESK PRO (6 MODULES + LARGE REALISTIC CERTIFICATE) */}
      <section id="why-us" className="py-20 md:py-28 bg-[#F7F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6529E8] border border-purple-200">
              Why Choose CertiDesk Pro?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              A Complete Digital Solution for{" "}
              <span className="text-[#6529E8]">Computer Institutes</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Everything you need to run your institute smoothly — from student admission to professional certificates with QR verification.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left 6 Feature Modules (2 Columns on Left) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Card 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-soft transition-all">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6529E8] flex items-center justify-center mb-3">
                  <Users className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Multi-Course Support</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Admission, O Level, Typing, Tally and custom courses configured for your center.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-soft transition-all">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-3">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Batch Management</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Create, manage and track multiple cohorts easily with complete batch history.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-soft transition-all">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Examination & Results</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Conduct exams and generate print-ready marksheets automatically with grades.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-soft transition-all">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                  <Award className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Template Based Certificates</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Upload your own background design and generate dynamic certificates with QR code.
                </p>
              </div>

              {/* Card 5 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-soft transition-all">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">Wallet Based System</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  ₹150 per new admission, ₹100 per profile update. Zero recurring monthly rent.
                </p>
              </div>

              {/* Card 6 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card hover:shadow-soft transition-all">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                  <QrCode className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-sm text-slate-900">QR Verification</h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Instant online certificate verification for authenticity by employers and students.
                </p>
              </div>
            </div>

            {/* Right Large Certificate Preview matching screenshot */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[460px] bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-amber-300/80 ring-1 ring-slate-200">
                
                {/* Gold Seal / Ribbon Rosette */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 via-amber-300 to-amber-500 text-slate-950 flex flex-col items-center justify-center shadow-lg border-2 border-white transform rotate-12">
                  <Star className="w-5 h-5 fill-slate-900 text-slate-900" />
                  <span className="text-[7px] font-black uppercase tracking-wider">VERIFIED</span>
                </div>

                {/* Certificate Inner Frame */}
                <div className="border border-slate-200 rounded-2xl p-6 text-center space-y-4 bg-gradient-to-b from-amber-50/20 via-white to-amber-50/30">
                  
                  {/* Institute Header */}
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#6529E8] to-indigo-700 flex items-center justify-center text-white">
                      <Award className="w-4 h-4 text-amber-300" />
                    </div>
                    <span className="font-extrabold text-sm text-slate-900 tracking-tight">
                      SBCI Computer Institute
                    </span>
                  </div>

                  {/* Title */}
                  <div className="pt-2">
                    <h3 className="text-2xl font-serif italic text-slate-800 font-bold tracking-wide">
                      Certificate
                    </h3>
                    <p className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 mt-0.5">
                      of Completion
                    </p>
                  </div>

                  {/* Recipient text */}
                  <div className="space-y-1 text-xs text-slate-600">
                    <p className="text-[11px] text-slate-500">This is proudly presented to</p>
                    <p className="text-base font-bold text-[#6529E8] underline decoration-slate-300 underline-offset-4">
                      Khushbu Prajapati
                    </p>
                    <p className="text-[11px] leading-relaxed pt-1">
                      for successfully completing the <strong>Advance Diploma in Computer Applications (ADCA)</strong> with Grade <strong>A+</strong>.
                    </p>
                  </div>

                  {/* Footer Details & QR */}
                  <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-left text-[9px] text-slate-500">
                    <div>
                      <p className="font-mono font-bold text-slate-700">Roll: SBCI/ADCA/0268</p>
                      <p>Date: 04 Oct 2026</p>
                      <p className="font-serif italic text-slate-800 font-bold mt-2">Vinkal Prajapati (Director)</p>
                    </div>

                    {/* QR Code */}
                    <Link href="/verify/CDP-2026-0267" className="group text-center">
                      <div className="w-14 h-14 bg-white p-1 rounded-lg border border-slate-300 shadow-sm group-hover:border-[#6529E8] transition-colors">
                        <QrCode className="w-full h-full text-slate-900" />
                      </div>
                      <span className="text-[8px] text-[#6529E8] font-bold block mt-1">Scan to Verify</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PLATFORM STATISTICS (DEEP NAVY HORIZONTAL BAR) */}
      <section className="bg-gradient-to-r from-[#11132D] via-[#1A184A] to-[#11132D] text-white py-12 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            
            {/* Stat 1 */}
            <div className="pt-4 md:pt-0 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">2,500+</h3>
              <p className="text-xs text-slate-400 font-medium">Institutes Trust Us</p>
            </div>

            {/* Stat 2 */}
            <div className="pt-4 md:pt-0 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-300 flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">2.5 Lakh+</h3>
              <p className="text-xs text-slate-400 font-medium">Students Managed</p>
            </div>

            {/* Stat 3 */}
            <div className="pt-4 md:pt-0 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mx-auto mb-2">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">5 Lakh+</h3>
              <p className="text-xs text-slate-400 font-medium">Certificates Generated</p>
            </div>

            {/* Stat 4 */}
            <div className="pt-4 md:pt-0 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight">99.9%</h3>
              <p className="text-xs text-slate-400 font-medium">Uptime & Reliability</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. POWERFUL FEATURES (INTERACTIVE TABS SHOWCASE MATCHING SCREENSHOT) */}
      <section id="features" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6529E8] border border-purple-200">
              Powerful Features
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Everything <span className="text-[#6529E8]">Your Institute Needs</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              A feature-rich platform designed to save time, reduce manual work, and deliver a professional experience.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Vertical Navigation List */}
            <div className="lg:col-span-4 space-y-2">
              {featureTabs.map((tab, idx) => {
                const Icon = tab.icon;
                const isActive = activeFeatureTab === idx;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFeatureTab(idx)}
                    className={`w-full flex items-center gap-3.5 p-4 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive 
                        ? "bg-[#6529E8] text-white shadow-brand shadow-[#6529E8]/20 font-bold" 
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200/60"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      isActive ? "bg-white/20 text-white" : "bg-white text-slate-600 shadow-xs"
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-sm">{tab.title}</span>
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Preview Panel */}
            <div className="lg:col-span-8 bg-[#F7F8FC] rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-card">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Details Column */}
                <div className="md:col-span-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-[#6529E8] tracking-wider">
                      {featureTabs[activeFeatureTab].badge}
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                      {featureTabs[activeFeatureTab].heading}
                    </h3>
                  </div>
                  
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {featureTabs[activeFeatureTab].description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    {featureTabs[activeFeatureTab].points.map((pt, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
                        <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                        <span>{pt}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <Link
                      href={featureTabs[activeFeatureTab].linkHref}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all"
                    >
                      <span>{featureTabs[activeFeatureTab].linkText}</span>
                    </Link>
                  </div>
                </div>

                {/* Interactive Dynamic Miniature UI Column */}
                <div className="md:col-span-6">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-md space-y-3">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">
                          {activeFeatureTab === 0 && "Students (482)"}
                          {activeFeatureTab === 1 && "Active Batches (24)"}
                          {activeFeatureTab === 2 && "Marksheet Generator"}
                          {activeFeatureTab === 3 && "Certificate Designer"}
                          {activeFeatureTab === 4 && "Wallet Ledger"}
                          {activeFeatureTab === 5 && "Admission Trends"}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#6529E8] bg-purple-50 px-2 py-0.5 rounded">
                        Live Data
                      </span>
                    </div>

                    {/* Tab Specific Content */}
                    {activeFeatureTab === 0 && (
                      <div className="space-y-2 text-[10px]">
                        <div className="relative">
                          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            readOnly
                            value="Khushbu Prajapati"
                            className="w-full pl-8 pr-2 py-1.5 bg-slate-50 border rounded-lg text-[10px]"
                          />
                        </div>
                        <div className="border border-slate-100 rounded-lg overflow-hidden">
                          <div className="bg-slate-50 p-2 font-bold text-slate-500 flex justify-between">
                            <span>Student Name</span>
                            <span>Course</span>
                            <span>Status</span>
                          </div>
                          <div className="p-2 flex justify-between items-center border-t border-slate-100">
                            <span className="font-bold text-slate-800">Khushbu P.</span>
                            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">ADCA</span>
                            <span className="text-emerald-600 font-bold">Active</span>
                          </div>
                          <div className="p-2 flex justify-between items-center border-t border-slate-100">
                            <span className="font-bold text-slate-800">Himanshu V.</span>
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Typing</span>
                            <span className="text-emerald-600 font-bold">Active</span>
                          </div>
                          <div className="p-2 flex justify-between items-center border-t border-slate-100">
                            <span className="font-bold text-slate-800">Sneha G.</span>
                            <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">ADCA</span>
                            <span className="text-emerald-600 font-bold">Active</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeFeatureTab === 1 && (
                      <div className="space-y-2 text-[10px]">
                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>ADCA Morning Batch</span>
                            <span className="text-emerald-600">Active</span>
                          </div>
                          <p className="text-slate-500">08:00 AM - 10:00 AM | Instructor: Rahul Sir</p>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                            <div className="bg-[#6529E8] h-full w-3/4" />
                          </div>
                        </div>
                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/70 space-y-1">
                          <div className="flex justify-between font-bold text-slate-900">
                            <span>Typing Evening Cohort</span>
                            <span className="text-emerald-600">Active</span>
                          </div>
                          <p className="text-slate-500">04:00 PM - 05:30 PM | 25 Enrolled</p>
                        </div>
                      </div>
                    )}

                    {activeFeatureTab === 2 && (
                      <div className="space-y-2 text-[10px]">
                        <div className="bg-slate-50 p-2.5 rounded-xl border space-y-1">
                          <div className="flex justify-between font-bold">
                            <span>Khushbu Prajapati (MS-2026-0268)</span>
                            <span className="text-[#6529E8]">Grade A+</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[9px] pt-1">
                            <div>Theory: 88/100</div>
                            <div>Practical: 92/100</div>
                          </div>
                          <p className="text-emerald-700 font-bold pt-1">Total: 180/200 (90.0% Passed)</p>
                        </div>
                      </div>
                    )}

                    {activeFeatureTab === 3 && (
                      <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 text-center space-y-2 text-[10px]">
                        <Award className="w-8 h-8 text-amber-500 mx-auto" />
                        <p className="font-bold text-slate-800">Dynamic Certificate Layout</p>
                        <p className="text-slate-500 text-[9px]">Position student name, course title, and verified QR code in seconds.</p>
                      </div>
                    )}

                    {activeFeatureTab === 4 && (
                      <div className="space-y-1.5 text-[10px] font-mono">
                        <div className="flex justify-between p-2 bg-emerald-50 rounded-lg text-emerald-800 font-bold">
                          <span>+ ₹5,000 Recharge (Razorpay)</span>
                          <span>Success</span>
                        </div>
                        <div className="flex justify-between p-2 bg-purple-50 rounded-lg text-[#6529E8] font-bold">
                          <span>- ₹150 Admission (Khushbu)</span>
                          <span>Debited</span>
                        </div>
                      </div>
                    )}

                    {activeFeatureTab === 5 && (
                      <div className="space-y-2 text-center py-2 text-[10px]">
                        <div className="flex items-end justify-center gap-2 h-20 pt-2">
                          <div className="w-5 bg-purple-200 h-10 rounded-t" />
                          <div className="w-5 bg-purple-300 h-14 rounded-t" />
                          <div className="w-5 bg-purple-400 h-16 rounded-t" />
                          <div className="w-5 bg-[#6529E8] h-20 rounded-t" />
                        </div>
                        <p className="font-bold text-slate-700">+48 Students Enrolled This Month</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. HOW IT WORKS (4 STEP VISUAL PROCESS) */}
      <section id="how-it-works" className="py-20 md:py-28 bg-[#F7F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6529E8] border border-purple-200">
              Simple 4-Step Flow
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              How CertiDesk Pro Works
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Get your training center up and running in under five minutes with zero technical setup.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6529E8] font-black text-base flex items-center justify-center">
                1
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Register Institute</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your institute name, address and upload your logo to generate your unique Center ID.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6529E8] font-black text-base flex items-center justify-center">
                2
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Add Students & Courses</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Select default courses or create custom courses. Enroll students with automatic unique enrollment numbers.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6529E8] font-black text-base flex items-center justify-center">
                3
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Manage Batches & Marks</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Schedule morning/evening classes, track student attendance, and record exam marks with automatic grades.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-card space-y-3 relative">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#6529E8] font-black text-base flex items-center justify-center">
                4
              </div>
              <h4 className="font-extrabold text-base text-slate-900">Generate Certificates</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Produce print-ready certificates and marksheets with live QR code verification for students and employers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. CERTIFICATE SHOWCASE SECTION */}
      <section className="py-20 md:py-28 bg-white border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6529E8] border border-purple-200">
              Template Studio
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Professional Certificates for Every Course
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Institutes can use our pre-built official templates or upload their own custom background image.
            </p>
          </div>

          {/* Template Switcher Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
            {[
              { id: "adca", name: "ADCA Diploma" },
              { id: "typing", name: "Computer Typing" },
              { id: "ccc", name: "CCC Certificate" },
              { id: "dca", name: "DCA Diploma" }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedCertTemplate(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCertTemplate === t.id
                    ? "bg-[#6529E8] text-white shadow-brand"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          {/* Certificate Display Showcase Card */}
          <div className="max-w-3xl mx-auto bg-gradient-to-br from-amber-50/50 via-white to-amber-50/40 p-8 sm:p-12 rounded-3xl border-4 border-amber-300 shadow-2xl space-y-6 text-center">
            
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#6529E8] text-white flex items-center justify-center font-bold">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <div className="text-left">
                  <h4 className="font-extrabold text-sm text-slate-900">SBCI Computer Institute</h4>
                  <p className="text-[10px] text-slate-400 font-mono">Reg No: 09209366 • ISO Certified</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>Government Recognized Format</span>
              </div>
            </div>

            <div className="space-y-3 py-4">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">
                ISO 9001:2015 Certified Educational Institution
              </p>
              <h3 className="text-3xl sm:text-4xl font-serif italic text-slate-900 font-bold">
                Certificate of Completion
              </h3>
              <p className="text-xs text-slate-500 pt-1">This certificate is awarded to</p>
              <p className="text-2xl font-bold text-[#6529E8] underline decoration-slate-300 underline-offset-4">
                Khushbu Prajapati
              </p>
              <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
                having successfully passed the prescribed examination for{" "}
                <strong>
                  {selectedCertTemplate === "adca" && "Advance Diploma in Computer Applications (ADCA - 1 Year)"}
                  {selectedCertTemplate === "typing" && "Certificate in English & Hindi Typing Proficiency (45 WPM)"}
                  {selectedCertTemplate === "ccc" && "Course on Computer Concepts (CCC - 3 Months)"}
                  {selectedCertTemplate === "dca" && "Diploma in Computer Applications (DCA - 6 Months)"}
                </strong>{" "}
                with Grade <strong>A+ (Distinction)</strong>.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-left text-xs">
              <div className="space-y-0.5">
                <p className="font-mono font-bold text-slate-700">Certificate No: CDP-2026-0267</p>
                <p className="text-slate-400 text-[11px]">Issue Date: 04 October 2026</p>
                <p className="text-slate-800 font-serif italic font-bold pt-2">Vinkal Prajapati, Director</p>
              </div>

              <Link
                href="/verify/CDP-2026-0267"
                className="flex items-center gap-2 p-2 bg-white rounded-xl border border-slate-300 shadow-sm hover:border-[#6529E8] transition-colors"
              >
                <div className="w-12 h-12">
                  <QrCode className="w-full h-full text-slate-900" />
                </div>
                <div className="text-[10px]">
                  <p className="font-bold text-[#6529E8]">Scan to Verify</p>
                  <p className="text-slate-400 font-mono">cdp.link/0267</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 9. WALLET & TRANSPARENT PRICING SECTION */}
      <section id="pricing" className="py-20 md:py-28 bg-[#F7F8FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6529E8] border border-purple-200">
              Transparent Pay-Per-Action Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              No Monthly Rent. <span className="text-[#6529E8]">Pay As You Grow.</span>
            </h2>
            <p className="text-slate-600 text-sm md:text-base">
              Simple prepaid wallet system. Recharge your balance and only pay when you enroll students or update profiles.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            
            {/* Card 1: New Admission */}
            <div className="bg-white rounded-3xl p-7 border-2 border-[#6529E8] shadow-xl relative space-y-5">
              <div className="absolute -top-3.5 right-6 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#6529E8] text-white">
                Most Common
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Admission</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹150</span>
                  <span className="text-xs text-slate-500 font-medium">/ per admission</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Deducted automatically from your wallet when a new student is admitted to any course.
              </p>
              <div className="space-y-2.5 pt-2 border-t text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unique Enrollment No generation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Certificate Generation (₹0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Unlimited Marksheet Generation (₹0)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Lifetime QR verification</span>
                </div>
              </div>
              <Link
                href="/register"
                className="w-full py-3 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand flex items-center justify-center gap-2 transition-all block text-center"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Card 2: Profile Update */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Profile Update</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">₹100</span>
                  <span className="text-xs text-slate-500 font-medium">/ per edit</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Applies only to critical profile corrections (name, father's name, or DOB changes).
              </p>
              <div className="space-y-2.5 pt-2 border-t text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Prevents accidental duplicate updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Audit log of all edits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Automatic certificate re-render</span>
                </div>
              </div>
              <Link
                href="/login"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all block text-center"
              >
                <span>Login to Center</span>
              </Link>
            </div>

            {/* Card 3: Free Inclusions */}
            <div className="bg-white rounded-3xl p-7 border border-slate-200 shadow-card space-y-5">
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Everything Else</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-emerald-600">₹0</span>
                  <span className="text-xs text-slate-500 font-medium">Always Free</span>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Batches, attendance, certificate generation and QR hosting are 100% free with admissions.
              </p>
              <div className="space-y-2.5 pt-2 border-t text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Zero monthly maintenance cost</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Zero setup fee</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Recharge anytime via Razorpay</span>
                </div>
              </div>
              <Link
                href="/register"
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all block text-center"
              >
                <span>Start Free</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ ACCORDION SECTION */}
      <section id="faq" className="py-20 md:py-28 bg-white border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-[#6529E8] border border-purple-200">
              Got Questions?
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600 text-sm">
              Everything you need to know about CertiDesk Pro's wallet billing, certificate engine, and features.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all bg-white"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-transform ${
                      isOpen ? "bg-[#6529E8] text-white rotate-180" : "bg-slate-100 text-slate-500"
                    }`}>
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 bg-slate-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 11. FINAL CALL TO ACTION (DEEP NAVY BACKGROUND) */}
      <section className="bg-gradient-to-r from-[#10152B] via-[#1A184A] to-[#2B1B68] text-white py-20 md:py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#6529E8] to-[#8B5CF6] text-white flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/30">
            <Award className="w-8 h-8 text-amber-300" />
          </div>

          <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Ready to Digitize Your Institute?
          </h2>

          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Manage admissions, batches, certificates and results from one powerful platform. No setup costs, no monthly lock-ins.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/register"
              className="px-8 py-3.5 bg-white hover:bg-slate-100 text-[#11132D] font-extrabold text-sm rounded-xl shadow-2xl flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 text-[#6529E8]" />
            </Link>

            <Link
              href="/login"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-xl border border-white/20 backdrop-blur-xs transition-all"
            >
              <span>Login to Portal</span>
            </Link>

            <Link
              href="/su"
              className="px-4 py-3.5 bg-slate-900/60 hover:bg-slate-900 text-amber-300 font-bold text-xs rounded-xl border border-amber-400/30 transition-all flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin HQ</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 12. COMPREHENSIVE FOOTER */}
      <footer className="bg-[#0B0E1E] text-slate-400 py-16 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            
            {/* Col 1: Brand Info */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6529E8] to-[#8B5CF6] flex items-center justify-center text-white">
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-black text-white text-lg">CertiDesk</span>
                  <span className="text-[#8B5CF6] font-black text-lg">Pro</span>
                </div>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                Production-grade multi-institute student, batch, course, marksheet and certificate management platform built for modern educational coaching centers.
              </p>
              <p className="text-slate-500 font-mono text-[11px]">
                Powered by Firebase Cloud • Hosted on Vercel
              </p>
            </div>

            {/* Col 2: Product */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/students" className="hover:text-white transition-colors">Student Management</Link></li>
                <li><Link href="/batches" className="hover:text-white transition-colors">Batch Management</Link></li>
                <li><Link href="/courses" className="hover:text-white transition-colors">Course Catalog</Link></li>
                <li><Link href="/certificates/templates" className="hover:text-white transition-colors">Certificate Generator</Link></li>
                <li><Link href="/marksheets" className="hover:text-white transition-colors">Marksheets Engine</Link></li>
                <li><Link href="/wallet" className="hover:text-white transition-colors">Wallet Billing</Link></li>
              </ul>
            </div>

            {/* Col 3: Solutions */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Solutions</h4>
              <ul className="space-y-2">
                <li><span className="hover:text-white transition-colors cursor-pointer">Computer Institutes</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Typing Centers</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Coaching Academies</span></li>
                <li><span className="hover:text-white transition-colors cursor-pointer">Skill Development Centers</span></li>
                <li><Link href="/verification" className="hover:text-white transition-colors">Public QR Verification</Link></li>
              </ul>
            </div>

            {/* Col 4: Support & Admin */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-[11px] tracking-wider">Account & HQ</h4>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-white transition-colors">Institute Sign In</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Register Center</Link></li>
                <li><Link href="/su" className="text-amber-400 hover:text-amber-300 font-bold">Super Admin HQ (/su)</Link></li>
                <li><Link href="/su/login" className="hover:text-white transition-colors">HQ Root Login</Link></li>
                <li><Link href="/support" className="hover:text-white transition-colors">Help & WhatsApp Support</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
            <p>© 2026 CertiDesk Pro. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <span className="hover:text-white cursor-pointer">Privacy Policy</span>
              <span className="hover:text-white cursor-pointer">Terms of Service</span>
              <span className="hover:text-white cursor-pointer">Security Compliance</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
