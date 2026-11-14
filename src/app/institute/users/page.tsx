"use client";

import React from "react";
import { ShieldCheck, UserPlus, User, Mail, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UsersRolesPage() {
  const { institute } = useAuth();

  const staff = [
    { name: institute?.ownerName || "Vinkal Prajapati", email: institute?.email || "sbci.institute@gmail.com", role: "Primary Center Admin", status: "Active" },
    { name: "Er. Ramesh Verma", email: "ramesh.verma@example.com", role: "Senior Instructor & Marks Evaluator", status: "Active" },
    { name: "Pooja Singh", email: "pooja.singh@example.com", role: "Typing Lab Instructor", status: "Active" },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Staff Accounts & Roles</h2>
          <p className="text-xs text-slate-500">Manage center instructors, evaluators and administrative privileges.</p>
        </div>

        <button
          onClick={() => alert("Staff invitation sent!")}
          className="px-4 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Staff</span>
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3.5">Staff Member</th>
              <th className="p-3.5">Role</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staff.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="p-3.5">
                  <p className="font-bold text-slate-900">{s.name}</p>
                  <p className="text-[11px] text-slate-400">{s.email}</p>
                </td>
                <td className="p-3.5 font-semibold text-slate-700">{s.role}</td>
                <td className="p-3.5">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
