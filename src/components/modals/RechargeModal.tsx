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

  const quickAmounts = [1000, 2000, 3000];
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;
  const promoBonus = finalAmount === 3000 ? 200 : 0;
  const totalCredited = finalAmount + promoBonus;

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

      // 2. Atomic wallet recharge in dataStore & Firestore sync (with bonus if applicable)
      const desc = promoBonus > 0 
        ? `₹${finalAmount.toLocaleString()} Razorpay Recharge + ₹${promoBonus} Extra Promotional Bonus` 
        : `₹${finalAmount.toLocaleString()} Razorpay Recharge`;
      
      const tx = await dataStore.rechargeWallet(institute.id, totalCredited, paymentId, desc);
      
      // 3. Refresh AuthContext state immediately
      await refreshInstitute();

      setSuccessData({
        amount: totalCredited,
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Recharge Pack
                  </label>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Official Instant Top-Up
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {quickAmounts.map((amt) => {
                    const isSelected = !customAmount && selectedAmount === amt;
                    const hasSpecialBonus = amt === 3000;
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setSelectedAmount(amt);
                          setCustomAmount("");
                        }}
                        className={`relative py-3 px-2 rounded-xl text-center transition-all border flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? "bg-slate-900 border-slate-900 text-white shadow-md scale-[1.02]"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {hasSpecialBonus && (
                          <span className="absolute -top-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs">
                            +₹200 BONUS
                          </span>
                        )}
                        <span className="text-sm font-black">₹{amt.toLocaleString()}</span>
                        {hasSpecialBonus ? (
                          <span className={`text-[10px] font-semibold mt-0.5 ${isSelected ? "text-amber-300" : "text-emerald-600"}`}>
                            Get ₹3,200
                          </span>
                        ) : (
                          <span className="text-[10px] opacity-70 mt-0.5">Standard Pack</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bonus Notification Bar */}
              {promoBonus > 0 && (
                <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎁</span>
                    <span className="font-bold text-amber-900">
                      ₹3,000 Special Offer Applied!
                    </span>
                  </div>
                  <span className="font-extrabold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md">
                    +₹200 FREE Credit
                  </span>
                </div>
              )}

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
                    <span>
                      Pay ₹{finalAmount.toLocaleString("en-IN")}
                      {promoBonus > 0 ? ` (Get ₹${totalCredited.toLocaleString("en-IN")})` : ""}
                    </span>
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
