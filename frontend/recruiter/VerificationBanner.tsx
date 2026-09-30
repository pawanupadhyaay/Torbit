'use client';
import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VerificationBannerProps {
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BLOCKED';
  rejectionReason?: string | null;
}

export default function VerificationBanner({ status, rejectionReason }: VerificationBannerProps) {
  if (status === 'APPROVED') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-emerald-950">Company Verified & Active</h4>
          <p className="text-[11px] text-emerald-800 mt-0.5">
            Your recruiter credentials and GSTIN have been validated by Torbit Admin. You have full access to publish jobs across all 32 real estate categories.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'REJECTED' || status === 'BLOCKED') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-3 shadow-xs">
        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-800 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-red-950">
            Account {status === 'REJECTED' ? 'Verification Declined' : 'Suspended'}
          </h4>
          <p className="text-[11px] text-red-800 mt-0.5">
            {rejectionReason || 'Please contact Torbit Realty compliance team to update your business registration documents.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-300 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-md shadow-amber-500/20">
          <Clock className="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-gray-900">
              Company Credentials Under Verification (24–48h SLA)
            </h3>
            <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Notice
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-0.5">
            &quot;Thank you for showing your interest, your details are under verification we will get back in 24-48 hours.&quot;
            Job creation is locked until verified.
          </p>
        </div>
      </div>
    </div>
  );
}
