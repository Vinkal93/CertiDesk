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
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { Student, Certificate, Marksheet, WalletTransaction, AuditLog } from "@/types";
import EditStudentModal from "@/components/modals/EditStudentModal";

export default function StudentProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { institute, refreshInstitute } = useAuth();
  const studentId = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [marksheets, setMarksheets] = useState<Marksheet[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStudentData = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const s = await dataStore.getStudentById(studentId);
      if (!s) return;
      setStudent(s);

      const allCerts = await dataStore.getCertificates(s.instituteId);
      setCertificates(allCerts.filter((c) => c.studentId === s.id));

      const allMarks = await dataStore.getMarksheets(s.instituteId);
      setMarksheets(allMarks.filter((m) => m.studentId === s.id));

      const allTx = await dataStore.getTransactions(s.instituteId);
      setTransactions(allTx.filter((t) => t.relatedStudentId === s.id));

      const allLogs = await dataStore.getAuditLogs(s.instituteId);
      setLogs(allLogs.filter((l) => l.targetId === s.id));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [studentId]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-500 text-xs">
        Loading student record...
      </div>
    );
  }

  if (!student) {
    return (
      <div className="py-20 text-center space-y-3">
        <p className="text-sm font-bold text-slate-900">Student not found.</p>
        <Link href="/students" className="text-xs text-brand-600 font-semibold hover:underline">
          Return to Students Directory
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "personal", label: "Personal Information", icon: User },
    { id: "course", label: "Course Details", icon: BookOpen },
    { id: "batch", label: "Batch History", icon: Layers },
    { id: "attendance", label: "Attendance", icon: Calendar },
    { id: "exams", label: "Examinations & Marks", icon: FileText },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "marksheets", label: "Marksheets", icon: FileText },
    { id: "payments", label: "Payment History", icon: CreditCard },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/students"
              className="p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-brand flex-shrink-0">
              {student.fullName.charAt(0)}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-black text-slate-900">{student.fullName}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {student.status}
                </span>
              </div>
              <p className="text-xs font-mono text-brand-700 font-semibold mt-0.5">
                Enrollment: {student.enrollmentNo}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {student.mobile}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {student.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {student.district}, {student.state}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print ID Card</span>
            </button>

            <button
              onClick={() => setShowEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile (₹100)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-1.5 overflow-x-auto flex items-center gap-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? "bg-[#6529E8] text-white shadow-brand"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6">
        {activeTab === "overview" && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Academic Course</h4>
                <div className="space-y-1">
                  <p className="text-slate-500">Course Name</p>
                  <p className="font-bold text-slate-900 text-sm">{student.courseName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Batch Name</p>
                  <p className="font-bold text-slate-800">{student.batchName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Session</p>
                  <p className="font-semibold text-slate-800">{student.session}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Admission Details</h4>
                <div className="space-y-1">
                  <p className="text-slate-500">Admission Date</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(student.admissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Course Duration</p>
                  <p className="font-semibold text-slate-800">{student.courseDuration}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Total Course Fee</p>
                  <p className="font-bold text-emerald-700">₹{student.courseFee.toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Credentials & Status</h4>
                <div className="space-y-1">
                  <p className="text-slate-500">Certificates Issued</p>
                  <p className="font-bold text-brand-600 text-sm">{certificates.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Marksheets Issued</p>
                  <p className="font-bold text-brand-600 text-sm">{marksheets.length}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-slate-500">Last Profile Update</p>
                  <p className="font-semibold text-slate-800">
                    {new Date(student.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions inside Profile */}
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href={`/certificates/generate?studentId=${student.id}`}
                className="px-4 py-2 bg-[#6529E8] text-white font-bold rounded-xl shadow-brand text-xs flex items-center gap-1.5"
              >
                <Award className="w-4 h-4" />
                <span>Issue Certificate</span>
              </Link>

              <Link
                href={`/marksheets?studentId=${student.id}`}
                className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-xs text-xs flex items-center gap-1.5"
              >
                <FileText className="w-4 h-4" />
                <span>Issue Marksheet</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === "personal" && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Full Personal Particulars</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Father's Name</span>
                <p className="font-bold text-slate-900">{student.fatherName}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Mother's Name</span>
                <p className="font-bold text-slate-900">{student.motherName || "N/A"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Date of Birth</span>
                <p className="font-bold text-slate-900">{student.dob}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Gender</span>
                <p className="font-bold text-slate-900">{student.gender}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">Qualification</span>
                <p className="font-bold text-slate-900">{student.qualification}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <span className="text-slate-500">School / College</span>
                <p className="font-bold text-slate-900">{student.schoolCollege || "N/A"}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl space-y-1 md:col-span-2">
                <span className="text-slate-500">Permanent Address</span>
                <p className="font-bold text-slate-900">{student.address}, {student.district}, {student.state} - {student.pincode}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "certificates" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Issued Certificates</h3>
              <Link
                href={`/certificates/generate?studentId=${student.id}`}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-1"
              >
                <Award className="w-3.5 h-3.5" />
                <span>Issue New Certificate</span>
              </Link>
            </div>

            {certificates.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No certificate has been generated for this student yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((c) => (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-xl space-y-2 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-600">{c.certificateNumber}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </div>
                    <p className="font-bold text-slate-900">{c.courseName}</p>
                    <p className="text-slate-500 text-[11px]">Grade: {c.grade} ({c.percentage}%)</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Link
                        href={`/verify/${c.certificateNumber}`}
                        target="_blank"
                        className="text-xs text-brand-600 hover:underline font-semibold"
                      >
                        Public Verification Page →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "marksheets" && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900">Official Marksheets</h3>
              <Link
                href={`/marksheets?studentId=${student.id}`}
                className="px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Generate Marksheet</span>
              </Link>
            </div>

            {marksheets.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                No marksheet records generated yet.
              </div>
            ) : (
              <div className="space-y-3">
                {marksheets.map((m) => (
                  <div key={m.id} className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-brand-600">{m.marksheetNumber}</span>
                        <h4 className="font-bold text-slate-900 text-sm">{m.courseName}</h4>
                      </div>
                      <div className="text-right">
                        <span className="px-2.5 py-1 rounded-md text-xs font-black bg-emerald-100 text-emerald-800">
                          {m.result} ({m.grade} - {m.percentage}%)
                        </span>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="p-2">Subject</th>
                            <th className="p-2">Max Marks</th>
                            <th className="p-2">Obtained</th>
                            <th className="p-2">Grade</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {m.subjects.map((sub, idx) => (
                            <tr key={idx}>
                              <td className="p-2 font-medium">{sub.subjectName}</td>
                              <td className="p-2">{sub.totalMax}</td>
                              <td className="p-2 font-bold text-emerald-700">{sub.totalObtained}</td>
                              <td className="p-2">{sub.grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "payments" && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Wallet Fee Ledger For Student</h3>
            {transactions.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No transactions recorded for this student.</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{tx.description}</p>
                      <p className="text-[11px] text-slate-400">{new Date(tx.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                      - ₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-900">Audit Trail</h3>
            {logs.length === 0 ? (
              <p className="text-slate-400 py-6 text-center">No audit entries found for this student.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log) => (
                  <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <div className="flex justify-between font-semibold text-slate-700">
                      <span>{log.action}</span>
                      <span className="text-[10px] text-slate-400">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600">{log.details}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
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
    </div>
  );
}
