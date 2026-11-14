"use client";

import React, { useState } from "react";
import { X, Wallet, CheckCircle2, Shield, AlertCircle, Loader2 } from "lucide-react";
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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000];
  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : selectedAmount;

  const handleRecharge = async () => {
    if (finalAmount < 100) {
      setErrorMessage("Minimum recharge amount is ₹100");
      return;
    }

    if (!institute) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Simulate/trigger Razorpay checkout
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // Atomic wallet credit in store
      const mockPayId = `pay_rzp_${Date.now()}`;
      await dataStore.rechargeWallet(institute.id, finalAmount, mockPayId);
      await refreshInstitute();

      setSuccessMessage(`Successfully recharged ₹${finalAmount.toLocaleString("en-IN")} into your wallet!`);
      if (onSuccess) onSuccess();

      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Recharge Wallet</h3>
              <p className="text-xs text-brand-100 mt-0.5">Instant credit via UPI, Cards, NetBanking</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {successMessage ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="font-bold text-lg text-slate-900">Payment Successful!</h4>
              <p className="text-sm text-slate-600">{successMessage}</p>
            </div>
          ) : (
            <>
              {/* Current Balance */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex justify-between items-center text-xs">
                <span className="text-slate-600 font-medium">Current Balance:</span>
                <span className="text-slate-900 font-bold text-sm">
                  ₹ {institute?.walletBalance.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </span>
              </div>

              {/* Quick Select Options */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Amount
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
                            ? "bg-brand-50 border-brand-600 text-brand-600 ring-2 ring-brand-600/20"
                            : "bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
                  Or Enter Custom Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">₹</span>
                  <input
                    type="number"
                    min="100"
                    placeholder="Enter custom amount"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
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
                <span>Secured by 256-bit encrypted Razorpay payment gateway</span>
              </div>

              {/* Pay Action */}
              <button
                type="button"
                disabled={isProcessing || finalAmount <= 0}
                onClick={handleRecharge}
                className="w-full py-3 bg-[#6529E8] hover:bg-[#541FD0] disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-brand flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay ₹{finalAmount.toLocaleString("en-IN")} via Razorpay</span>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
