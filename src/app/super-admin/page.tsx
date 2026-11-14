"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SuperAdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/su");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Redirecting to Master Control Plane...</p>
      </div>
    </div>
  );
}
