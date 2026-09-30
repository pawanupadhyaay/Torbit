'use client';
import React from 'react';
import Link from 'next/link';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

interface MobileBottomBarProps {
  onOpenAuth: (role?: 'JOB_SEEKER' | 'RECRUITER' | null, tab?: 'LOGIN' | 'REGISTER') => void;
  onSearchFocus?: () => void;
}

export default function MobileBottomBar({ onOpenAuth, onSearchFocus }: MobileBottomBarProps) {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 pt-1.5 pb-2 sm:py-2 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] font-['Helvetica',Arial,sans-serif] select-none">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* Home */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex flex-col items-center justify-center p-1 min-w-[56px] text-slate-700 hover:text-[#94C322] active:scale-95 transition group"
        >
          <HomeOutlinedIcon className="text-slate-700 group-hover:text-[#94C322]" sx={{ fontSize: 22 }} />
          <span className="text-[10.5px] font-bold mt-0.5 tracking-tight">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => {
            scrollTo('hero-search');
            onSearchFocus?.();
          }}
          className="flex flex-col items-center justify-center p-1 min-w-[56px] text-slate-700 hover:text-[#94C322] active:scale-95 transition group"
        >
          <SearchOutlinedIcon className="text-slate-700 group-hover:text-[#94C322]" sx={{ fontSize: 22 }} />
          <span className="text-[10.5px] font-bold mt-0.5 tracking-tight">Jobs</span>
        </button>

        {/* Center CTA: Post Job */}
        <Link
          href="/register?role=recruiter"
          className="flex flex-col items-center justify-center -mt-5 bg-[#080809] text-white p-2.5 rounded-full shadow-xl border-[2.5px] border-white hover:bg-slate-900 active:scale-90 transition group"
          aria-label="Post a Job"
        >
          <AddCircleOutlineOutlinedIcon className="text-[#94C322] group-hover:scale-110 transition" sx={{ fontSize: 22 }} />
          <span className="text-[9px] font-black text-[#94C322] mt-0.5 leading-none uppercase tracking-wider">POST</span>
        </Link>

        {/* Categories */}
        <button
          onClick={() => scrollTo('popular-categories')}
          className="flex flex-col items-center justify-center p-1 min-w-[56px] text-slate-700 hover:text-[#94C322] active:scale-95 transition group"
        >
          <GridViewOutlinedIcon className="text-slate-700 group-hover:text-[#94C322]" sx={{ fontSize: 22 }} />
          <span className="text-[10.5px] font-bold mt-0.5 tracking-tight">Explore</span>
        </button>

        {/* Account / Login */}
        {onOpenAuth ? (
          <button
            type="button"
            onClick={() => onOpenAuth('JOB_SEEKER', 'LOGIN')}
            className="flex flex-col items-center justify-center p-1 min-w-[56px] text-slate-700 hover:text-[#94C322] active:scale-95 transition group cursor-pointer"
          >
            <PersonOutlineOutlinedIcon className="text-slate-700 group-hover:text-[#94C322]" sx={{ fontSize: 22 }} />
            <span className="text-[10.5px] font-bold mt-0.5 tracking-tight">Account</span>
          </button>
        ) : (
          <Link
            href="/login"
            className="flex flex-col items-center justify-center p-1 min-w-[56px] text-slate-700 hover:text-[#94C322] active:scale-95 transition group"
          >
            <PersonOutlineOutlinedIcon className="text-slate-700 group-hover:text-[#94C322]" sx={{ fontSize: 22 }} />
            <span className="text-[10.5px] font-bold mt-0.5 tracking-tight">Account</span>
          </Link>
        )}
      </div>
    </div>
  );
}
