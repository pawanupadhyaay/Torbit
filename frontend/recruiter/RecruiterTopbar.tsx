'use client';
import React from 'react';
import { Building2, RotateCw, Menu } from 'lucide-react';

interface RecruiterTopbarProps {
  activeTab?: string;
  isApproved?: boolean;
  companyName?: string;
  onOpenCreateJob?: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function RecruiterTopbar({
  activeTab,
  isApproved,
  companyName,
  onOpenCreateJob,
  onRefresh,
  isRefreshing = false,
  onToggleMobileMenu
}: RecruiterTopbarProps) {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-2.5 px-4 sm:px-6 shrink-0 flex items-center justify-between shadow-2xs sticky top-0 z-30">
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
        <div className="w-7 h-7 rounded-lg bg-[#080809] flex items-center justify-center text-white shadow-xs">
          <Building2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-bold text-[#080809] tracking-tight uppercase">
            TORBIT<span className="text-slate-400 font-light">REALTY</span>
          </span>
          <span className="bg-[#94C322] text-[#080809] text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider uppercase">
            RECRUITER
          </span>
        </div>
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
          <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#94C322]' : ''}`} />
        </button>
      </div>
    </header>
  );
}
