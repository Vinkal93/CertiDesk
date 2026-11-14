"use client";

import React, { useState, useEffect } from "react";
import { Building, Phone, Mail, MapPin, Save, CheckCircle2, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { dataStore } from "@/lib/db";

export default function InstituteProfilePage() {
  const { institute, refreshInstitute } = useAuth();
  const [name, setName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (institute) {
      setName(institute.name);
      setOwnerName(institute.ownerName);
      setEmail(institute.email);
      setMobile(institute.mobile);
      setAddress(institute.address);
      setDistrict(institute.district);
      setState(institute.state);
      setPincode(institute.pincode);
    }
  }, [institute]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institute) return;

    await dataStore.updateInstitute(institute.id, {
      name,
      ownerName,
      email,
      mobile,
      address,
      district,
      state,
      pincode,
    });

    await refreshInstitute();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Institute Profile</h2>
        <p className="text-xs text-slate-500">
          Manage your institution's registration details, contact numbers, and address.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4 text-xs">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-lg">
              <Building className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">{institute?.name}</h3>
              <p className="text-[11px] font-mono text-slate-400">ID: {institute?.id}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {institute?.status}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Institute Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-bold"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Director / Owner Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-bold"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Official Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
              required
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Helpline Mobile</label>
            <input
              type="text"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono"
              required
            />
          </div>
        </div>

        <div className="border-t pt-3 space-y-3">
          <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">Center Address</h4>
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Street Address</label>
            <input
              type="text"
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
        </div>

        <div className="flex justify-end pt-3">
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#6529E8] hover:bg-[#541FD0] text-white rounded-xl font-bold shadow-brand flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
}
