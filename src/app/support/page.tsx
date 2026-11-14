"use client";

import React from "react";
import { Headphones, MessageSquare, Mail, Phone, ExternalLink, HelpCircle, ShieldCheck } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Help & Support Center</h2>
        <p className="text-xs text-slate-500">
          Get direct assistance for wallet recharge, certificate templates, examinations or admissions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-brand-600 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Phone Support</h3>
          <p className="text-xs text-slate-500">Available Monday to Saturday, 9:00 AM - 7:00 PM</p>
          <p className="font-mono font-bold text-xs text-slate-900">+91 98765 43210</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">WhatsApp Chat</h3>
          <p className="text-xs text-slate-500">Instant answers from technical support engineers.</p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
          >
            <span>Open WhatsApp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900">Email Support</h3>
          <p className="text-xs text-slate-500">For billing queries, enterprise upgrades and custom setups.</p>
          <p className="font-mono font-bold text-xs text-slate-900">support@certidesk.pro</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-card space-y-4">
        <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-brand-600" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-slate-900">How does wallet billing work?</h4>
            <p className="text-slate-600 mt-1">
              CertiDesk Pro operates on an automated prepaid wallet. Each new student admission deducts ₹150, and meaningful profile corrections deduct ₹100. Certificate and marksheet generations are free.
            </p>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl">
            <h4 className="font-bold text-slate-900">How does public QR code verification work?</h4>
            <p className="text-slate-600 mt-1">
              Every certificate and marksheet contains a cryptographically tracked dynamic QR code pointing to <code>/verify/[number]</code>. When scanned by an employer or government authority, it verifies the issuing institute and candidate validity without exposing private phone numbers or personal records.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
