"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import StudentProfilePage from "@/app/students/[id]/page";

export default function StudentDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Fallback demo Khushbu std-0268
        router.replace("/students/std-0268");
      } else if (user.studentId) {
        router.replace(`/students/${user.studentId}`);
      } else {
        router.replace("/students/std-0268");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="py-24 text-center text-xs text-slate-500 font-medium">
      Redirecting to Student Dashboard...
    </div>
  );
}
