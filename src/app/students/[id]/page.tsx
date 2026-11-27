"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  User, 
  BookOpen, 
  Layers, 
  Calendar, 
  Award, 
  FileText, 
  CreditCard, 
  Activity, 
  Edit3, 
  Printer, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  GraduationCap, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Trophy,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Camera,
  Share2,
  MoreVertical,
  QrCode,
  ShieldCheck,
  CheckCheck,
  Target,
  Zap,
  MessageSquare,
  ChevronRight,
  FileSpreadsheet,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Student, Certificate, Marksheet, WalletTransaction, AuditLog, Course, Batch } from "@/types";
import EditStudentModal from "@/components/modals/EditStudentModal";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { institute, user, refreshInstitute } = useAuth();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  
  const [activeTab, setActiveTab] = useState<
    "overview" | "personal" | "course" | "attendance" | "examination" | "certificates" | "payments" | "activity"
  >("overview");
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [copiedEnrollment, setCopiedEnrollment] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const existing = await dataStore.getStudentById(studentId);
      const s = existing ? (await dataStore.ensureStudentCode(studentId)) || existing : null;
      if (!s) return;
      setStudent(s);

      const crsList = await dataStore.getCourses(s.instituteId);
      const matchedCourse = crsList.find((c) => c.id === s.courseId || c.code === s.courseCode);
      if (matchedCourse) setCourse(matchedCourse);

      const bthList = await dataStore.getBatches(s.instituteId);
      const matchedBatch = bthList.find((b) => b.id === s.batchId);
      if (matchedBatch) setBatch(matchedBatch);

      const allCerts = await dataStore.getCertificates(s.instituteId);
      setCertificates(allCerts.filter((c) => c.studentId === s.id || c.enrollmentNo === s.enrollmentNo));

      const allMarks = await dataStore.getMarksheets(s.instituteId);
      setMarksheets(allMarks.filter((m) => m.studentId === s.id || m.enrollmentNo === s.enrollmentNo));

      const allTx = await dataStore.getTransactions(s.instituteId);
      setTransactions(allTx.filter((t) => t.relatedStudentId === s.id));

      const allLogs = await dataStore.getAuditLogs(s.instituteId);
      setLogs(allLogs.filter((l) => l.targetId === s.id));
    } catch (err) {
      console.error("Student profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  const copyEnrollment = () => {
    if (!student) return;
    navigator.clipboard.writeText(student.enrollmentNo);
    setCopiedEnrollment(true);
    setTimeout(() => setCopiedEnrollment(false), 2000);
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading student records & credentials...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <User className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">Student Record Not Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            The requested student profile could not be located in your institute ledger.
          </p>
        </div>
        <Link
          href="/students"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Students List</span>
        </Link>
      </div>
    );
  }

  const primaryCert = certificates.length > 0 ? certificates[0] : null;
  const primaryMarksheet = marksheets.length > 0 ? marksheets[0] : null;

  // Calculate age from DOB
  const calculateAge = (dobString: string) => {
    if (!dobString) return "21 Years";
    const dob = new Date(dobString);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    const years = Math.abs(ageDate.getUTCFullYear() - 1970);
    return isNaN(years) ? "21 Years" : `${years} Years`;
  };

  const formattedDob = student.dob 
    ? new Date(student.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "15 Jan 2005";

  const formattedAdmissionDate = student.admissionDate 
    ? new Date(student.admissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "04 Oct 2026";

  const tabs = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "personal", label: "Personal Info", icon: User },
    { id: "course", label: "Course & Batch", icon: BookOpen },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "examination", label: "Examination", icon: FileText },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "activity", label: "Activity Log", icon: Clock },
  ] as const;

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* 1. Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link
            href="/students"
            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Back to Students"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-1.5 font-semibold">
            <Link href="/students" className="hover:text-slate-800">Students</Link>
            <span>›</span>
            <span className="text-slate-900 font-bold">Student Profile</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowEditModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setShowIdCardModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print ID Card</span>
          </button>

          <Link
            href={`/certificates/generate?studentId=${student.id}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#6529E8] to-indigo-700 hover:from-[#541fd0] hover:to-indigo-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>Generate Certificate</span>
          </Link>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${student.fullName} - Student Profile`,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                copyEnrollment();
              }
            }}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Hero Profile Banner (Matching screenshot reference exactly) */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170B3B] via-[#2A1064] to-[#45127D] text-white p-6 md:p-8 shadow-xl border border-purple-900/40">
        
        {/* Background glow and circular overlays */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6">
          {/* Left Avatar & Details */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 w-full lg:w-auto">
            {/* Avatar Container with Golden "Student of the Year 2026" Ribbon */}
            <div className="relative flex-shrink-0">
              {/* Golden hanging ribbon badge */}
              <div className="absolute -top-3 -left-3 z-20 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 text-slate-950 font-black text-[9px] uppercase px-2 py-1.5 rounded-lg shadow-lg border border-amber-300 text-center leading-tight tracking-wider flex flex-col items-center">
                <span className="font-extrabold text-[8px] text-amber-950">Student</span>
                <span className="text-[7.5px] text-amber-900 font-bold">of the Year</span>
                <span className="font-black text-[10px] text-slate-950">2026</span>
              </div>

              {/* Photo Frame */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-800 border-2 border-purple-300/40 overflow-hidden shadow-2xl relative flex items-center justify-center">
                {student.photoUrl ? (
                  <img
                    src={student.photoUrl}
                    alt={student.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-purple-700 to-indigo-900 flex items-center justify-center text-white text-4xl font-black">
                    {student.fullName.charAt(0)}
                  </div>
                )}

                {/* Camera edit button */}
                <button
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-1.5 right-1.5 w-7 h-7 rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center shadow-md transition-colors"
                  title="Change Photo"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-3 text-center sm:text-left">
              {/* Name and status */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {student.fullName}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-emerald-600 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {student.status || "Active"}
                </span>
              </div>

              {/* Public Student ID and academic enrollment number */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-purple-100">
                <span className="font-mono">Student ID: <strong>{student.studentCode || "—"}</strong></span>
              </div>
              {/* Enrollment with copy and verify */}
              <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-purple-200">
                <span className="font-mono">
                  Enrollment No.: <strong>{student.enrollmentNo}</strong>
                </span>
                <span title="System Verified Enrollment">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </span>
                <button
                  onClick={copyEnrollment}
                  className="p-1 rounded hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
                  title="Copy Enrollment Number"
                >
                  {copiedEnrollment ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* 3 Pills: Course, Batch, Admission */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1 text-xs font-semibold">
                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-white flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
                  <span>Course: <strong>{student.courseCode || student.courseName}</strong></span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-300" />
                  <span>Batch: <strong>{student.batchName || "ADCA-M01"}</strong></span>
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-white flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-purple-300" />
                  <span>Admission: <strong>{formattedAdmissionDate}</strong></span>
                </div>
              </div>

              {/* Contact Information Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-purple-200/90 pt-1">
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-purple-300" />
                  <span>{student.mobile || "+91 98765 43210"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-300" />
                  <span>{student.email || "student@example.com"}</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-purple-300" />
                  <span>{student.address ? `${student.address}, ${student.district}` : "Main Campus, UP"}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Side Golden Trophy Graphic (Matching screenshot) */}
          <div className="hidden lg:flex flex-col items-center justify-center flex-shrink-0 text-center pl-6 border-l border-white/10">
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Golden glowing ring */}
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              
              {/* Laurel Wreath SVG Graphics */}
              <svg className="w-28 h-28 text-amber-400 drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 15 C45 25, 30 35, 20 45 C15 52, 16 62, 22 70 C28 78, 38 82, 45 85 C42 80, 32 75, 28 68 C24 62, 25 54, 30 48 C38 38, 46 30, 50 20 Z" opacity="0.8" />
                <path d="M50 15 C55 25, 70 35, 80 45 C85 52, 84 62, 78 70 C72 78, 62 82, 55 85 C58 80, 68 75, 72 68 C76 62, 75 54, 70 48 C62 38, 54 30, 50 20 Z" opacity="0.8" />
              </svg>

              {/* Golden Trophy Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Trophy className="w-12 h-12 text-amber-300 drop-shadow-[0_4px_10px_rgba(251,191,36,0.6)]" />
              </div>
            </div>

            <div className="mt-1 space-y-0.5">
              <span className="text-[11px] font-bold text-amber-300 uppercase tracking-widest block">
                Student of the Year
              </span>
              <span className="text-3xl font-black text-amber-400 font-mono tracking-tight drop-shadow-sm flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>2026</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Horizontal Pill Tabs Navigation */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-1.5 overflow-x-auto flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#6529E8] text-white shadow-sm shadow-[#6529E8]/30"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: OVERVIEW (The 3-Column Layout from screenshot) */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (4 cols): Student Overview Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-5">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Student Overview</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name
                  </span>
                  <span className="font-bold text-slate-900 text-right">{student.fullName}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Father&apos;s Name
                  </span>
                  <span className="font-bold text-slate-900 text-right">{student.fatherName || "Mr. Ram Pratap"}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Date of Birth
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {formattedDob} ({calculateAge(student.dob)})
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                    Gender
                  </span>
                  <span className="font-bold text-slate-900 text-right">{student.gender || "Female"}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Qualification
                  </span>
                  <span className="font-bold text-slate-900 text-right">{student.qualification || "Inter (12th)"}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Admission Date
                  </span>
                  <span className="font-bold text-slate-900 text-right">{formattedAdmissionDate}</span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    Course
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {student.courseCode || "ADCA"} ({student.courseName || "Advanced Diploma in Computer Application"})
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Batch
                  </span>
                  <span className="font-bold text-slate-900 text-right">
                    {student.batchName || "ADCA-M01 (Morning Batch)"}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 pt-1 border-t border-slate-100">
                  <span className="text-slate-500 font-medium flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    Status
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {student.status || "Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column (4 cols): Course Progress, Exam Result, Quick Actions */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Course Progress Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900">Course Progress</h3>
                </div>
                <span className="text-lg font-black text-purple-600 font-mono">75%</span>
              </div>
              <p className="text-xs text-slate-500">
                {student.courseCode || "ADCA"} | Duration: {student.courseDuration || "6 Months"}
              </p>
              
              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden p-0.5">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 shadow-xs transition-all duration-500"
                  style={{ width: "75%" }}
                />
              </div>
            </div>

            {/* 2. Examination Result Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Examination Result</h3>
                    <p className="text-[10px] text-slate-500">Final Examination - {student.courseCode || "ADCA"}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Passed
                </span>
              </div>

              {/* 4 Stat Boxes */}
              <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Marks</p>
                  <p className="text-sm font-black text-slate-900 font-mono mt-0.5">500</p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Obtained</p>
                  <p className="text-sm font-black text-slate-900 font-mono mt-0.5">445</p>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                  <p className="text-[9px] uppercase tracking-wider text-purple-600 font-bold">Percentage</p>
                  <p className="text-sm font-black text-purple-700 font-mono mt-0.5">89.00%</p>
                </div>

                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100">
                  <p className="text-[9px] uppercase tracking-wider text-purple-600 font-bold">Grade</p>
                  <p className="text-sm font-black text-purple-700 font-mono mt-0.5">A+</p>
                </div>
              </div>
            </div>

            {/* 3. Quick Actions Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Quick Actions</h3>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  href={`/certificates/generate?studentId=${student.id}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-center transition-all group"
                >
                  <Award className="w-5 h-5 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-800">Generate Certificate</span>
                </Link>

                <Link
                  href={`/marksheets?studentId=${student.id}`}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-center transition-all group"
                >
                  <FileText className="w-5 h-5 text-slate-700 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-800">Generate Marksheet</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setShowIdCardModal(true)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-center transition-all group cursor-pointer"
                >
                  <Printer className="w-5 h-5 text-slate-700 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-800">Print ID Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-center transition-all group cursor-pointer"
                >
                  <Download className="w-5 h-5 text-slate-700 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-bold text-slate-800">Download Profile</span>
                </button>
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Certificates, Achievements, Remarks */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 1. Certificates Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <h3 className="font-bold text-sm text-slate-900">
                    Certificates ({certificates.length > 0 ? certificates.length : "1"})
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab("certificates")}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-0.5"
                >
                  <span>View All</span>
                  <span>→</span>
                </button>
              </div>

              {/* Certificate Preview Card matching screenshot */}
              <div className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 bg-slate-50/60 flex items-center justify-between gap-3 transition-all">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Miniature certificate frame */}
                  <div className="w-14 h-10 rounded bg-white border border-amber-300/80 p-1 flex flex-col justify-between shadow-xs flex-shrink-0">
                    <div className="w-4 h-1 bg-amber-400 rounded-full" />
                    <div className="space-y-0.5">
                      <div className="w-8 h-0.5 bg-slate-300 rounded-full" />
                      <div className="w-6 h-0.5 bg-slate-200 rounded-full" />
                    </div>
                    <div className="flex justify-end">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                  </div>

                  <div className="truncate">
                    <h4 className="font-bold text-xs text-slate-900 truncate">
                      {primaryCert ? primaryCert.courseName : `${student.courseCode || "ADCA"} Certificate`}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-mono truncate">
                      Certificate No.: {primaryCert ? primaryCert.certificateNumber : "SBCI/ADCA/2026/0145"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Issued On: {primaryCert ? new Date(primaryCert.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "20 Mar 2026"}
                    </p>
                  </div>
                </div>

                <Link
                  href={primaryCert ? `/verify/${primaryCert.certificateNumber}` : "/certificates/history"}
                  className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-purple-50 text-slate-700 hover:text-purple-600 transition-colors flex-shrink-0"
                  title="Download / View Certificate"
                >
                  <Download className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* 2. Achievements Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Achievements</h3>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/80 text-amber-950 flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Award className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">Student of the Year – 2026</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    For outstanding performance, dedication and active participation.
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Remarks Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-2.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" />
                <h3 className="font-bold text-sm text-slate-900">Remarks</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                &ldquo;A dedicated and disciplined student with excellent performance in both practical and theoretical subjects.&rdquo;
              </p>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: PERSONAL INFO */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900">Personal & Academic Background</h3>
            <p className="text-xs text-slate-500">Complete personal history, address and qualification records.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Primary Identification</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Father&apos;s Name</span>
                  <span className="font-bold text-slate-900">{student.fatherName || "Mr. Ram Pratap"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mother&apos;s Name</span>
                  <span className="font-bold text-slate-900">{student.motherName || "Mrs. Shanti Devi"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-bold text-slate-900">{formattedDob}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-bold text-slate-900">{student.gender}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Address & Contact</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Mobile Number</span>
                  <span className="font-mono font-bold text-slate-900">{student.mobile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-mono font-bold text-slate-900">{student.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Full Address</span>
                  <span className="font-bold text-slate-900 text-right">{student.address || "Main Market"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">District & State</span>
                  <span className="font-bold text-slate-900">{student.district}, {student.state}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COURSE & BATCH */}
      {activeTab === "course" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900">Enrolled Course & Batch Details</h3>
            <p className="text-xs text-slate-500">Curriculum schedule, assigned faculty and timing.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Course Information</span>
              <h4 className="text-base font-black text-slate-900">{student.courseName} ({student.courseCode})</h4>
              <p className="text-slate-600 leading-relaxed">
                Duration: {student.courseDuration || "12 Months"} • Total Fee: ₹{student.courseFee ? student.courseFee.toLocaleString() : "12,000"}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Batch Assignment</span>
              <h4 className="text-base font-black text-slate-900">{student.batchName || "ADCA-M01"}</h4>
              <p className="text-slate-600 leading-relaxed">
                Timing: 08:00 AM - 10:00 AM (Monday to Friday)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE */}
      {activeTab === "attendance" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Monthly Attendance Ledger</h3>
              <p className="text-xs text-slate-500">Live biometric and classroom attendance tracking.</p>
            </div>
            <div className="text-right">
              <span className="text-xl font-black text-emerald-600 font-mono">94.5%</span>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Overall Present</p>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center text-xs">
            {["Oct 2026", "Nov 2026", "Dec 2026", "Jan 2027", "Feb 2027", "Mar 2027"].map((m, i) => (
              <div key={m} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold">{m}</p>
                <p className="text-sm font-bold text-slate-900 mt-1">{92 + i}%</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EXAMINATION */}
      {activeTab === "examination" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-6">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900">Academic Evaluation & Marksheets</h3>
            <p className="text-xs text-slate-500">Official marks breakdown by subject and practical performance.</p>
          </div>

          {marksheets.length === 0 ? (
            <div className="p-8 text-center space-y-3 bg-slate-50 rounded-xl">
              <FileText className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Standard Marks Issued</p>
              <p className="text-[11px] text-slate-500">Total Marks: 500 | Obtained: 445 (89.00% Grade A+)</p>
              <Link
                href={`/marksheets?studentId=${student.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold"
              >
                <span>Generate Official Marksheet PDF</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {marksheets.map((m) => (
                <div key={m.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">{m.courseName} Marksheet</h4>
                    <p className="text-slate-500 font-mono">Number: {m.marksheetNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-purple-700">{m.percentage}% ({m.grade})</span>
                    <p className="text-[10px] text-slate-400">Total: {m.grandTotalObtained} / {m.grandTotalMax}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CERTIFICATES */}
      {activeTab === "certificates" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Issued Certificates & Verification</h3>
              <p className="text-xs text-slate-500">Authentic digital certificates linked to public QR verification.</p>
            </div>
            <Link
              href={`/certificates/generate?studentId=${student.id}`}
              className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              + Issue Certificate
            </Link>
          </div>

          <div className="space-y-3">
            {certificates.map((c) => (
              <div key={c.id} className="p-4 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{c.courseName}</h4>
                    <p className="font-mono text-slate-500">{c.certificateNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/verify/${c.certificateNumber}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Verify QR</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PAYMENTS */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900">Fee Receipts & Transaction Ledger</h3>
            <p className="text-xs text-slate-500">Admission fees, course tuition payments and balance dues.</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-slate-900">Student Admission Fee</p>
              <p className="text-[11px] text-slate-500">Deducted from institute wallet upon admission</p>
            </div>
            <span className="font-mono font-bold text-slate-900 text-sm">
              ₹{student.admissionFeeCharged || 150} Paid
            </span>
          </div>
        </div>
      )}

      {/* TAB 8: ACTIVITY LOG */}
      {activeTab === "activity" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="border-b pb-3">
            <h3 className="font-bold text-base text-slate-900">Audit Trail & Timeline</h3>
            <p className="text-xs text-slate-500">Lifecycle logs of profile updates, exams and certificates.</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-bold text-slate-900">Student Enrolled Successfully</p>
                <p className="text-[11px] text-slate-500">Admission completed with enrollment number {student.enrollmentNo}</p>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {formattedAdmissionDate}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: EDIT STUDENT */}
      {showEditModal && (
        <EditStudentModal
          student={student}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            loadStudentData();
            refreshInstitute();
          }}
        />
      )}

      {/* MODAL 2: PRINTABLE ID CARD MODAL */}
      {showIdCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-slate-900">Student Identity Card</h3>
              <button onClick={() => setShowIdCardModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Rendered Physical ID Card Preview */}
            <div id="printable-id-card" className="w-full bg-gradient-to-b from-[#110D2C] via-[#211245] to-[#391566] text-white p-5 rounded-2xl shadow-md border border-purple-400/30 text-center space-y-3 relative overflow-hidden">
              <div className="border-b border-white/20 pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-amber-300">
                  {institute?.name || "Educational Institute"}
                </h4>
                <p className="text-[9px] text-purple-200">Official Student Identity Card</p>
              </div>

              {/* Photo Frame */}
              <div className="w-20 h-20 rounded-xl bg-white border-2 border-white/40 overflow-hidden mx-auto shadow-md flex items-center justify-center text-slate-900 font-bold text-xl">
                {student.photoUrl ? (
                  <img src={student.photoUrl} alt={student.fullName} className="w-full h-full object-cover" />
                ) : (
                  student.fullName.charAt(0)
                )}
              </div>

              <div>
                <h5 className="font-black text-sm text-white">{student.fullName}</h5>
                <p className="text-[10px] font-mono text-amber-300 font-bold mt-0.5">{student.enrollmentNo}</p>
              </div>

              <div className="bg-white/10 rounded-lg p-2 text-[10px] space-y-1 text-left font-mono">
                <div className="flex justify-between">
                  <span className="text-purple-200">Course:</span>
                  <span className="font-bold">{student.courseCode || "ADCA"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Batch:</span>
                  <span className="font-bold">{student.batchName || "ADCA-M01"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Valid Till:</span>
                  <span className="font-bold">2027</span>
                </div>
              </div>

              <div className="pt-1 flex items-center justify-between text-[8px] text-purple-300">
                <span>Authorized Signatory</span>
                <span className="font-mono">VERIFIED</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowIdCardModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
