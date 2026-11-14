"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeftRight, Search, Download, Filter, Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";
import { WalletTransaction } from "@/types";

export default function TransactionsPage() {
  const { institute } = useAuth();
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      if (!institute) return;
      const tx = await dataStore.getTransactions(institute.id);
      setTransactions(tx);
    }
    load();
  }, [institute]);

  const filtered = transactions.filter((t) => {
    const matchesType = filterType === "all" || t.type === filterType;
    const matchesSearch =
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleExportCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["Transaction ID", "Description", "Type", "Amount", "Balance After", "Date", "Status"];
    const rows = filtered.map((t) => [
      t.id,
      `"${t.description}"`,
      t.type,
      t.amount,
      t.balanceAfter || 0,
      t.createdAt,
      t.status,
    ]);

    const csv = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encoded = encodeURI(csv);
    const a = document.createElement("a");
    a.href = encoded;
    a.download = `CertiDesk_Ledger_${institute?.id || "Export"}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Financial Transactions</h2>
          <p className="text-xs text-slate-500">
            Immutable debit & credit ledger for admissions, profile edits and Razorpay recharges.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl"
        >
          <Download className="w-4 h-4 text-brand-600" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-card flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[240px] relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by transaction ID or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-xl text-xs font-medium focus:bg-white"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 bg-slate-50 border rounded-xl text-xs font-medium text-slate-700"
        >
          <option value="all">All Transactions</option>
          <option value="debit">Debits Only (-)</option>
          <option value="credit">Credits Only (+)</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase">
            <tr>
              <th className="p-3.5">Transaction ID</th>
              <th className="p-3.5">Description</th>
              <th className="p-3.5">Type</th>
              <th className="p-3.5">Amount</th>
              <th className="p-3.5">Balance After</th>
              <th className="p-3.5">Date & Time</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400">
                  No transaction records found.
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isCredit = tx.type === "credit";
                return (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono text-[11px] text-slate-500">{tx.id}</td>
                    <td className="p-3.5 font-bold text-slate-900">{tx.description}</td>
                    <td className="p-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isCredit
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {isCredit ? (
                          <>
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            <span>Credit</span>
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3 h-3 text-rose-600" />
                            <span>Debit</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-black">
                      <span className={isCredit ? "text-emerald-600" : "text-rose-600"}>
                        {isCredit ? `+ ₹${tx.amount.toLocaleString()}` : `- ₹${tx.amount.toLocaleString()}`}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">
                      ₹{tx.balanceAfter?.toLocaleString("en-IN", { minimumFractionDigits: 2 }) || "-"}
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {new Date(tx.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
