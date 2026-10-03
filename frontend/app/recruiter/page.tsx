'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import AuthModal from '@/common/AuthModal';
import CompanySignUpCard from '@/recruiter/CompanySignUpCard';

export default function RecruiterPortalPage() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        const u = JSON.parse(stored);
        if (u.role === 'RECRUITER' || u.role === 'COMPANY') {
          router.replace('/recruiter/dashboard');
        }
      }
    } catch (e) {}
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif]">
      <Header onOpenAuth={(role, tab) => { setAuthModalTab(tab || 'LOGIN'); setAuthModalOpen(true); }} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full">
        <div className="max-w-2xl mx-auto mb-4 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
            Employer &amp; Recruiter Registration
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
            Register your verified enterprise company profile to post vacancies, manage applications, and hire top talent.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <CompanySignUpCard 
            onSwitchToLogin={() => { setAuthModalTab('LOGIN'); setAuthModalOpen(true); }}
            onSwitchRole={() => router.push('/register?role=job_seeker')}
          />
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
        defaultRole="RECRUITER"
      />
    </div>
  );
}
