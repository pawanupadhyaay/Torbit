'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/common/Header';
import Footer from '@/common/Footer';
import AuthModal from '@/common/AuthModal';
import SeekerSignUpCard from '@/job-seeker/SeekerSignUpCard';

export default function SeekerPortalPage() {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (stored && token) {
        const u = JSON.parse(stored);
        if (u.role === 'JOB_SEEKER') {
          router.replace('/seeker/dashboard');
        }
      }
    } catch (e) {}
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] font-['Helvetica',Arial,sans-serif]">
      <Header onOpenAuth={(role, tab) => { setAuthModalTab(tab || 'LOGIN'); setAuthModalOpen(true); }} />

      <main className="flex-1 max-w-7xl mx-auto px-4 py-4 sm:py-6 w-full">
        <div className="max-w-2xl mx-auto mb-4 text-center">
          <h1 className="text-xl sm:text-2xl font-['Helvetica',Arial,sans-serif] font-bold text-[#111827] tracking-tight">
            Job Seeker Registration &amp; Sign In
          </h1>
          <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 leading-relaxed">
            Create your verified candidate profile to apply directly for top hiring companies and career opportunities.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          <SeekerSignUpCard 
            onSwitchToLogin={() => { setAuthModalTab('LOGIN'); setAuthModalOpen(true); }}
            onSwitchRole={() => router.push('/register?role=recruiter')}
          />
        </div>
      </main>

      <Footer />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
        defaultRole="JOB_SEEKER"
      />
    </div>
  );
}
