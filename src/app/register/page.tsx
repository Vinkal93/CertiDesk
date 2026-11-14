"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Award, Building, User, Mail, Phone, MapPin, Lock, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { dataStore } from "@/lib/db";
import { useAuth } from "@/context/AuthContext";
import { signUpFirebase } from "@/lib/firebase/services";

export default function RegisterInstitutePage() {
  const router = useRouter();
  const { switchInstitute } = useAuth();

  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("Gorakhpur");
  const [state, setState] = useState("Uttar Pradesh");
  const [pincode, setPincode] = useState("273001");
  const [loading, setLoading] = useState(false);
  const [registeredInst, setRegisteredInst] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create Firebase Auth user
      if (password && password.length >= 6) {
        await signUpFirebase(email, password).catch((fbErr) => {
          console.warn("Firebase signup notice (e.g. email exists or offline):", fbErr.message);
        });
      }

      const newInst = await dataStore.createInstitute({
        name,
        code: name.slice(0, 4).toUpperCase(),
        ownerName,
        email,
        mobile,
        address,
        district,
        state,
        pincode,
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

      setRegisteredInst(newInst);
      await switchInstitute(newInst.id);
    } catch (err: any) {
      alert(err.message || "Failed to register institute");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8FC] flex flex-col justify-center items-center p-4 py-12">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-slate-200/90 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 flex items-center justify-center text-white shadow-brand mx-auto">
            <Building className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Register Your Educational Institute
          </h1>
          <p className="text-xs text-slate-500">
            Join the CertiDesk Pro SaaS network for certificate & student management.
          </p>
        </div>

        {registeredInst ? (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900">Institute Account Activated!</h3>
            <p className="text-xs text-slate-600">
              Welcome aboard, <strong>{registeredInst.name}</strong>. Your assigned Center ID is:
            </p>
            <div className="inline-block px-5 py-2.5 bg-brand-600 text-white font-mono font-black text-lg rounded-xl shadow-brand">
              {registeredInst.id}
            </div>
            <div className="pt-2">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl text-xs font-bold shadow-brand inline-flex items-center gap-2"
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
                <input
                  type="text"
                  placeholder="e.g. National Computer Academy"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Owner / Director Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Vinkal Prajapati"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  placeholder="institute@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Mobile Number *</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Center Address</label>
              <input
                type="text"
                placeholder="Station Road, Civil Lines..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl font-bold shadow-brand flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Complete Center Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-slate-500">
          Already registered?{" "}
          <Link href="/login" className="text-brand-600 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
