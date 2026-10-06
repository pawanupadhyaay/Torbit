'use client';
import React from 'react';
import Link from 'next/link';
import { Building2, RotateCw, Menu, LogOut } from 'lucide-react';

interface RecruiterTopbarProps {
  activeTab?: string;
  isApproved?: boolean;
  companyName?: string;
  gstNumber?: string;
  onOpenCreateJob?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function RecruiterTopbar({
  activeTab,
  isApproved,
  companyName,
  gstNumber,
  onOpenCreateJob,
  onRefresh,
  isRefreshing = false,
  onToggleMobileMenu
}: RecruiterTopbarProps) {
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('torbit_remember_me');
      localStorage.removeItem('torbit_last_active_role');
      localStorage.removeItem('torbit_session_saved_at');
      try { sessionStorage.clear(); } catch (e) {}
      window.location.href = '/?auth=login&role=recruiter';
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-2.5 px-4 sm:px-6 shrink-0 flex items-center justify-between shadow-2xs sticky top-0 z-30 font-['Helvetica',Arial,sans-serif]">
      <div className="flex items-center gap-2 md:hidden">
        <button
          onClick={onToggleMobileMenu}
          className="p-2 rounded-xl text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer border border-slate-200/60"
          title="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2.5 mx-auto md:mx-0">
        <Link
          href="/"
          className="flex items-center gap-2.5 group cursor-pointer"
          title="Go to Common Dashboard"
        >
          <img
            src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
            alt="Torbit Realty"
            className="h-6 sm:h-7.5 w-auto object-contain max-w-[150px] sm:max-w-[200px]"
          />
          <span className="bg-[#b2c359] text-[#080809] text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
            RECRUITER
          </span>
          {gstNumber && (
            <span className="hidden lg:inline-flex items-center gap-1 font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200">
              GSTIN: {gstNumber}
            </span>
          )}
        </Link>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 rounded-full text-[11px] font-bold tracking-tight shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync Active</span>
        </div>

        <button
          onClick={onRefresh}
          className="p-2 rounded-xl text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer border border-slate-200/60"
          title="Sync Live Data Now"
        >
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#b2c359]' : ''}`} />
        </button>

        <button
          onClick={handleSignOut}
          className="p-2 rounded-xl text-red-500 bg-red-50/80 hover:bg-red-100/80 active:scale-95 transition cursor-pointer border border-red-200/60 flex items-center gap-1 text-xs font-bold"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
