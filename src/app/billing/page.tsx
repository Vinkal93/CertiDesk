"use client";

import React, { useState, useEffect } from "react";
import { TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { WalletTransaction } from "@/types";

export default function UsageBillingPage() {
  const { institute, walletBalance } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    async function load() {
      if (!institute) return;
      const tx = await dataStore.getTransactions(institute.id);
      setTransactions(tx);
    }
    load();
  }, [institute]);

  const totalRecharged = transactions
    .filter((t) => t.type === "credit")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSpent = transactions
    .filter((t) => t.type === "debit")
    .reduce((acc, t) => acc + t.amount, 0);

  const admissionsCount = transactions.filter((t) => t.purpose === "admission").length;
  const updatesCount = transactions.filter((t) => t.purpose === "profile_update").length;

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Usage & Billing Summary</h2>
        <p className="text-xs text-slate-500">
          Monthly expenditure, breakdown by fee category, and lifetime recharge statistics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs text-slate-500 font-medium">Lifetime Recharges</p>
          <h3 className="text-2xl font-black text-emerald-600 mt-1">
            ₹ {totalRecharged.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Paid through Razorpay gateway</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs text-slate-500 font-medium">Lifetime Consumption</p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            ₹ {totalSpent.toLocaleString("en-IN")}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">
            {admissionsCount} admissions + {updatesCount} profile updates
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-card">
          <p className="text-xs text-slate-500 font-medium">Available Balance</p>
          <h3 className="text-2xl font-black text-brand-600 mt-1">
            ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">Ready for automated deductions</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-6 space-y-4">
        <h3 className="font-bold text-sm text-slate-900 border-b pb-3">Monthly Expenditure Breakdown</h3>
        <div className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>New Student Admissions (₹150 each)</span>
              <span>₹ {(admissionsCount * 150).toLocaleString()} ({admissionsCount} students)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full" style={{ width: "75%" }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>Profile Modifications (₹100 each)</span>
              <span>₹ {(updatesCount * 100).toLocaleString()} ({updatesCount} updates)</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: "25%" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
