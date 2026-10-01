'use client';
import React from 'react';
import Link from 'next/link';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';

interface SeekerTopbarProps {
  activeTab: string;
  profileName: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenMobileMenu?: () => void;
  onLogoClick?: () => void;
}

export default function SeekerTopbar({
  activeTab,
  profileName,
  onRefresh,
  isRefreshing = false,
  onOpenMobileMenu,
  onLogoClick
}: SeekerTopbarProps) {
  const handleLogoClick = (e: React.MouseEvent) => {
    if (onLogoClick) {
      e.preventDefault();
      onLogoClick();
    }
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 py-2.5 px-4 sm:px-6 shrink-0 flex items-center justify-between shadow-2xs sticky top-0 z-30 font-['Helvetica',Arial,sans-serif]">
      {/* Left: Hamburger (mobile) */}
      <div className="flex items-center gap-2 md:hidden">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="p-2 rounded-xl text-slate-700 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer border border-slate-200/60"
            title="Open Navigation Menu"
          >
            <MenuOutlinedIcon sx={{ fontSize: 20 }} />
          </button>
        )}
      </div>

      {/* Center: Desktop-style Logo with SEEKER Badge */}
      <div className="flex items-center gap-2.5 mx-auto md:mx-0">
        <Link
          href="/seeker/dashboard"
          onClick={handleLogoClick}
          className="flex items-center gap-2 group cursor-pointer"
          title="Go to Seeker Dashboard"
        >
          <img
            src="https://pub-eb6c1f57d56548118a8cce2abc2983f2.r2.dev/Assets/Torbit%20Logo.png"
            alt="Torbit Realty"
            className="h-6 sm:h-7.5 w-auto object-contain max-w-[150px] sm:max-w-[200px]"
          />
          <span className="bg-[#94C322] text-[#080809] text-[9px] font-black px-1.5 py-0.5 rounded tracking-wider uppercase shrink-0">
            SEEKER
          </span>
        </Link>
      </div>

      {/* Right: Live Sync & Refresh button */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50/90 border border-emerald-200/80 text-emerald-800 rounded-full text-[11px] font-bold tracking-tight shadow-2xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>Live Sync Active</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-xl text-slate-600 bg-slate-100/80 hover:bg-slate-200/80 active:scale-95 transition cursor-pointer border border-slate-200/60 flex items-center justify-center"
            title="Sync Live Data"
          >
            <RefreshOutlinedIcon
              sx={{ fontSize: 19 }}
              className={isRefreshing ? 'animate-spin text-[#94C322]' : ''}
            />
          </button>
        )}
      </div>
    </header>
  );
}
