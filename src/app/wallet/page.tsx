"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  CreditCard, 
  Info 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { WalletTransaction } from "@/types";
import RechargeModal from "@/components/modals/RechargeModal";

export default function WalletPage() {
  const { institute, walletBalance, refreshInstitute } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [showRechargeModal, setShowRechargeModal] = useState(false);

  const loadData = async () => {
    if (!institute) return;
    const tx = await dataStore.getTransactions(institute.id);
    setTransactions(tx);
  };

  useEffect(() => {
    loadData();
  }, [institute]);

  const isLowBalance = walletBalance < 300;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Wallet & Recharge</h2>
          <p className="text-xs text-slate-500">
            Automated prepaid billing system. Balance is deducted only upon verified operations.
          </p>
        </div>

        <button
          onClick={() => setShowRechargeModal(true)}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white text-xs font-bold rounded-xl shadow-brand transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Recharge Wallet</span>
        </button>
      </div>

      {isLowBalance && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="font-bold">Low Wallet Balance Alert</p>
              <p className="text-[11px] text-amber-700">
                Your current balance is below ₹300. Recharge now to avoid interruption during new admissions.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRechargeModal(true)}
            className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs"
          >
            Recharge
          </button>
        </div>
      )}

      {/* Main Balance Banner & Quick Recharge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-gradient-to-br from-[#10152B] via-[#1A184A] to-[#2B1B68] rounded-3xl p-7 text-white shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
                <Wallet className="w-6 h-6 text-brand-300" />
              </div>
              <div>
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Prepaid Balance
                </span>
                <h3 className="text-3xl font-black mt-0.5">
                  ₹ {walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active Account
            </span>
          </div>

          <div className="pt-8">
            <p className="text-xs text-slate-300 mb-3 font-semibold">Quick Recharge Amounts:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[500, 1000, 2000, 5000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setShowRechargeModal(true)}
                  className="py-3 px-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl text-xs font-black backdrop-blur-md transition-all text-center cursor-pointer"
                >
                  + ₹{amt.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Rules Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/90 shadow-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b pb-3">
            <CreditCard className="w-4 h-4 text-brand-600" />
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900">
              Platform Fee Schedule
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">New Student Admission</span>
              <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">₹150</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Profile Edit / Update</span>
              <span className="font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">₹100</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Certificate Generation</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">₹0 (Free)</span>
            </div>

            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-slate-600 font-medium">Marksheet Generation</span>
              <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">₹0 (Free)</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero hidden charges. Transparent ledger.</span>
          </p>
        </div>
      </div>

      {/* Recent Wallet Transactions Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm text-slate-900">Wallet Transaction History</h3>
          <Link href="/transactions" className="text-xs text-brand-600 font-semibold hover:underline">
            View Full Ledger →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase">
              <tr>
                <th className="p-3">Transaction ID</th>
                <th className="p-3">Description</th>
                <th className="p-3">Date & Time</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Balance After</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.slice(0, 8).map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[11px] text-slate-500">{tx.id}</td>
                    <td className="p-3 font-bold text-slate-900">{tx.description}</td>
                    <td className="p-3 text-slate-500">
                      {new Date(tx.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3">
                      <span
                        className={`font-black font-mono ${
                          isCredit ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {isCredit ? `+ ₹${tx.amount.toLocaleString()}` : `- ₹${tx.amount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-800">
                      ₹{tx.balanceAfter?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "-"}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recharge Modal */}
      {showRechargeModal && (
        <RechargeModal
          isOpen={showRechargeModal}
          onClose={() => setShowRechargeModal(false)}
          onSuccess={() => {
            loadData();
            refreshInstitute();
          }}
        />
      )}
    </div>
  );
}
