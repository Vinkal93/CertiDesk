"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, DollarSign, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";

export default function InstituteSettingsPage() {
  const { institute, refreshInstitute } = useAuth();
  const [autoApprove, setAutoApprove] = useState(true);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (institute?.settings) {
      setAutoApprove(institute.settings.autoApproveStudents);
    }
  }, [institute]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;

    await dataStore.updateInstitute(institute.id, {
      settings: {
        ...institute.settings,
        autoApproveStudents: autoApprove,
      },
    });

    await refreshInstitute();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">System Settings</h2>
        <p className="text-xs text-slate-500">Configure center preferences and admission workflow rules.</p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Settings saved!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-5 text-xs">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-2">Admission & Center Workflow</h3>

        <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100">
          <div>
            <p className="font-bold text-slate-900">Auto-Approve New Admissions</p>
            <p className="text-[11px] text-slate-500">
              Immediately assign enrollment numbers and mark candidate status as Active.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoApprove}
            onChange={(e) => setAutoApprove(e.target.checked)}
            className="w-4 h-4 text-brand-600 rounded"
          />
        </div>

        <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-[11px] text-purple-900">
          <strong>Standard Billing:</strong> New Student Admission: ₹150 | Profile Edit: ₹100 | Certificates & Marksheets: ₹0
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-5 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl font-bold shadow-brand flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
