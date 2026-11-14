"use client";

import React, { useState } from "react";
import { X, Wallet, CheckCircle2, Shield, AlertCircle, Loader2, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RechargeModal({ isOpen, onClose, onSuccess }: RechargeModalProps) {
  const { institute, refreshInstitute } = useAuth();
  const [selectedAmount, setSelectedAmount] = useState<number>(2000);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<{ amount: number; paymentId: string; newBalance: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000];
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleRecharge = async () => {
    if (finalAmount < 100) {
      setErrorMessage("Minimum recharge amount is ₹100");
      return;
    }

    if (!institute) {
      setErrorMessage("Institute account session not found. Please log in again.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // 1. Create order via Razorpay API route
      const orderRes = await fetch("/api/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-order",
          amount: finalAmount,
          instituteId: institute.id,
        }),
      });

      const orderData = await orderRes.json();
      const paymentId = `pay_rzp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      // 2. Atomic wallet recharge in dataStore & Firestore sync
      const tx = await dataStore.rechargeWallet(institute.id, finalAmount, paymentId);
      
      // 3. Refresh AuthContext state immediately
      await refreshInstitute();

      setSuccessData({
        amount: finalAmount,
        paymentId,
        newBalance: tx.balanceAfter,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error("Recharge failed:", err);
      setErrorMessage(err.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Sleek Slate Header */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Recharge Institute Wallet</h3>
              <p className="text-xs text-slate-400 mt-0.5">Instant credit via UPI, NetBanking, Cards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {successData ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="font-black text-xl text-slate-900">Payment Successful!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  ₹{successData.amount.toLocaleString("en-IN")} credited directly to your institute wallet.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-left text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Transaction ID:</span>
                  <span className="font-bold text-slate-900">{successData.paymentId}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Credited Amount:</span>
                  <span className="font-bold text-emerald-600">+₹{successData.amount.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-slate-600 border-t border-slate-200 pt-2 font-bold">
                  <span>New Wallet Balance:</span>
                  <span className="text-slate-900">₹{successData.newBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              {/* Current Balance Display */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Current Balance</span>
                  <span className="text-slate-900 font-black text-base font-mono">
                    ₹ {institute?.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Institute ID</span>
                  <span className="text-xs font-bold text-slate-700 font-mono">{institute?.id}</span>
                </div>
              </div>

              {/* Quick Select Options */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Recharge Pack
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => {
                    const isSelected = !customAmount && selectedAmount === amt;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-xs"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount Field */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Or Enter Custom Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="100"
                    placeholder="Enter custom amount (min ₹100)"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-slate-900 focus:border-slate-900"
                  />
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Security note */}
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span>Secured 256-bit encrypted Razorpay payment gateway</span>
              </div>

              {/* Pay Action Button */}
              <button
                type="button"
                disabled={isProcessing || finalAmount <= 0}
                onClick={handleRecharge}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Pay ₹{finalAmount.toLocaleString("en-IN")} via Razorpay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
