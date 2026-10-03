'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import AuthModal from '@/common/AuthModal';
import SeekerSignUpCard from '@/job-seeker/SeekerSignUpCard';
import CompanySignUpCard from '@/recruiter/CompanySignUpCard';
import { Clock, User, Building2 } from 'lucide-react';

export default function RegisterPage() {
  const [selectedRole, setSelectedRole] = useState<'JOB_SEEKER' | 'RECRUITER'>('JOB_SEEKER');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [verifiedGst, setVerifiedGst] = useState<string | null>(null);
  const [verifiedRef, setVerifiedRef] = useState<string | null>(null);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Sync role from query parameters if present
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roleParam = params.get('role');
      if (roleParam === 'recruiter' || roleParam === 'company') {
        setSelectedRole('RECRUITER');
      } else if (roleParam === 'seeker' || roleParam === 'jobseeker') {
        setSelectedRole('JOB_SEEKER');
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif]">
      <Header onOpenAuth={(role, tab) => { setAuthModalTab(tab || 'LOGIN'); setAuthModalOpen(true); }} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full">
        {/* Page Heading & Clean Role Toggle */}
        <div className="max-w-2xl mx-auto mb-4 text-center">
          <h1 className="text-xl sm:text-2xl font-['Helvetica',Arial,sans-serif] font-bold text-[#111827] tracking-tight">
            Create Your Job Portal Account
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
            {selectedRole === 'JOB_SEEKER'
              ? 'Sign up as a Job Seeker to apply for verified real estate openings.'
              : 'Sign up as a Company / Recruiter to post vacancies and hire verified talent.'}
          </p>

          {/* Quick Role Switcher */}
          <div className="flex bg-gray-200/80 p-1 rounded-xl max-w-xs sm:max-w-sm mx-auto mt-2.5 shadow-xs">
            <button
              type="button"
              onClick={() => setSelectedRole('JOB_SEEKER')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedRole === 'JOB_SEEKER'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#b2c359]" />
              <span>Job Seeker</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('RECRUITER')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                selectedRole === 'RECRUITER'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-slate-800" />
              <span>Company / Employer</span>
            </button>
          </div>
        </div>

        {/* Single Focused Registration Form Container */}
        <div className="max-w-2xl mx-auto">
          {selectedRole === 'JOB_SEEKER' ? (
            <SeekerSignUpCard 
              onSwitchToLogin={() => { setAuthModalTab('LOGIN'); setAuthModalOpen(true); }}
              onSwitchRole={() => setSelectedRole('RECRUITER')}
            />
          ) : (
            <CompanySignUpCard 
              onSwitchToLogin={() => { setAuthModalTab('LOGIN'); setAuthModalOpen(true); }}
              onSwitchRole={() => setSelectedRole('JOB_SEEKER')}
              onShowVerification={(gst, refId, email) => {
                setVerifiedGst(gst);
                setVerifiedRef(refId || null);
                setVerifiedEmail(email || null);
              }}
            />
          )}
        </div>
      </main>

      <Footer />

      {/* Auth Modal for Quick Login */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* Recruiter 24-48h KYC Modal */}
      {verifiedGst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 text-center shadow-2xl border border-lime-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 bg-lime-100 text-[#b2c359] rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Clock className="w-7 h-7 text-[#b2c359]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#b2c359] block mb-1">
              APPLICATION SUBMITTED
            </span>
            <h3 className="text-xl font-black text-gray-900 mb-2">Account Under Verification</h3>

            {/* Reference ID Box */}
            {verifiedRef && (
              <div className="bg-[#181C20] text-white p-3 rounded-2xl mb-4 text-left flex items-center justify-between border border-slate-700">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider block">Reference ID</span>
                  <span className="font-mono text-sm font-black text-[#b2c359] tracking-wider">{verifiedRef}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(verifiedRef);
                      setCopiedRef(true);
                      setTimeout(() => setCopiedRef(false), 2000);
                    }
                  }}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <span>{copiedRef ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            )}

            <div className="bg-lime-50 text-lime-950 border border-lime-200 p-4 rounded-2xl text-xs mb-5 text-left space-y-2">
              <p className="font-bold text-gray-950">
                Thank you for showing your interest!
              </p>
              <p className="text-gray-700 leading-relaxed text-[11px]">
                Your company details, GSTIN (<strong>{verifiedGst}</strong>), and GST certificate have been received and are under verification by the Torbit Realty compliance team.
              </p>
              <p className="text-gray-600 text-[11px] pt-1 border-t border-lime-200/70">
                ✉️ An acknowledgment email has been sent to <strong>{verifiedEmail || 'your email'}</strong>. Upon approval (within 24–48 hours), you will receive your temporary password.
              </p>
            </div>

            <button
              onClick={() => {
                setVerifiedGst(null);
                window.location.href = '/';
              }}
              className="w-full bg-[#b2c359] hover:bg-[#9eb047] text-gray-900 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition shadow-xs cursor-pointer"
            >
              Done / Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
