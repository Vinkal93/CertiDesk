"use client";

import React from "react";
import { AlertCircle, CheckCircle2, HelpCircle, X, Loader2 } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
      iconBg: "bg-rose-50 border-rose-100",
      confirmBtn: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
    },
    primary: {
      icon: <HelpCircle className="w-6 h-6 text-slate-800" />,
      iconBg: "bg-slate-100 border-slate-200",
      confirmBtn: "bg-slate-900 hover:bg-slate-800 text-white shadow-sm",
    },
    warning: {
      icon: <AlertCircle className="w-6 h-6 text-amber-600" />,
      iconBg: "bg-amber-50 border-amber-100",
      confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-sm",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200/80 p-6 space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border ${variantStyles.iconBg}`}>
            {variantStyles.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-slate-900 leading-tight">{title}</h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${variantStyles.confirmBtn}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface AlertModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "info";
  buttonText?: string;
  onClose: () => void;
}

export function AlertModal({
  isOpen,
  title,
  message,
  type = "info",
  buttonText = "Understood",
  onClose,
}: AlertModalProps) {
  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-600" />,
      iconBg: "bg-emerald-50 border-emerald-100",
      btnClass: "bg-emerald-600 hover:bg-emerald-700 text-white",
    },
    error: {
      icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
      iconBg: "bg-rose-50 border-rose-100",
      btnClass: "bg-rose-600 hover:bg-rose-700 text-white",
    },
    info: {
      icon: <HelpCircle className="w-6 h-6 text-slate-800" />,
      iconBg: "bg-slate-100 border-slate-200",
      btnClass: "bg-slate-900 hover:bg-slate-800 text-white",
    },
  }[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200/80 p-6 text-center space-y-4 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto border ${typeConfig.iconBg}`}>
          {typeConfig.icon}
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${typeConfig.btnClass}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
