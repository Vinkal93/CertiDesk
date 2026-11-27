import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Award, BookOpen, CalendarCheck, GraduationCap, ShieldCheck, UserRound } from "lucide-react";
import { verifySessionToken } from "@/lib/auth/token";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export const dynamic = "force-dynamic";

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-slate-900">{value || "Not available"}</p>
    </div>
  );
}

export default async function StudentPortalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("cdp_session_token")?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session || session.role !== "student" || !session.uid || !session.instituteId || !session.studentId) {
    redirect("/login");
  }
  if (!adminDb || !adminAuth) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-slate-900">Student portal temporarily unavailable</h1>
          <p className="mt-2 text-sm text-slate-600">The secure student data service is not configured. Please contact your institute administrator.</p>
        </div>
      </main>
    );
  }

  const [authUser, userSnapshot, studentSnapshot, instituteSnapshot] = await Promise.all([
    adminAuth.getUser(session.uid).catch(() => null),
    adminDb.collection("users").doc(session.uid).get(),
    adminDb.collection("students").doc(session.studentId).get(),
    adminDb.collection("institutes").doc(session.instituteId).get(),
  ]);

  const userData = userSnapshot.data();
  if (!authUser || authUser.disabled || !userSnapshot.exists || userData?.role !== "student" ||
      (userData?.account_status && userData.account_status !== "active") ||
      (userData?.status && userData.status !== "active")) {
    redirect("/login");
  }

  if (!studentSnapshot.exists || !instituteSnapshot.exists) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <h1 className="text-lg font-bold text-slate-900">Student record not found</h1>
          <p className="mt-2 text-sm text-slate-600">Your login is valid, but your institute record is not available yet. Please contact your institute.</p>
        </div>
      </main>
    );
  }

  const student = studentSnapshot.data() || {};
  const institute = instituteSnapshot.data() || {};
  if (student.instituteId !== session.instituteId || userData?.instituteId !== session.instituteId ||
      (userData?.studentId && userData.studentId !== session.studentId)) {
    redirect("/login");
  }

  const studentCode = student.studentCode || userData?.studentCode || "Student ID pending";
  const fullName = student.fullName || userData?.name || session.displayName || "Student";

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold text-slate-950">CertiDesk Student Portal</p>
              <p className="truncate text-xs text-slate-500">{institute.name || "Your Institute"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" /> Secure session
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
        <section className="rounded-3xl bg-slate-950 p-6 text-white sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Student dashboard</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Welcome, {fullName}</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Your academic information and institute updates are available here.</p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3">
            <UserRound className="h-4 w-4 text-slate-300" />
            <span className="text-xs text-slate-300">Student ID</span>
            <strong className="font-mono text-sm tracking-wide">{studentCode}</strong>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Detail label="Course" value={student.courseName || "Not assigned"} />
          <Detail label="Batch" value={student.batchName || "Not assigned"} />
          <Detail label="Enrollment No." value={student.enrollmentNo || "Not assigned"} />
          <Detail label="Student Status" value={student.status || "Active"} />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <BookOpen className="h-5 w-5" />
              <h2 className="font-bold">Academic details</h2>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs text-slate-500">Session</dt><dd className="mt-1 font-semibold text-slate-900">{student.session || "—"}</dd></div>
              <div><dt className="text-xs text-slate-500">Course duration</dt><dd className="mt-1 font-semibold text-slate-900">{student.courseDuration || "—"}</dd></div>
              <div><dt className="text-xs text-slate-500">Admission date</dt><dd className="mt-1 font-semibold text-slate-900">{student.admissionDate || "—"}</dd></div>
              <div><dt className="text-xs text-slate-500">Institute code</dt><dd className="mt-1 font-mono font-semibold text-slate-900">{institute.code || "—"}</dd></div>
            </dl>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2 text-slate-900">
              <CalendarCheck className="h-5 w-5" />
              <h2 className="font-bold">Student services</h2>
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <Link href={`/students/${session.studentId}`} className="rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50">View student profile</Link>
              <Link href="/verify" className="rounded-xl border border-slate-200 p-3 text-sm font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50">Certificate verification</Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">Attendance, fee statements, examination results and issued certificates will appear here when published or synced by your institute.</p>
          </div>
        </section>

        <footer className="flex flex-col gap-1 border-t border-slate-200 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CertiDesk Pro</span>
          <span>Signed in as {session.email}</span>
        </footer>
      </div>
    </main>
  );
}
