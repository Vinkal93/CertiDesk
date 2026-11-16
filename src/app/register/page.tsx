"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Building, User, Mail, Phone, MapPin, Lock, ArrowRight, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { dataStore } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { signUpFirebase, saveInstituteFirestore } from "@/lib/firebase/services";

export default function RegisterInstitutePage() {
  const router = useRouter();
  const { login } = useAuth();

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Gorakhpur");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("273001");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registeredInst, setRegisteredInst] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long.");
      }
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match. Please re-enter.");
      }

      // 1. Create Firebase Auth user
      try {
        await signUpFirebase(email.trim(), password);
      } catch (fbErr: any) {
        console.warn("Firebase signup notice:", fbErr.message);
      }

      // 2. Create Institute record in dataStore with password & active status
      const newInst = await dataStore.createInstitute({
        name: name.trim(),
        code: name.trim().slice(0, 4).toUpperCase(),
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        mobile: mobile.trim(),
        address: address.trim(),
        district: district.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        status: "active",
        walletBalance: 0,
        assignedCourses: ["c-adca", "c-typ", "c-dca"],
        settings: {
          admissionFee: 150,
          profileEditFee: 100,
          certificateFee: 0,
          marksheetFee: 0,
          autoApproveStudents: true,
        },
      });

      // 3. Sync to Firestore
      try {
        await saveInstituteFirestore(newInst);
      } catch (err) {
        console.warn("Firestore sync warning:", err);
      }

      // 4. Authenticate session
      await login(newInst.email, "institute_admin", newInst.id);

      setRegisteredInst(newInst);
    } catch (err: any) {
      setError(err.message || "Failed to register institute. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center items-center p-4 py-12 selection:bg-slate-900 selection:text-white">
      {/* Top Header Navigation */}
      <div className="max-w-xl w-full mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors bg-white px-3 py-1.5 rounded-full border border-slate-200/90 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-[11px] font-semibold text-slate-400">
          CertiDesk Pro • Institute Onboarding
        </span>
      </div>

      <div className="max-w-xl w-full bg-white rounded-3xl shadow-sm border border-slate-200/90 p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white font-black shadow-sm">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <span className="font-extrabold text-xl text-slate-900 tracking-tight">CertiDesk Pro</span>
          </Link>
          
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Register Your Educational Institute
          </h1>
          <p className="text-xs text-slate-500">
            Create an institute account to manage admissions, batches, exams and generate certificates.
          </p>
        </div>

        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {registeredInst ? (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">Institute Registered & Activated!</h3>
            <p className="text-xs text-slate-600">
              Welcome aboard, <strong>{registeredInst.name}</strong>. Your assigned Center ID is:
            </p>
            <div className="inline-block px-5 py-2.5 bg-[#0F172A] text-white font-mono font-bold text-lg rounded-xl shadow-sm">
              {registeredInst.id}
            </div>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              You can log in at any time using your Center ID (<strong>{registeredInst.id}</strong>) or registered Email and your password.
            </p>
            <div className="pt-2 flex items-center justify-center gap-3">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm inline-flex items-center gap-2"
              >
                <span>Launch Center Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Institute Name *</label>
                <div className="relative">
                  <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. National Computer Academy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Owner / Director Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="institute@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Number *</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Min 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Confirm Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    placeholder="Re-type password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Institute Full Address</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Near Railway Station, Civil Lines"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">District / City</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:ring-2 focus:ring-slate-900 focus:outline-hidden"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0F172A] hover:bg-slate-800 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all transform hover:-translate-y-0.5"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Create Institute Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100">
          Already registered?{" "}
          <Link href="/login" className="text-slate-900 font-bold hover:underline">
            Sign In with Institute ID
          </Link>
        </div>
      </div>
    </div>
  );
}
