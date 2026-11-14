"use client";

import React, { useState } from "react";
import { X, Edit3, AlertCircle, AlertTriangle, CheckCircle2, Loader2, Info } from "lucide-react";
import { Student } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";

interface EditStudentModalProps {
  student: Student;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditStudentModal({ student, isOpen, onClose, onSuccess }: EditStudentModalProps) {
  const { institute, walletBalance, refreshInstitute } = useAuth();
  const [fullName, setFullName] = useState(student.fullName);
  const [fatherName, setFatherName] = useState(student.fatherName);
  const [motherName, setMotherName] = useState(student.motherName || "");
  const [mobile, setMobile] = useState(student.mobile);
  const [email, setEmail] = useState(student.email);
  const [address, setAddress] = useState(student.address);
  const [qualification, setQualification] = useState(student.qualification);
  const [status, setStatus] = useState(student.status);

  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const editFee = institute?.settings.profileEditFee ?? 100;

  // Determine if meaningful change occurred (Name, Parent name, contact info, qualification)
  const isMeaningful =
    fullName !== student.fullName ||
    fatherName !== student.fatherName ||
    motherName !== student.motherName ||
    mobile !== student.mobile ||
    email !== student.email ||
    qualification !== student.qualification;

  const handleSubmit = async () => {
    if (isMeaningful && walletBalance < editFee) {
      setError(`Insufficient wallet balance. You have ₹${walletBalance}, but ₹${editFee} is required for profile updates.`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await dataStore.updateStudent(
        student.id,
        {
          fullName,
          fatherName,
          motherName,
          mobile,
          email,
          address,
          qualification,
          status,
        },
        isMeaningful
      );

      await refreshInstitute();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to update student profile.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Edit3 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Edit Student Profile</h3>
              <p className="text-xs text-slate-400 font-mono">{student.enrollmentNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Billing Notice Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-800 space-y-0.5">
              <p className="font-bold">Important Billing Policy:</p>
              <p>
                Updating core student details (Name, Parentage, Contact) will deduct <strong>₹{editFee}</strong> from your wallet balance upon saving.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Student Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Father's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mother's Name</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Qualification</label>
              <input
                type="text"
                value={qualification}
                onChange={(e) => setQualification(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden bg-white"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
                <option value="Dropped">Dropped</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Full Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-brand-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="text-[11px] text-slate-600 font-medium">
            {isMeaningful ? (
              <span className="text-brand-700 font-bold">Charge: ₹{editFee} will be deducted</span>
            ) : (
              <span className="text-emerald-700 font-bold">No charge for status changes</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => {
                if (isMeaningful) {
                  setShowConfirmDialog(true);
                } else {
                  handleSubmit();
                }
              }}
              className="px-5 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl text-xs font-bold shadow-brand flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>

        {/* Confirmation Modal for ₹100 charge */}
        {showConfirmDialog && (
          <div className="absolute inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h4 className="font-bold text-slate-900 text-sm">Confirm Profile Update</h4>
                <p className="text-xs text-slate-600">
                  Are you sure you want to update this student's profile? <strong>₹{editFee}</strong> will be deducted from your wallet balance.
                </p>
                <div className="mt-2 p-2 bg-slate-50 rounded-lg text-[11px] text-slate-500">
                  Wallet after update: ₹{(walletBalance - editFee).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 py-2 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setShowConfirmDialog(false);
                    handleSubmit();
                  }}
                  className="flex-1 py-2 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl text-xs font-bold shadow-brand"
                >
                  Confirm & Deduct ₹{editFee}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
